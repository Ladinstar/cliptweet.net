import ytDlp from 'yt-dlp-exec';
import PQueue from 'p-queue';
import { mkdtemp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config, cookiesStatus } from '../config.js';
import { getCollections } from '../db.js';
import { logger } from '../logger.js';
import { cacheGet, cacheSet } from '../cache.js';
import { recordOutcome } from './monitoring.service.js';
import { badRequest, forbidden, notFound, serverError } from '../utils/httpError.js';

const queue = new PQueue({ concurrency: config.download.concurrency });

/** Sanitize a title into a safe download filename (no extension). */
export function sanitizeFilename(name, fallback = 'twitter-video') {
  const clean = String(name || '')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
  return clean || fallback;
}

// Inject the cookies file to authenticate yt-dlp (age-restricted / login-gated
// videos). Only when the file actually exists — a missing path is silently
// skipped (guest mode) rather than passed to yt-dlp, which would error out.
function ytdlpOptions(options) {
  const { exists, path } = cookiesStatus();
  return exists ? { ...options, cookies: path } : options;
}

// Reject (for the user) if yt-dlp hangs longer than `ms`.
function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function runYtDlp(url, options, ms) {
  return queue.add(() =>
    withTimeout(ytDlp(url, ytdlpOptions(options)), ms, 'yt-dlp').then(
      (result) => {
        void recordOutcome(true);
        return result;
      },
      (error) => {
        void recordOutcome(false);
        throw error;
      },
    ),
  );
}

/**
 * Validates that the URL points to a supported platform and returns { platform, normalizedUrl }.
 * Throws a 400 HttpError otherwise. Guards against SSRF (only whitelisted hosts).
 */
export function parseSourceUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw badRequest('Lien vidéo requis.');
  }

  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw badRequest('URL invalide.');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw badRequest('Protocole non autorisé.');
  }

  const host = parsed.hostname.toLowerCase();
  const platform = config.download.platforms.find((p) => p.hosts.includes(host));
  if (!platform) {
    throw badRequest('Plateforme non supportée (Twitter/X, YouTube, Reddit, Instagram, TikTok, Facebook).');
  }

  if (parsed.pathname.replace(/\/+$/, '').length < 2) {
    throw badRequest('Lien invalide : aucun contenu identifié.');
  }

  return { platform: platform.id, normalizedUrl: parsed.toString() };
}

// Backwards-compatible alias.
export const parseTweetUrl = parseSourceUrl;

/**
 * True when a media URL lives on a cookie-bound CDN that the /media proxy
 * cannot fetch (e.g. TikTok signs URLs against a tt_chain_token cookie).
 * Such formats must go through the server-side yt-dlp download path.
 */
export function requiresServerFetch(rawUrl) {
  if (!rawUrl) return false;
  let host;
  try {
    host = new URL(rawUrl).hostname.toLowerCase();
  } catch {
    return true;
  }
  return config.download.cookieBoundMediaHostSuffixes.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
}

const FORMAT_ID_RE = /^[A-Za-z0-9_+.-]+$/;

export function selectFormat({ format, quality, formatId }) {
  // An explicit yt-dlp format id (from /api/formats) takes precedence.
  if (formatId) {
    if (!FORMAT_ID_RE.test(formatId)) {
      throw badRequest('Identifiant de format invalide.');
    }
    return formatId;
  }
  // Prefer a *progressive* (http/https) muxed MP4 so the resolved URL is a single
  // downloadable file. Twitter also exposes HLS (.m3u8) variants — those are manifests,
  // not playable files, so we only fall back to them as a last resort.
  if (format === 'mp3') {
    return 'bestaudio[protocol^=http]/bestaudio/best';
  }
  if (quality === 'low') {
    return 'worst[protocol^=http][ext=mp4]/worst[ext=mp4]/worst';
  }
  return 'best[protocol^=http][ext=mp4]/best[ext=mp4]/best';
}

function buildYtDlpOptions(selector) {
  return {
    dumpJson: true,
    noWarnings: true,
    noCallHome: true,
    skipDownload: true,
    socketTimeout: Math.ceil(config.download.timeoutMs / 1000),
    format: selector,
  };
}

/**
 * Lists the downloadable progressive (non-HLS) MP4 qualities for a tweet,
 * with their approximate file sizes, so the client can let the user choose.
 */
export async function listFormats(tweetUrl) {
  const { platform, normalizedUrl } = parseSourceUrl(tweetUrl);
  const { errors } = getCollections();

  const cacheKey = `formats:${normalizedUrl}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const result = await runYtDlp(
      normalizedUrl,
      {
        dumpJson: true,
        noWarnings: true,
        noCallHome: true,
        skipDownload: true,
        socketTimeout: Math.ceil(config.download.timeoutMs / 1000),
      },
      config.download.timeoutMs,
    );

    // Keep http(s) MP4 with a video height. A format is "muxed" (directly downloadable)
    // when it has audio; video-only DASH formats (acodec 'none') need server-side merge.
    const candidates = (result?.formats || []).filter(
      (f) => String(f.protocol || '').startsWith('http') && f.ext === 'mp4' && f.height,
    );
    const hasAudio = (f) => f.acodec !== 'none';
    // One entry per resolution, preferring a muxed format over a merge-only one.
    const byHeight = new Map();
    for (const f of candidates) {
      const cur = byHeight.get(f.height);
      if (!cur) {
        byHeight.set(f.height, f);
        continue;
      }
      const better =
        (hasAudio(f) && !hasAudio(cur)) || (hasAudio(f) === hasAudio(cur) && (f.tbr || 0) > (cur.tbr || 0));
      if (better) byHeight.set(f.height, f);
    }
    const formats = [...byHeight.values()]
      .map((f) => ({
        id: f.format_id,
        width: f.width || null,
        height: f.height || null,
        resolution: f.resolution || (f.width && f.height ? `${f.width}x${f.height}` : 'mp4'),
        ext: f.ext,
        filesizeBytes: f.filesize || f.filesize_approx || null,
        tbr: f.tbr ? Math.round(f.tbr) : null,
        url: f.url || null,
        // "needsMerge" really means "must be fetched server-side via yt-dlp":
        // video-only DASH needs an audio merge, and cookie-bound CDNs can't be
        // streamed by the /media proxy at all.
        needsMerge: !hasAudio(f) || requiresServerFetch(f.url),
      }))
      .sort((a, b) => (b.height || 0) - (a.height || 0));

    const payload = {
      title: result?.title || 'Video',
      uploader: result?.uploader || result?.uploader_id || null,
      thumbnail: result?.thumbnail || null,
      durationSeconds: result?.duration || null,
      platform,
      formats,
    };
    await cacheSet(cacheKey, payload);
    return payload;
  } catch (error) {
    const message = error?.stderr || error?.message || 'Erreur inconnue';
    logger.warn({ err: message, url: normalizedUrl }, 'Format listing failed');
    await errors.insertOne({
      url: normalizedUrl,
      message: String(message).slice(0, 2000),
      timestamp: new Date().toISOString(),
    });
    throw mapExtractionError(message, 'Impossible de récupérer les qualités, vérifiez le lien ou réessayez.');
  }
}

/**
 * Translate well-known yt-dlp failures into actionable user-facing errors
 * instead of a generic 500 ("it's the video, not the service").
 */
export function mapExtractionError(stderr, fallback) {
  const msg = String(stderr);
  if (/Sign in to confirm your age|age.restricted|inappropriate for some users/i.test(msg)) {
    return forbidden("Cette vidéo est soumise à une restriction d'âge : la plateforme exige une connexion pour y accéder, nous ne pouvons pas la récupérer.");
  }
  if (/Private video|This post is private|private account/i.test(msg)) {
    return forbidden('Cette vidéo est privée et ne peut pas être téléchargée.');
  }
  if (/Video unavailable|This post is unavailable|has been deleted|no longer available|404/i.test(msg)) {
    return notFound("Cette vidéo n'existe plus ou n'est pas accessible.");
  }
  if (/available in your country|geo.?restricted|blocked it in your country/i.test(msg)) {
    return forbidden("Cette vidéo est bloquée géographiquement et n'est pas accessible depuis nos serveurs.");
  }
  if (/confirm you.?re not a bot|to confirm you are not a robot/i.test(msg)) {
    return serverError('La plateforme limite temporairement nos requêtes, réessayez dans quelques minutes.');
  }
  // Age/login-gated videos make yt-dlp probe many player clients (~2 min)
  // before failing — our timeout fires first, so surface the likely cause.
  if (/yt-dlp timeout/i.test(msg)) {
    return serverError("L'analyse a pris trop de temps : la vidéo est peut-être soumise à une restriction (âge, connexion requise) ou la plateforme répond lentement. Réessayez ou utilisez un autre lien.");
  }
  return serverError(fallback);
}

function pickDownloadUrl(result) {
  const requested = result?.requested_formats;
  const video = requested?.find((item) => item.ext === 'mp4') || requested?.[0];
  return video?.url || result?.url || null;
}

export async function resolveDownload({ tweetUrl, format = 'mp4', quality = 'best', formatId = null }) {
  const { platform, normalizedUrl } = parseTweetUrl(tweetUrl);
  const selector = selectFormat({ format, quality, formatId });
  const { downloads, errors } = getCollections();

  try {
    const result = await runYtDlp(normalizedUrl, buildYtDlpOptions(selector), config.download.timeoutMs);

    const downloadUrl = pickDownloadUrl(result);
    if (!downloadUrl) {
      throw new Error('Aucune vidéo trouvée dans le tweet.');
    }

    const title = result?.title || 'Twitter Video';

    await downloads.insertOne({
      url: normalizedUrl,
      title,
      platform,
      format,
      quality,
      formatId,
      timestamp: new Date().toISOString(),
    });

    return { downloadUrl, title, format, quality };
  } catch (error) {
    const message = error?.stderr || error?.message || 'Erreur inconnue';
    logger.warn({ err: message, url: normalizedUrl }, 'Download resolution failed');

    await errors.insertOne({
      url: normalizedUrl,
      message: String(message).slice(0, 2000),
      timestamp: new Date().toISOString(),
    });

    throw mapExtractionError(message, 'Échec du téléchargement, vérifiez le lien ou réessayez plus tard.');
  }
}

/**
 * Validates a media CDN URL for the streaming proxy (anti-SSRF).
 */
export function assertAllowedMediaUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw badRequest('URL média invalide.');
  }
  if (parsed.protocol !== 'https:') {
    throw badRequest('Protocole média non autorisé.');
  }
  const host = parsed.hostname.toLowerCase();
  const allowed = config.download.allowedMediaHostSuffixes.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
  if (!allowed) {
    throw badRequest('Hôte média non autorisé.');
  }
  return parsed.toString();
}

/**
 * Downloads the tweet's audio and converts it to MP3 in a temp dir (needs ffmpeg).
 * Twitter only serves HLS audio, so a direct URL proxy isn't enough for MP3 —
 * we have to actually fetch + transcode server-side. Returns { dir, file, title }.
 * The caller is responsible for removing `dir` once the file has been streamed.
 */
export async function downloadAudioToTemp(tweetUrl, audioFormat = 'mp3') {
  // mp3 = re-encoded (universal); m4a = remuxed/copied from Twitter's AAC (faster, no re-encode).
  const ext = audioFormat === 'm4a' ? 'm4a' : 'mp3';
  const { platform, normalizedUrl } = parseTweetUrl(tweetUrl);
  const { downloads, errors } = getCollections();
  const dir = await mkdtemp(join(tmpdir(), 'tvd-'));

  try {
    const result = await runYtDlp(
      normalizedUrl,
      {
        noWarnings: true,
        noCallHome: true,
        noPlaylist: true,
        extractAudio: true,
        audioFormat: ext,
        ...(ext === 'mp3' ? { audioQuality: 0 } : {}),
        format: 'bestaudio/best',
        concurrentFragments: config.download.concurrentFragments,
        ...fastDownloadFlags(),
        output: join(dir, 'audio.%(ext)s'),
        printJson: true,
        socketTimeout: Math.ceil(config.download.timeoutMs / 1000),
      },
      config.download.audioTimeoutMs,
    );

    const files = await readdir(dir);
    const audio = files.find((name) => name.endsWith(`.${ext}`));
    if (!audio) {
      throw new Error('Conversion audio impossible.');
    }

    const title = result?.title || 'Twitter Audio';
    await downloads.insertOne({
      url: normalizedUrl,
      title,
      platform,
      format: ext,
      quality: 'audio',
      timestamp: new Date().toISOString(),
    });

    return { dir, file: join(dir, audio), title, ext };
  } catch (error) {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
    const message = error?.stderr || error?.message || 'Erreur inconnue';
    logger.warn({ err: message, url: normalizedUrl }, 'Audio download failed');
    await errors.insertOne({
      url: normalizedUrl,
      message: String(message).slice(0, 2000),
      timestamp: new Date().toISOString(),
    });
    throw mapExtractionError(message, "Échec de l'extraction audio, vérifiez le lien ou réessayez.");
  }
}

/**
 * Extra yt-dlp flags for big downloads: aria2c with parallel connections when
 * available (strongest against YouTube's per-connection throttling), otherwise
 * chunked native downloads.
 */
function fastDownloadFlags() {
  if (config.download.aria2cPath) {
    return {
      downloader: config.download.aria2cPath,
      downloaderArgs: 'aria2c:-x 16 -s 16 -k 1M --summary-interval=0',
    };
  }
  return { httpChunkSize: config.download.httpChunkSize };
}

/**
 * Downloads a (usually DASH, audio-less) video format together with the best audio and
 * merges them into a single MP4 in a temp dir (needs ffmpeg). Used for HD/4K on YouTube,
 * Reddit, etc. where no progressive muxed file exists. Caller removes `dir` after streaming.
 */
export async function downloadMergedToTemp(tweetUrl, formatId) {
  const { platform, normalizedUrl } = parseSourceUrl(tweetUrl);
  if (!FORMAT_ID_RE.test(formatId)) {
    throw badRequest('Identifiant de format invalide.');
  }
  const { downloads, errors } = getCollections();
  const dir = await mkdtemp(join(tmpdir(), 'tvd-'));

  try {
    const result = await runYtDlp(
      normalizedUrl,
      {
        noWarnings: true,
        noCallHome: true,
        noPlaylist: true,
        format: `${formatId}+bestaudio/best`,
        mergeOutputFormat: 'mp4',
        concurrentFragments: config.download.concurrentFragments,
        ...fastDownloadFlags(),
        output: join(dir, 'video.%(ext)s'),
        printJson: true,
        socketTimeout: Math.ceil(config.download.timeoutMs / 1000),
      },
      config.download.mergeTimeoutMs,
    );

    const files = await readdir(dir);
    const mp4 = files.find((name) => name.endsWith('.mp4')) || files[0];
    if (!mp4) {
      throw new Error('Fusion vidéo impossible.');
    }

    const title = result?.title || 'Video';
    await downloads.insertOne({
      url: normalizedUrl,
      title,
      platform,
      format: 'mp4',
      quality: `merge:${formatId}`,
      timestamp: new Date().toISOString(),
    });

    return { dir, file: join(dir, mp4), title };
  } catch (error) {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
    const message = error?.stderr || error?.message || 'Erreur inconnue';
    logger.warn({ err: message, url: normalizedUrl }, 'Video merge failed');
    await errors.insertOne({
      url: normalizedUrl,
      message: String(message).slice(0, 2000),
      timestamp: new Date().toISOString(),
    });
    throw mapExtractionError(message, 'Échec de la fusion vidéo, réessayez ou choisissez une autre qualité.');
  }
}

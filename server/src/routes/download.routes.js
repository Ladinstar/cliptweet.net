import { Router } from 'express';
import { createReadStream } from 'node:fs';
import { rm, stat } from 'node:fs/promises';
import {
  resolveDownload,
  listFormats,
  assertAllowedMediaUrl,
  downloadAudioToTemp,
  downloadMergedToTemp,
  sanitizeFilename,
} from '../services/download.service.js';
import { getPublicStats } from '../services/stats.service.js';
import { downloadLimiter, audioLimiter, videoLimiter } from '../middlewares/rateLimit.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config.js';

export const downloadRouter = Router();

downloadRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    res.json(await getPublicStats());
  }),
);

downloadRouter.post(
  '/formats',
  downloadLimiter,
  asyncHandler(async (req, res) => {
    const { tweetUrl } = req.body;
    res.json(await listFormats(tweetUrl));
  }),
);

downloadRouter.post(
  '/download',
  downloadLimiter,
  asyncHandler(async (req, res) => {
    const { tweetUrl, format = 'mp4', quality = 'best', formatId = null } = req.body;
    const result = await resolveDownload({ tweetUrl, format, quality, formatId });
    res.json(result);
  }),
);

// Server-side MP3 extraction (yt-dlp + ffmpeg) streamed to the browser.
downloadRouter.get(
  '/audio',
  audioLimiter,
  asyncHandler(async (req, res) => {
    const audioFormat = req.query.format === 'm4a' ? 'm4a' : 'mp3';
    const { dir, file, title, ext } = await downloadAudioToTemp(String(req.query.url || ''), audioFormat);
    const cleanup = () => rm(dir, { recursive: true, force: true }).catch(() => {});
    const name = sanitizeFilename(title, 'twitter-audio');

    try {
      const { size } = await stat(file);
      res.setHeader('Content-Type', ext === 'm4a' ? 'audio/mp4' : 'audio/mpeg');
      res.setHeader('Content-Length', size);
      res.setHeader('Content-Disposition', `attachment; filename="${name}.${ext}"`);
    } catch {
      cleanup();
      res.status(500).json({ error: 'Audio indisponible.' });
      return;
    }

    const stream = createReadStream(file);
    stream.on('error', cleanup);
    stream.on('close', cleanup);
    res.on('close', cleanup);
    stream.pipe(res);
  }),
);

// Server-side video+audio merge (yt-dlp + ffmpeg) for HD/4K DASH formats.
downloadRouter.get(
  '/video',
  videoLimiter,
  asyncHandler(async (req, res) => {
    const { dir, file, title } = await downloadMergedToTemp(
      String(req.query.url || ''),
      String(req.query.formatId || ''),
    );
    const cleanup = () => rm(dir, { recursive: true, force: true }).catch(() => {});
    const name = sanitizeFilename(title);

    try {
      const { size } = await stat(file);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Length', size);
      res.setHeader('Content-Disposition', `attachment; filename="${name}.mp4"`);
    } catch {
      cleanup();
      res.status(500).json({ error: 'Vidéo indisponible.' });
      return;
    }

    const stream = createReadStream(file);
    stream.on('error', cleanup);
    stream.on('close', cleanup);
    res.on('close', cleanup);
    stream.pipe(res);
  }),
);

// Streaming proxy: pipes the validated CDN media through our server so the
// browser gets a reliable download (avoids CORS / expiring-link issues).
// Forwards Range requests so seeking and resumable downloads work.
downloadRouter.get(
  '/media',
  downloadLimiter,
  asyncHandler(async (req, res) => {
    const src = assertAllowedMediaUrl(String(req.query.src || ''));
    const filename = (String(req.query.filename || 'twitter-video') + '.mp4').replace(/[^\w.-]/g, '_');
    const range = req.headers.range;

    const upstream = await fetch(src, { headers: range ? { Range: range } : {} });
    if (!upstream.ok || !upstream.body) {
      res.status(502).json({ error: 'Média indisponible.' });
      return;
    }

    // Anti-abuse: refuse oversized media so we're not a free bandwidth proxy.
    const declared = Number(upstream.headers.get('content-length') || 0);
    if (declared && declared > config.download.maxMediaBytes) {
      res.status(413).json({ error: 'Fichier trop volumineux.' });
      return;
    }

    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    for (const header of ['content-length', 'content-range']) {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    }
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const { Readable } = await import('node:stream');
    Readable.fromWeb(upstream.body).pipe(res);
  }),
);

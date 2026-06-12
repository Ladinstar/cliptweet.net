import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { promisify } from 'node:util';
import { logger } from '../logger.js';

const execFileAsync = promisify(execFile);

// Resolve the real yt-dlp binary path shipped with yt-dlp-exec (same one it spawns).
const require = createRequire(import.meta.url);
export const YT_DLP_PATH = require('yt-dlp-exec/src/constants.js').YOUTUBE_DL_PATH;

let cachedVersion = null;

/** Returns the installed yt-dlp version (cached). null if the binary can't be queried. */
export async function getYtDlpVersion() {
  if (cachedVersion) return cachedVersion;
  try {
    const { stdout } = await execFileAsync(YT_DLP_PATH, ['--version'], { timeout: 10_000 });
    cachedVersion = stdout.trim() || null;
    return cachedVersion;
  } catch (err) {
    logger.warn({ err: err?.message }, 'Unable to read yt-dlp version');
    return null;
  }
}

/**
 * Self-updates the yt-dlp binary at runtime (best-effort). X/YouTube break the
 * extractor between image builds, so we refresh on boot. Failures (read-only FS,
 * no network) are non-fatal: the build-time binary still works.
 */
export async function updateYtDlp() {
  try {
    const { stdout } = await execFileAsync(YT_DLP_PATH, ['-U'], { timeout: 60_000 });
    cachedVersion = null; // force re-read after update
    const version = await getYtDlpVersion();
    logger.info({ version, detail: stdout.trim().split('\n').pop() }, 'yt-dlp update check complete');
    return version;
  } catch (err) {
    logger.warn({ err: err?.message }, 'yt-dlp self-update skipped (non-fatal)');
    return null;
  }
}

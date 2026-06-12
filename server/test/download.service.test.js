import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSourceUrl,
  parseTweetUrl,
  assertAllowedMediaUrl,
  requiresServerFetch,
  mapExtractionError,
} from '../src/services/download.service.js';

test('parseSourceUrl accepts a valid x.com tweet', () => {
  const { platform, normalizedUrl } = parseSourceUrl('https://x.com/user/status/1234567890');
  assert.equal(platform, 'twitter');
  assert.match(normalizedUrl, /x\.com\/user\/status\/1234567890/);
});

test('parseSourceUrl accepts other supported platforms', () => {
  assert.equal(parseSourceUrl('https://www.reddit.com/r/x/comments/abc/title/').platform, 'reddit');
  assert.equal(parseSourceUrl('https://www.tiktok.com/@u/video/123').platform, 'tiktok');
  assert.equal(parseSourceUrl('https://www.instagram.com/reel/abc/').platform, 'instagram');
  assert.equal(parseSourceUrl('https://www.youtube.com/watch?v=abc123').platform, 'youtube');
  assert.equal(parseSourceUrl('https://youtu.be/abc123').platform, 'youtube');
});

test('parseSourceUrl rejects non-whitelisted hosts (anti-SSRF)', () => {
  assert.throws(() => parseSourceUrl('https://evil.com/status/123'), /non support/i);
});

test('parseSourceUrl rejects a bare host with no content path', () => {
  assert.throws(() => parseSourceUrl('https://x.com/'), /aucun contenu/i);
});

test('parseSourceUrl rejects garbage input', () => {
  assert.throws(() => parseSourceUrl('not a url'), /invalide/);
  assert.throws(() => parseSourceUrl(''), /requis/);
});

test('parseTweetUrl alias still works', () => {
  assert.equal(parseTweetUrl('https://x.com/u/status/42').platform, 'twitter');
});

test('assertAllowedMediaUrl allows whitelisted CDN suffixes only', () => {
  assert.equal(assertAllowedMediaUrl('https://video.twimg.com/abc.mp4'), 'https://video.twimg.com/abc.mp4');
  assert.ok(assertAllowedMediaUrl('https://v.redd.it/abc/DASH_720.mp4'));
  assert.ok(assertAllowedMediaUrl('https://v16-webapp-prime.us.tiktok.com/video/abc.mp4'));
  assert.ok(assertAllowedMediaUrl('https://v16m-default.tiktokcdn-eu.com/abc.mp4'));
  assert.throws(() => assertAllowedMediaUrl('https://evil.com/x.mp4'), /non autorisé/);
  assert.throws(() => assertAllowedMediaUrl('https://eviltiktok.com/x.mp4'), /non autorisé/);
  assert.throws(() => assertAllowedMediaUrl('http://video.twimg.com/x.mp4'), /non autorisé/);
});

test('mapExtractionError translates known yt-dlp failures', () => {
  const age = mapExtractionError('ERROR: [youtube] abc: Sign in to confirm your age. This video may be inappropriate for some users.', 'fallback');
  assert.equal(age.status, 403);
  assert.match(age.message, /restriction d'âge/);

  const priv = mapExtractionError('ERROR: Private video. Sign in if you have access.', 'fallback');
  assert.equal(priv.status, 403);

  const gone = mapExtractionError('ERROR: Video unavailable. This video has been removed.', 'fallback');
  assert.equal(gone.status, 404);

  const geo = mapExtractionError('ERROR: The uploader has not made this video available in your country', 'fallback');
  assert.equal(geo.status, 403);

  const bot = mapExtractionError("Sign in to confirm you're not a bot.", 'fallback');
  assert.equal(bot.status, 500);
  assert.match(bot.message, /réessayez/);

  const timeout = mapExtractionError('yt-dlp timeout', 'fallback');
  assert.equal(timeout.status, 500);
  assert.match(timeout.message, /restriction|trop de temps/);

  const unknown = mapExtractionError('ERROR: something exotic', 'message générique');
  assert.equal(unknown.status, 500);
  assert.equal(unknown.message, 'message générique');
});

test('requiresServerFetch flags cookie-bound CDNs only', () => {
  assert.equal(requiresServerFetch('https://v16-webapp-prime.us.tiktok.com/video/abc?tk=tt_chain_token'), true);
  assert.equal(requiresServerFetch('https://video.twimg.com/abc.mp4'), false);
  assert.equal(requiresServerFetch('https://v.redd.it/abc/DASH_720.mp4'), false);
  assert.equal(requiresServerFetch(null), false);
  assert.equal(requiresServerFetch('not-a-url'), true);
});

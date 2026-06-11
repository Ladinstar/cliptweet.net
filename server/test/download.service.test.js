import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSourceUrl, parseTweetUrl, assertAllowedMediaUrl } from '../src/services/download.service.js';

test('parseSourceUrl accepts a valid x.com tweet', () => {
  const { platform, normalizedUrl } = parseSourceUrl('https://x.com/user/status/1234567890');
  assert.equal(platform, 'twitter');
  assert.match(normalizedUrl, /x\.com\/user\/status\/1234567890/);
});

test('parseSourceUrl accepts other supported platforms', () => {
  assert.equal(parseSourceUrl('https://www.reddit.com/r/x/comments/abc/title/').platform, 'reddit');
  assert.equal(parseSourceUrl('https://www.tiktok.com/@u/video/123').platform, 'tiktok');
  assert.equal(parseSourceUrl('https://www.instagram.com/reel/abc/').platform, 'instagram');
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
  assert.throws(() => assertAllowedMediaUrl('https://evil.com/x.mp4'), /non autorisé/);
  assert.throws(() => assertAllowedMediaUrl('http://video.twimg.com/x.mp4'), /non autorisé/);
});

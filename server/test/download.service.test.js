import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTweetUrl, assertAllowedMediaUrl } from '../src/services/download.service.js';

test('parseTweetUrl accepts a valid x.com tweet', () => {
  const { tweetId } = parseTweetUrl('https://x.com/user/status/1234567890');
  assert.equal(tweetId, '1234567890');
});

test('parseTweetUrl accepts twitter.com with query params', () => {
  const { tweetId } = parseTweetUrl('https://twitter.com/u/status/42?s=20');
  assert.equal(tweetId, '42');
});

test('parseTweetUrl rejects non-whitelisted hosts (anti-SSRF)', () => {
  assert.throws(() => parseTweetUrl('https://evil.com/status/123'), /Twitter\/X/);
});

test('parseTweetUrl rejects a tweet URL without a status id', () => {
  assert.throws(() => parseTweetUrl('https://x.com/user'), /invalide/);
});

test('parseTweetUrl rejects garbage input', () => {
  assert.throws(() => parseTweetUrl('not a url'), /invalide/);
  assert.throws(() => parseTweetUrl(''), /requis/);
});

test('assertAllowedMediaUrl allows the twitter video CDN only', () => {
  const url = assertAllowedMediaUrl('https://video.twimg.com/abc.mp4');
  assert.equal(url, 'https://video.twimg.com/abc.mp4');
  assert.throws(() => assertAllowedMediaUrl('https://evil.com/x.mp4'), /non autorisé/);
  assert.throws(() => assertAllowedMediaUrl('http://video.twimg.com/x.mp4'), /non autorisé/);
});

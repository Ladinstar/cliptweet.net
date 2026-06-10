import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectFormat, sanitizeFilename } from '../src/services/download.service.js';

test('selectFormat prefers progressive mp4 for best', () => {
  assert.match(selectFormat({ format: 'mp4', quality: 'best' }), /best\[protocol\^=http\]\[ext=mp4\]/);
});

test('selectFormat picks worst progressive for low', () => {
  assert.match(selectFormat({ format: 'mp4', quality: 'low' }), /worst\[protocol\^=http\]\[ext=mp4\]/);
});

test('selectFormat uses bestaudio for mp3', () => {
  assert.match(selectFormat({ format: 'mp3' }), /bestaudio/);
});

test('selectFormat passes through a valid explicit format id', () => {
  assert.equal(selectFormat({ formatId: 'http-2176' }), 'http-2176');
});

test('selectFormat rejects an injected format id', () => {
  assert.throws(() => selectFormat({ formatId: 'http; rm -rf /' }), /invalide/);
});

test('sanitizeFilename strips unsafe chars and trims', () => {
  assert.equal(sanitizeFilename('Hello / World! 🎬'), 'Hello_World');
  assert.equal(sanitizeFilename(''), 'twitter-video');
  assert.equal(sanitizeFilename('', 'twitter-audio'), 'twitter-audio');
  assert.ok(sanitizeFilename('x'.repeat(200)).length <= 80);
});

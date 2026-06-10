import { describe, it, expect } from 'vitest';
import { formatBytes, buildMediaUrl, buildAudioUrl } from './api';

describe('formatBytes', () => {
  it('handles empty / zero', () => {
    expect(formatBytes(null)).toBe('—');
    expect(formatBytes(0)).toBe('—');
  });
  it('formats bytes, KB and MB', () => {
    expect(formatBytes(512)).toBe('512 o');
    expect(formatBytes(1536)).toBe('1.5 Ko');
    expect(formatBytes(26_406_000)).toBe('25 Mo');
  });
});

describe('buildMediaUrl', () => {
  it('encodes src and filename', () => {
    const url = buildMediaUrl('https://video.twimg.com/a b.mp4', 'my video');
    expect(url).toContain('/media?');
    expect(url).toContain('src=https%3A%2F%2Fvideo.twimg.com%2Fa+b.mp4');
    expect(url).toContain('filename=my+video');
  });
});

describe('buildAudioUrl', () => {
  it('encodes the tweet url', () => {
    const url = buildAudioUrl('https://x.com/u/status/1');
    expect(url).toContain('/audio?url=https%3A%2F%2Fx.com%2Fu%2Fstatus%2F1');
  });
});

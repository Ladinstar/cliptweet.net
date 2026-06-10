import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Twitter Video Downloader';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #0c4a6e 100%)',
        color: 'white',
        fontFamily: 'sans-serif',
        padding: 80,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 120, marginBottom: 20 }}>⬇️</div>
      <div style={{ fontSize: 64, fontWeight: 800 }}>Twitter Video Downloader</div>
      <div style={{ fontSize: 34, marginTop: 24, color: '#7dd3fc' }}>
        Download Twitter / X videos in MP4 — free, no sign-up
      </div>
    </div>,
    { ...size },
  );
}

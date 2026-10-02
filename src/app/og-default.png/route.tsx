import { ImageResponse } from 'next/og';

// 메타데이터가 참조하는 /og-default.png 기본 공유 이미지 (1200x630)
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 96px',
          background: '#FAFAFA',
          color: '#0A0A0A',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background: '#0A0A0A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="44" height="44" viewBox="0 0 32 32">
            <path
              d="M11 7v18M11 18a5 5 0 0 1 10 0v7"
              stroke="#FAFAFA"
              strokeWidth="3.4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 }}>
            hugdochi
          </div>
          <div style={{ marginTop: 28, fontSize: 40, color: '#737373' }}>
            Android · Kotlin · Mobile development
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer arc (C shape) */}
        <div
          style={{
            position: 'absolute',
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: '5px solid transparent',
            borderTopColor: '#3b82f6',
            borderLeftColor: '#8b5cf6',
            borderBottomColor: '#8b5cf6',
            top: 5,
            left: 3,
            display: 'flex',
          }}
        />
        {/* Teal center node */}
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#10b981',
            position: 'absolute',
            right: 5,
            top: 13,
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}

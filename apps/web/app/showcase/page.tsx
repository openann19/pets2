export default function Showcase() {
  return (
    <html>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
          <h1 style={{ color: '#333' }}>UI Showcase</h1>
          <p style={{ color: '#666' }}>Component showcase page working!</p>
          
          <div style={{ marginTop: '40px' }}>
            <h2>Buttons</h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button style={{ padding: '12px 24px', background: '#0066CC', color: 'white', border: 'none', borderRadius: '8px' }}>
                Primary
              </button>
              <button style={{ padding: '12px 24px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px' }}>
                Secondary
              </button>
              <button style={{ padding: '12px 24px', background: 'transparent', color: '#0066CC', border: '2px solid #0066CC', borderRadius: '8px' }}>
                Outline
              </button>
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h2>Badges</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', background: '#0066CC', color: 'white', borderRadius: '999px', fontSize: '14px' }}>
                Primary
              </span>
              <span style={{ padding: '4px 12px', background: '#059669', color: 'white', borderRadius: '999px', fontSize: '14px' }}>
                Success
              </span>
              <span style={{ padding: '4px 12px', background: '#DC2626', color: 'white', borderRadius: '999px', fontSize: '14px' }}>
                Danger
              </span>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


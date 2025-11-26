export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', color: '#000000', marginBottom: '1rem' }}>
          Fashion Boutique
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#666' }}>
          Welcome to our store - Discover amazing products
        </p>
      </header>
      
      <main>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{
              border: '1px solid #eee',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              <div style={{
                width: '100%',
                height: '200px',
                background: 'linear-gradient(135deg, #00000022, #3b82f622)',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem'
              }}>
                🛍️
              </div>
              <h3 style={{ margin: '0.5rem 0', color: '#000000' }}>Product {i}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Premium quality item</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>$99.00</p>
              <button style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}>
                Add to Cart
              </button>
            </div>
          ))}
        </section>
      </main>
      
      <footer style={{ marginTop: '4rem', textAlign: 'center', padding: '2rem', borderTop: '1px solid #eee', color: '#666' }}>
        <p>&copy; 2024 Fashion Boutique. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Powered by InflueMint</p>
      </footer>
    </div>
  );
}
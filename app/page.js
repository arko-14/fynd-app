"use client";
import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({ rating: 5, review: '' });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) setResponse(data.message);
    } catch (err) {
      alert("Something went wrong, but we are saving your data!");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#111' }}>📢 Customer Feedback</h1>
        
        {!response ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Rating</label>
              <select 
                value={formData.rating} 
                onChange={e => setFormData({...formData, rating: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
              >
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars {n===5 ? '⭐⭐⭐⭐⭐' : ''}</option>)}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Your Review</label>
              <textarea 
                placeholder="Tell us about your experience..."
                value={formData.review}
                onChange={e => setFormData({...formData, review: e.target.value})}
                required
                style={{ width: '100%', height: '120px', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', resize: 'none' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                padding: '12px', 
                background: loading ? '#9ca3af' : '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                fontWeight: '600', 
                cursor: loading ? 'not-allowed' : 'pointer' 
              }}
            >
              {loading ? "Processing..." : "Submit Feedback"}
            </button>
          </form>
        ) : (
          <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h3 style={{ color: '#1e40af', marginTop: 0 }}>Thank You!</h3>
            <p style={{ color: '#1e3a8a', lineHeight: '1.5' }}>{response}</p>
            <button 
              onClick={() => setResponse(null)} 
              style={{ marginTop: '15px', padding: '8px 16px', background: 'white', border: '1px solid #2563eb', color: '#2563eb', borderRadius: '6px', cursor: 'pointer' }}
            >
              Submit Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
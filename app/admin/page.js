"use client";
import { useEffect, useState } from 'react';

export default function Admin() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // 1. Define the fetch function
    const fetchReviews = async () => {
      try {
        // 'no-store' ensures we get fresh data every time (no caching)
        const res = await fetch(`/api/reviews?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        // Check if data is an array before setting state to avoid crashes
        if (Array.isArray(data)) {
          setReviews(data);
        }
      } catch (err) {
        console.error("Failed to fetch reviews");
      }
    };

    // 2. Fetch immediately when the page loads
    fetchReviews();

    // 3. Set up a 5-second auto-refresh timer
    const intervalId = setInterval(fetchReviews, 5000);

    // 4. Cleanup timer when you leave the page
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Admin Dashboard</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Live Mode: Updating every 5 seconds...
      </p>
      
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '20px' }}>
        <thead style={{ background: '#f0f0f0' }}>
          <tr>
            <th>Rating</th>
            <th>Review</th>
            <th>AI Summary</th>
            <th>Suggested Action</th>
          </tr>
        </thead>
        <tbody>
          {reviews.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>Waiting for submissions...</td>
            </tr>
          ) : (
            reviews.map((r, i) => (
              <tr key={i}>
                <td>{r.rating} ⭐</td>
                <td>{r.review}</td>
                <td>{r.ai_summary}</td>
                <td style={{ color: 'red', fontWeight: 'bold' }}>{r.ai_action}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
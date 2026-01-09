"use client";
import { useEffect, useState } from 'react';

export default function Admin() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => setReviews(data));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Admin Dashboard</h1>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: '#f0f0f0' }}>
          <tr>
            <th>Rating</th>
            <th>Review</th>
            <th>AI Summary</th>
            <th>Suggested Action</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r, i) => (
            <tr key={i}>
              <td>{r.rating} ⭐</td>
              <td>{r.review}</td>
              <td>{r.ai_summary}</td>
              <td style={{ color: 'red' }}>{r.ai_action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
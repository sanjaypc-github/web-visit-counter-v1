import React, { useState, useEffect } from 'react';
import './AnalyticsPage.css';

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    dailyStats: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/traffic/stats');
      const data = await response.json();
      
      // Process and sort the data by date
      const sortedData = data.historical.sort((a, b) => new Date(b._id) - new Date(a._id));
      setAnalyticsData({
        dailyStats: sortedData,
        loading: false,
        error: null
      });
    } catch (error) {
      setAnalyticsData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load analytics data'
      }));
    }
  };

  if (analyticsData.loading) {
    return <div className="loading">Loading analytics data...</div>;
  }

  if (analyticsData.error) {
    return <div className="error">{analyticsData.error}</div>;
  }

  return (
    <div className="analytics-page">
      <h1>Detailed Analytics</h1>
      
      <section className="daily-stats">
        <h2>Daily Activity Analysis</h2>
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Visits</th>
                <th>Unique Visitors</th>
                <th>Average View Time</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.dailyStats.map(day => (
                <tr key={day._id}>
                  <td>{new Date(day._id).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</td>
                  <td>{day.visits}</td>
                  <td>{day.uniqueVisitors.length}</td>
                  <td>{Math.round(day.avgViewDuration)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="terms-definitions">
        <h2>Understanding the Metrics</h2>
        <div className="definitions-grid">
          <div className="definition-card">
            <h3>Total Visits</h3>
            <p>The total number of page loads or visits to your website. Each time a user loads or refreshes the page, it counts as one visit.</p>
          </div>
          
          <div className="definition-card">
            <h3>Unique Visitors</h3>
            <p>The number of distinct individuals who have visited your website, determined by unique visitor IDs. Multiple visits from the same person count as one unique visitor.</p>
          </div>
          
          <div className="definition-card">
            <h3>Average View Time</h3>
            <p>The average duration (in seconds) that visitors spend on your website per visit. This helps measure engagement and content effectiveness.</p>
          </div>
          
          <div className="definition-card">
            <h3>Session</h3>
            <p>A continuous period of user activity on your website. A session ends when the user closes the tab/window or remains inactive for an extended period.</p>
          </div>

          <div className="definition-card">
            <h3>Bounce Rate</h3>
            <p>The percentage of visitors who navigate away from your website after viewing only one page. A lower bounce rate generally indicates better engagement.</p>
          </div>

          <div className="definition-card">
            <h3>Page Views</h3>
            <p>The total number of pages viewed across all visits. Multiple views of the same page by the same user are counted separately.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AnalyticsPage;

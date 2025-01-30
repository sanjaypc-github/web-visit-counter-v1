import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InsightsPage.css';

function InsightsPage() {
  const [insights, setInsights] = useState({
    dailyStats: [],
    loading: true,
    error: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/traffic/insights');
      const data = await response.json();
      setInsights({
        dailyStats: data.dailyStats,
        loading: false,
        error: null
      });
    } catch (error) {
      setInsights(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load insights'
      }));
    }
  };

  if (insights.loading) {
    return <div className="insights-loading">Loading insights...</div>;
  }

  if (insights.error) {
    return <div className="insights-error">{insights.error}</div>;
  }

  return (
    <div className="insights-container">
      <div className="insights-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
        <h1>Traffic Analytics Insights</h1>
      </div>

      <div className="daily-insights">
        <h2>Daily Analytics Overview</h2>
        <div className="insights-table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Visits</th>
                <th>Unique Visitors</th>
                <th>Avg. Time (s)</th>
                <th>Bounce Rate</th>
                <th>New Visitors</th>
              </tr>
            </thead>
            <tbody>
              {insights.dailyStats.map(day => (
                <tr key={day._id}>
                  <td>{new Date(day._id).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</td>
                  <td>{day.totalVisits}</td>
                  <td>{day.uniqueVisitors}</td>
                  <td>{Math.round(day.avgViewDuration)}</td>
                  <td>{Math.round(day.bounceRate)}%</td>
                  <td>{day.newVisitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="terms-explanation">
        <h2>Understanding the Metrics</h2>
        <div className="terms-grid">
          <div className="term-card">
            <h3>Total Visits</h3>
            <p>The total number of times your website has been accessed. Each page load or refresh by any visitor counts as a visit.</p>
          </div>

          <div className="term-card">
            <h3>Unique Visitors</h3>
            <p>The number of distinct individuals who have visited your website. Multiple visits from the same person are counted only once.</p>
          </div>

          <div className="term-card">
            <h3>Average View Time</h3>
            <p>The average duration (in seconds) that visitors spend on your website per visit. This metric helps measure content engagement.</p>
          </div>

          <div className="term-card">
            <h3>Bounce Rate</h3>
            <p>The percentage of visitors who navigate away from your site after viewing only one page. A lower bounce rate generally indicates better engagement.</p>
          </div>

          <div className="term-card">
            <h3>New Visitors</h3>
            <p>First-time visitors to your website. This helps track the growth of your audience and the effectiveness of your marketing efforts.</p>
          </div>

          <div className="term-card">
            <h3>Session Duration</h3>
            <p>The length of time a visitor remains active on your site. A session ends after 30 minutes of inactivity or when the browser is closed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightsPage;

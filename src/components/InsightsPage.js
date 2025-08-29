import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './InsightsPage.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/traffic/insights`);
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

  const { labels, visitsSeries, uniquesSeries, avgTimeSeries, bounceRateSeries, newVisitorsSeries } = useMemo(() => {
    const byDateDesc = insights.dailyStats || [];
    const byDateAsc = [...byDateDesc].reverse();
    const labels = byDateAsc.map(d => new Date(d._id).toLocaleDateString());
    return {
      labels,
      visitsSeries: byDateAsc.map(d => Math.max(0, (d.totalVisits || 0) - 1)),
      uniquesSeries: byDateAsc.map(d => d.uniqueVisitors || 0),
      avgTimeSeries: byDateAsc.map(d => Math.round(d.avgViewDuration || 0)),
      bounceRateSeries: byDateAsc.map(d => Math.round(d.bounceRate || 0)),
      newVisitorsSeries: byDateAsc.map(d => d.newVisitors || 0)
    };
  }, [insights.dailyStats]);

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

      <div className="charts-section">
        <h2>Visual Overview</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Daily Visits</h3>
            <Line
              data={{
                labels,
                datasets: [
                  {
                    label: 'Visits',
                    data: visitsSeries,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    tension: 0.3,
                    pointRadius: 2
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>

          <div className="chart-card">
            <h3>Unique Visitors</h3>
            <Line
              data={{
                labels,
                datasets: [
                  {
                    label: 'Unique Visitors',
                    data: uniquesSeries,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    tension: 0.3,
                    pointRadius: 2
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>

          <div className="chart-card">
            <h3>Average View Time (s)</h3>
            <Bar
              data={{
                labels,
                datasets: [
                  {
                    label: 'Avg Time (s)',
                    data: avgTimeSeries,
                    backgroundColor: 'rgba(155, 89, 182, 0.5)',
                    borderColor: '#9b59b6'
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>

          <div className="chart-card">
            <h3>Bounce Rate (%)</h3>
            <Line
              data={{
                labels,
                datasets: [
                  {
                    label: 'Bounce Rate',
                    data: bounceRateSeries,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    tension: 0.3,
                    pointRadius: 2
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: true, max: 100 } }
              }}
            />
          </div>

          <div className="chart-card">
            <h3>New Visitors</h3>
            <Bar
              data={{
                labels,
                datasets: [
                  {
                    label: 'New Visitors',
                    data: newVisitorsSeries,
                    backgroundColor: 'rgba(241, 196, 15, 0.5)',
                    borderColor: '#f1c40f'
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </div>
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
                  <td>{day.totalVisits-1}</td>
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

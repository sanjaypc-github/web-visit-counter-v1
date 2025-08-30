import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import InsightsPage from './components/InsightsPage';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const App = () => {
  const [visitorStats, setVisitorStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    avgViewDuration: 0,
    newVisitors: 0,
  });
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  const initializeVisitor = useCallback(async () => {
    try {
      let visitorId = localStorage.getItem('visitorId');
      const isNewVisitor = !visitorId;

      if (!visitorId) {
        visitorId = Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', visitorId);
        localStorage.setItem('firstVisit', new Date().toISOString());
      }

      const sessionId = Math.random().toString(36).substr(2, 9) + Date.now();

      if (!sessionStorage.getItem('currentSession')) {
        const response = await fetch(`${API_URL}/api/traffic/record-visit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visitorId,
            sessionId,
            pageUrl: window.location.pathname,
            referrer: document.referrer,
            isNewVisitor,
          }),
        });

        const data = await response.json();
        updateStats(data);
        sessionStorage.setItem('currentSession', sessionId);
      }

      const startTime = Date.now();

      const updateDuration = async () => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        try {
          await fetch(`${API_URL}/api/traffic/update-duration`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              duration,
            }),
          });
        } catch (error) {
          console.error('Error updating duration:', error);
        }
      };

      window.addEventListener('beforeunload', updateDuration);
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          updateDuration();
        }
      });

      fetchStats();
      const intervalId = setInterval(fetchStats, 30000);

      return () => {
        window.removeEventListener('beforeunload', updateDuration);
        window.removeEventListener('visibilitychange', updateDuration);
        clearInterval(intervalId);
        updateDuration();
      };
    } catch (error) {
      console.error('Error initializing visitor:', error);
      setLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/traffic/stats`);
      const data = await response.json();
      updateStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    } finally { }
  };

  const updateStats = (data) => {
    setVisitorStats({
      totalVisits: data.today.totalVisits,
      uniqueVisitors: data.today.uniqueVisitors.length,
      avgViewDuration: Math.round(data.today.avgViewDuration) || 0,
      newVisitors: data.today.newVisitors,
    });
    setHistoricalData(data.historical);
    setLoading(false);
  };

  const HomePage = () => {
    useEffect(() => {
      fetchStats();
      const intervalId = setInterval(fetchStats, 30000);

      return () => {
        clearInterval(intervalId);
      };
    }, []);

    return (
      <div className="container">
        <div className="header">
          <h1>Website Traffic Analytics</h1>
          <p className="subtitle">Real-time visitor tracking and analysis</p>
        </div>

        <div className="info-panel">
          <p className="info-text">
            👋 Welcome! Your visitor ID: <code>{localStorage.getItem('visitorId')}</code>
          </p>
          <p className="first-visit">
            First visit: {new Date(localStorage.getItem('firstVisit')).toLocaleString()}
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <h2>Today's Visits</h2>
            <p className="stat-value">{visitorStats.totalVisits}</p>
            <span className="stat-label">Total page loads</span>
          </div>

          <div className="stat-box">
            <h2>Unique Visitors</h2>
            <p className="stat-value">{visitorStats.uniqueVisitors}</p>
            <span className="stat-label">Distinct users today</span>
          </div>

          <div className="stat-box">
            <h2>Avg. View Time</h2>
            <p className="stat-value">{visitorStats.avgViewDuration}s</p>
            <span className="stat-label">Per visit</span>
          </div>

          <div className="stat-box">
            <h2>New Visitors</h2>
            <p className="stat-value">{visitorStats.newVisitors}</p>
            <span className="stat-label">First-time users</span>
          </div>
        </div>

        <div className="historical-data">
          <h2>Last 7 Days Traffic</h2>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Visits</th>
                  <th>Unique Visitors</th>
                  <th>Avg. View Time</th>
                </tr>
              </thead>
              <tbody>
                {historicalData.map((day) => (
                  <tr key={day._id}>
                    <td>{new Date(day._id).toLocaleDateString()}</td>
                    <td>{day.visits}</td>
                    <td>{day.uniqueVisitors.length}</td>
                    <td>{Math.round(day.avgViewDuration)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="show-insights">
          <Link to="/insights" className="insights-button">
            Show Detailed Insights
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Analytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/traffic/analytics');
            const data = await response.json();
            setAnalyticsData(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    if (!analyticsData) {
        return <div className="loading">Loading analytics...</div>;
    }

    const chartData = {
        labels: analyticsData.dailyData.map(data => 
            new Date(data.date).toLocaleDateString()
        ),
        datasets: [
            {
                label: 'Daily Visits',
                data: analyticsData.dailyData.map(data => data.visits),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1,
            },
            {
                label: 'Unique Visitors',
                data: analyticsData.dailyData.map(data => data.uniqueVisitors),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.1,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Website Traffic Analytics'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div className="analytics-container">
            <h2>Traffic Analytics Dashboard</h2>
            <div className="analytics-cards">
                <div className="analytics-card">
                    <h3>Total Visits (Last 7 Days)</h3>
                    <p>{analyticsData.totalVisits}</p>
                </div>
                <div className="analytics-card">
                    <h3>Avg Daily Visits</h3>
                    <p>{analyticsData.avgDailyVisits}</p>
                </div>
                <div className="analytics-card">
                    <h3>Avg View Time</h3>
                    <p>{Math.round(analyticsData.avgViewTime)}s</p>
                </div>
                <div className="analytics-card">
                    <h3>Total Unique Visitors</h3>
                    <p>{analyticsData.totalUniqueVisitors}</p>
                </div>
            </div>

            <div className="chart-container">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default Analytics;

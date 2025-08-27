import React, { useState, useEffect, useCallback } from 'react';
import { socketService } from '../../utils/socket';
import { apiCallHelper } from '../../redux/configHelpers';
import { notifyToast } from '../../utils/notifyToast';

const RealTimeDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalScores: 0,
        totalQuizzes: 0,
        totalDownloads: 0,
        lastUpdated: null
    });
    const [liveAnalytics, setLiveAnalytics] = useState({
        today: {
            newUsers: 0,
            newScores: 0,
            newQuizzes: 0
        },
        timestamp: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dashboard stats
    const fetchDashboardStats = useCallback(async () => {
        try {
            const response = await apiCallHelper('/api/statistics/dashboard-stats', 'GET');
            if (response.data) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Failed to load dashboard statistics');
        }
    }, []);

    // Fetch live analytics
    const fetchLiveAnalytics = useCallback(async () => {
        try {
            const response = await apiCallHelper('/api/statistics/live-analytics', 'GET');
            if (response.data) {
                setLiveAnalytics(response.data);
            }
        } catch (err) {
            console.error('Error fetching live analytics:', err);
        }
    }, []);

    // Handle real-time dashboard updates
    const handleDashboardUpdate = useCallback((data) => {
        console.log('Dashboard update received:', data);
        
        if (data.type === 'refresh' && data.data) {
            setStats(data.data);
        } else if (data.type === 'new_score') {
            setStats(prevStats => ({
                ...prevStats,
                totalScores: prevStats.totalScores + 1,
                lastUpdated: new Date().toISOString()
            }));
            
            setLiveAnalytics(prevAnalytics => ({
                ...prevAnalytics,
                today: {
                    ...prevAnalytics.today,
                    newScores: prevAnalytics.today.newScores + 1
                },
                timestamp: new Date().toISOString()
            }));
        }
    }, []);

    useEffect(() => {
        const initializeDashboard = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchDashboardStats(),
                    fetchLiveAnalytics()
                ]);
            } catch (err) {
                setError('Failed to initialize dashboard');
            } finally {
                setLoading(false);
            }
        };

        initializeDashboard();

        // Set up real-time listeners
        socketService.on('dashboard-stats-update', handleDashboardUpdate);

        // Refresh data periodically
        const refreshInterval = setInterval(() => {
            fetchLiveAnalytics();
        }, 60000); // Every minute

        return () => {
            socketService.off('dashboard-stats-update', handleDashboardUpdate);
            clearInterval(refreshInterval);
        };
    }, [fetchDashboardStats, fetchLiveAnalytics, handleDashboardUpdate]);

    const refreshStats = async () => {
        try {
            await apiCallHelper('/api/statistics/update-dashboard-stats', 'POST');
            notifyToast.success('Dashboard stats refreshed!');
        } catch (err) {
            notifyToast.error('Failed to refresh stats');
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="real-time-dashboard">
            <div className="dashboard-header">
                <h2>📊 Real-Time Dashboard</h2>
                <div className="dashboard-controls">
                    <button onClick={refreshStats} className="refresh-btn">
                        🔄 Refresh Stats
                    </button>
                    <div className="last-updated">
                        Last updated: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : 'Never'}
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card users">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>Total Users</h3>
                        <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
                        <div className="stat-change">
                            +{liveAnalytics.today.newUsers} today
                        </div>
                    </div>
                </div>

                <div className="stat-card scores">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <h3>Total Scores</h3>
                        <div className="stat-number">{stats.totalScores.toLocaleString()}</div>
                        <div className="stat-change">
                            +{liveAnalytics.today.newScores} today
                        </div>
                    </div>
                </div>

                <div className="stat-card quizzes">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <h3>Total Quizzes</h3>
                        <div className="stat-number">{stats.totalQuizzes.toLocaleString()}</div>
                        <div className="stat-change">
                            +{liveAnalytics.today.newQuizzes} today
                        </div>
                    </div>
                </div>

                <div className="stat-card downloads">
                    <div className="stat-icon">📥</div>
                    <div className="stat-content">
                        <h3>Total Downloads</h3>
                        <div className="stat-number">{stats.totalDownloads.toLocaleString()}</div>
                        <div className="stat-change">
                            Active today
                        </div>
                    </div>
                </div>
            </div>

            <div className="live-indicator">
                <div className="live-dot"></div>
                <span>Live updates enabled</span>
            </div>
        </div>
    );
};

export default RealTimeDashboard;

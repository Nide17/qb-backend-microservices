import { io } from 'socket.io-client'
import { notifySuccess, notifyError } from './notifyToast'

export const qbURL = 'https://myqb-245fdbd30c9b.herokuapp.com/'
export const qbTestURL = 'https://qb-test-c6396eeaa356.herokuapp.com/'
export const qbContactsAPI = 'https://qb-contacts-service-156b2230ac4f.herokuapp.com/'
export const apiURL = 'https://quiz-blog-rw-server.onrender.com/'
export const devApiURL = import.meta.env.VITE_REACT_APP_API_GATEWAY_URL || 'http://localhost:5000/'

// Always use API Gateway URL for socket connection since it now has socket.io support
const serverUrl = devApiURL

// Enhanced socket configuration with reconnection and error handling
export const socket = io(serverUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
    forceNew: true
});

// Socket event handlers
socket.on('connect', () => {
    console.log('🔌 Connected to server:', socket.id);
    notifySuccess('Connected to real-time updates');
});

socket.on('disconnect', (reason) => {
    console.log('🔌 Disconnected from server:', reason);
    if (reason === 'io server disconnect') {
        socket.connect();
    }
});

socket.on('connect_error', (error) => {
    console.error('🔌 Connection error:', error);
    notifyError('Connection error. Retrying...');
});

socket.on('reconnect', (attemptNumber) => {
    console.log('🔌 Reconnected after', attemptNumber, 'attempts');
    notifySuccess('Reconnected to server');
});

socket.on('reconnect_error', (error) => {
    console.error('🔌 Reconnection failed:', error);
});

// Real-time event handlers
class SocketService {
    constructor() {
        this.listeners = new Map();
        this.setupGlobalListeners();
    }

    setupGlobalListeners() {
        // Dashboard stats updates
        socket.on('dashboard-stats-update', (data) => {
            console.log('📊 Dashboard stats updated:', data);
            this.emit('dashboard-stats-update', data);
        });

        // Score updates
        socket.on('score-updated', (data) => {
            console.log('🎯 Score updated:', data);
            this.emit('score-updated', data);
            notifySuccess('Your score has been updated!');
        });

        // Leaderboard updates
        socket.on('leaderboard-update', (data) => {
            console.log('🏆 Leaderboard updated:', data);
            this.emit('leaderboard-update', data);
        });

        // Quiz progress updates
        socket.on('quiz-progress-update', (data) => {
            console.log('📝 Quiz progress updated:', data);
            this.emit('quiz-progress-update', data);
        });

        // Comment updates
        socket.on('comment-added', (data) => {
            console.log('💬 New comment added:', data);
            this.emit('comment-added', data);
        });
    }

    // Join user-specific room
    joinUserRoom(userId) {
        if (userId && socket.connected) {
            socket.emit('join-user-room', userId);
            console.log('👤 Joined user room:', userId);
        }
    }

    // Join quiz-specific room
    joinQuizRoom(quizId) {
        if (quizId && socket.connected) {
            socket.emit('join-quiz-room', quizId);
            console.log('📝 Joined quiz room:', quizId);
        }
    }

    // Send quiz progress
    sendQuizProgress(data) {
        if (socket.connected) {
            socket.emit('quiz-progress', data);
        }
    }

    // Send new comment
    sendComment(data) {
        if (socket.connected) {
            socket.emit('new-comment', data);
        }
    }

    // Send score update
    sendScoreUpdate(data) {
        if (socket.connected) {
            socket.emit('score-update', data);
        }
    }

    // Event listener management
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Socket event callback error:', error);
                }
            });
        }
    }

    // Clean up listeners
    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}

export const socketService = new SocketService();

// Auto-join user room when user is authenticated
if (typeof window !== 'undefined') {
    const checkAndJoinUserRoom = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user._id && socket.connected) {
            socketService.joinUserRoom(user._id);
        }
    };

    // Check on connection
    socket.on('connect', checkAndJoinUserRoom);
    
    // Check periodically if user changes
    setInterval(checkAndJoinUserRoom, 30000); // Every 30 seconds
}

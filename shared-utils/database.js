const mongoose = require('mongoose');

class DatabaseManager {
    constructor() {
        this.connections = new Map();
        this.defaultOptions = {
            maxPoolSize: 10,
            minPoolSize: 2,
            maxIdleTimeMS: 30000,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferMaxEntries: 0,
            bufferCommands: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
    }

    async connect(serviceName, mongoUri, options = {}) {
        try {
            // Check if connection already exists
            if (this.connections.has(serviceName)) {
                const connection = this.connections.get(serviceName);
                if (connection.readyState === 1) { // Connected
                    console.log(`[${serviceName}] Using existing database connection`);
                    return connection;
                }
            }

            console.log(`[${serviceName}] Connecting to MongoDB...`);

            const connectionOptions = { ...this.defaultOptions, ...options };
            const connection = await mongoose.createConnection(mongoUri, connectionOptions);

            // Connection event handlers
            connection.on('connected', () => {
                console.log(`[${serviceName}] MongoDB connected successfully`);
            });

            connection.on('error', (err) => {
                console.error(`[${serviceName}] MongoDB connection error:`, err);
            });

            connection.on('disconnected', () => {
                console.log(`[${serviceName}] MongoDB disconnected`);
            });

            connection.on('reconnected', () => {
                console.log(`[${serviceName}] MongoDB reconnected`);
            });

            // Store connection
            this.connections.set(serviceName, connection);

            return connection;
        } catch (error) {
            console.error(`[${serviceName}] Failed to connect to MongoDB:`, error);
            throw error;
        }
    }

    async disconnect(serviceName) {
        try {
            const connection = this.connections.get(serviceName);
            if (connection) {
                await connection.close();
                this.connections.delete(serviceName);
                console.log(`[${serviceName}] Database connection closed`);
            }
        } catch (error) {
            console.error(`[${serviceName}] Error closing database connection:`, error);
        }
    }

    async disconnectAll() {
        const disconnectPromises = Array.from(this.connections.keys()).map(
            serviceName => this.disconnect(serviceName)
        );
        await Promise.allSettled(disconnectPromises);
        console.log('All database connections closed');
    }

    getConnection(serviceName) {
        return this.connections.get(serviceName);
    }

    isConnected(serviceName) {
        const connection = this.connections.get(serviceName);
        return connection && connection.readyState === 1;
    }

    // Health check for all connections
    getHealthStatus() {
        const status = {};
        for (const [serviceName, connection] of this.connections) {
            status[serviceName] = {
                connected: connection.readyState === 1,
                readyState: connection.readyState,
                host: connection.host,
                port: connection.port,
                name: connection.name
            };
        }
        return status;
    }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

// Graceful shutdown handling
process.on('SIGINT', async () => {
    console.log('Received SIGINT, closing database connections...');
    await databaseManager.disconnectAll();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, closing database connections...');
    await databaseManager.disconnectAll();
    process.exit(0);
});

module.exports = databaseManager;

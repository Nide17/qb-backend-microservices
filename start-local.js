#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Services that can run without external dependencies
const coreServices = [
    { name: 'API Gateway', dir: 'api-gateway', port: 5000 },
    { name: 'Statistics', dir: 'statistics-service', port: 5011 }
];

// Services that need MongoDB (will create mock versions)
const mongoServices = [
    { name: 'Users', dir: 'users-service', port: 5001 },
    { name: 'Quizzing', dir: 'quizzing-service', port: 5002 },
    { name: 'Schools', dir: 'schools-service', port: 5004 },
    { name: 'Scores', dir: 'scores-service', port: 5006 },
    { name: 'Contacts', dir: 'contacts-service', port: 5008 },
    { name: 'Feedbacks', dir: 'feedbacks-service', port: 5009 },
    { name: 'Comments', dir: 'comments-service', port: 5010 }
];

// Services that need S3 configuration (will disable file uploads)
const s3Services = [
    { name: 'Posts', dir: 'posts-service', port: 5003 },
    { name: 'Courses', dir: 'courses-service', port: 5005 },
    { name: 'Downloads', dir: 'downloads-service', port: 5007 }
];

console.log('🚀 Starting QB Microservices for Local Development');
console.log('📋 This will start only the core services that work without external dependencies\n');

// Start API Gateway first
console.log('🌐 Starting API Gateway...');
const apiGateway = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'api-gateway'),
    stdio: 'inherit',
    shell: true
});

// Start Statistics service (doesn't need MongoDB)
setTimeout(() => {
    console.log('📊 Starting Statistics Service...');
    const stats = spawn('npm', ['run', 'statistics'], {
        cwd: path.join(__dirname, 'statistics-service'),
        stdio: 'inherit',
        shell: true
    });
}, 2000);

console.log('\n✅ Core services starting...');
console.log('🌐 API Gateway: http://localhost:5000');
console.log('📊 Statistics: http://localhost:5011');
console.log('\n⚠️  MongoDB-dependent services are disabled for local development');
console.log('⚠️  S3-dependent services are disabled for local development');
console.log('\n📝 To enable all services:');
console.log('   1. Set up local MongoDB or MongoDB Atlas');
console.log('   2. Configure AWS S3 credentials');
console.log('   3. Copy local-dev.env to .env in each service directory');
console.log('\n🛑 Press Ctrl+C to stop all services');

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down services...');
    apiGateway.kill('SIGINT');
    process.exit(0);
});

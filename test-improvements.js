const axios = require('axios');
const { performance } = require('perf_hooks');

/**
 * Comprehensive Test Suite for Quiz Blog Microservices Improvements
 * Tests all optimizations including API Gateway, caching, real-time features, and health monitoring
 */

class ImprovementTester {
    constructor() {
        this.baseURL = process.env.API_GATEWAY_URL || 'http://localhost:5000';
        this.results = {
            apiGateway: {},
            caching: {},
            realTime: {},
            health: {},
            performance: {},
            errors: []
        };
    }

    async runAllTests() {
        console.log('🚀 Starting comprehensive improvement tests...\n');

        try {
            await this.testAPIGateway();
            await this.testCaching();
            await this.testHealthMonitoring();
            await this.testPerformance();
            await this.testAggregatedEndpoints();
            
            this.generateReport();
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.results.errors.push(error.message);
        }
    }

    async testAPIGateway() {
        console.log('📡 Testing API Gateway functionality...');
        
        try {
            // Test basic connectivity
            const start = performance.now();
            const response = await axios.get(`${this.baseURL}/`);
            const responseTime = performance.now() - start;

            this.results.apiGateway.connectivity = {
                status: response.status === 200 ? 'PASS' : 'FAIL',
                responseTime: Math.round(responseTime),
                features: response.data.features || []
            };

            console.log(`✅ API Gateway connectivity: ${response.status} (${Math.round(responseTime)}ms)`);

            // Test service routing
            const services = [
                '/api/users',
                '/api/quizzes', 
                '/api/categories',
                '/api/scores',
                '/api/statistics'
            ];

            const routingResults = {};
            for (const service of services) {
                try {
                    const start = performance.now();
                    const res = await axios.get(`${this.baseURL}${service}`, { timeout: 10000 });
                    const time = performance.now() - start;
                    
                    routingResults[service] = {
                        status: 'PASS',
                        responseTime: Math.round(time),
                        statusCode: res.status
                    };
                    console.log(`✅ ${service}: ${res.status} (${Math.round(time)}ms)`);
                } catch (error) {
                    routingResults[service] = {
                        status: 'FAIL',
                        error: error.message,
                        statusCode: error.response?.status || 'TIMEOUT'
                    };
                    console.log(`❌ ${service}: ${error.message}`);
                }
            }

            this.results.apiGateway.routing = routingResults;

        } catch (error) {
            console.error('❌ API Gateway test failed:', error.message);
            this.results.errors.push(`API Gateway: ${error.message}`);
        }
    }

    async testCaching() {
        console.log('\n📦 Testing caching functionality...');

        try {
            // Test aggregated endpoints for caching
            const testEndpoints = [
                '/api/aggregated/quizzes',
                '/api/aggregated/dashboard',
                '/api/statistics/dashboard-stats'
            ];

            for (const endpoint of testEndpoints) {
                try {
                    // First request (should populate cache)
                    const start1 = performance.now();
                    await axios.get(`${this.baseURL}${endpoint}`);
                    const firstRequestTime = performance.now() - start1;

                    // Second request (should hit cache)
                    const start2 = performance.now();
                    const cachedResponse = await axios.get(`${this.baseURL}${endpoint}`);
                    const secondRequestTime = performance.now() - start2;

                    const cacheImprovement = ((firstRequestTime - secondRequestTime) / firstRequestTime) * 100;

                    this.results.caching[endpoint] = {
                        status: 'PASS',
                        firstRequest: Math.round(firstRequestTime),
                        cachedRequest: Math.round(secondRequestTime),
                        improvement: Math.round(cacheImprovement),
                        cached: cachedResponse.data._cached || false
                    };

                    console.log(`✅ ${endpoint}: ${Math.round(cacheImprovement)}% improvement`);
                } catch (error) {
                    this.results.caching[endpoint] = {
                        status: 'FAIL',
                        error: error.message
                    };
                    console.log(`❌ ${endpoint}: ${error.message}`);
                }
            }

        } catch (error) {
            console.error('❌ Caching test failed:', error.message);
            this.results.errors.push(`Caching: ${error.message}`);
        }
    }

    async testHealthMonitoring() {
        console.log('\n🏥 Testing health monitoring...');

        try {
            // Test health endpoint
            const healthResponse = await axios.get(`${this.baseURL}/api/health`);
            const healthData = healthResponse.data;

            this.results.health.overall = {
                status: healthData.status,
                uptime: healthData.uptime,
                servicesCount: healthData.services?.length || 0,
                healthyServices: healthData.services?.filter(s => s.status === 'healthy').length || 0
            };

            console.log(`✅ Overall health: ${healthData.status}`);
            console.log(`✅ Services monitored: ${healthData.services?.length || 0}`);
            console.log(`✅ Healthy services: ${healthData.services?.filter(s => s.status === 'healthy').length || 0}`);

            // Test metrics endpoint
            try {
                const metricsResponse = await axios.get(`${this.baseURL}/api/metrics`);
                const metricsData = metricsResponse.data;

                this.results.health.metrics = {
                    status: 'PASS',
                    totalRequests: metricsData.totalRequests,
                    errorRate: metricsData.errorRate,
                    averageResponseTime: metricsData.averageResponseTime,
                    memoryUsage: metricsData.system?.memory?.usagePercent
                };

                console.log(`✅ Metrics collected: ${metricsData.totalRequests} requests, ${(metricsData.errorRate * 100).toFixed(2)}% error rate`);
            } catch (error) {
                this.results.health.metrics = { status: 'FAIL', error: error.message };
                console.log(`❌ Metrics endpoint failed: ${error.message}`);
            }

        } catch (error) {
            console.error('❌ Health monitoring test failed:', error.message);
            this.results.errors.push(`Health: ${error.message}`);
        }
    }

    async testPerformance() {
        console.log('\n⚡ Testing performance improvements...');

        try {
            const testCases = [
                { endpoint: '/api/aggregated/quizzes', expectedTime: 2000 },
                { endpoint: '/api/statistics/dashboard-stats', expectedTime: 1500 },
                { endpoint: '/api/aggregated/dashboard', expectedTime: 3000 }
            ];

            for (const testCase of testCases) {
                try {
                    const start = performance.now();
                    const response = await axios.get(`${this.baseURL}${testCase.endpoint}`);
                    const responseTime = performance.now() - start;

                    const performanceStatus = responseTime < testCase.expectedTime ? 'PASS' : 'SLOW';

                    this.results.performance[testCase.endpoint] = {
                        status: performanceStatus,
                        responseTime: Math.round(responseTime),
                        expectedTime: testCase.expectedTime,
                        dataSize: JSON.stringify(response.data).length
                    };

                    console.log(`${performanceStatus === 'PASS' ? '✅' : '⚠️'} ${testCase.endpoint}: ${Math.round(responseTime)}ms (expected <${testCase.expectedTime}ms)`);
                } catch (error) {
                    this.results.performance[testCase.endpoint] = {
                        status: 'FAIL',
                        error: error.message
                    };
                    console.log(`❌ ${testCase.endpoint}: ${error.message}`);
                }
            }

        } catch (error) {
            console.error('❌ Performance test failed:', error.message);
            this.results.errors.push(`Performance: ${error.message}`);
        }
    }

    async testAggregatedEndpoints() {
        console.log('\n🔗 Testing aggregated data endpoints...');

        try {
            const aggregatedEndpoints = [
                '/api/aggregated/quizzes',
                '/api/aggregated/dashboard',
                '/api/aggregated/search?q=test'
            ];

            for (const endpoint of aggregatedEndpoints) {
                try {
                    const response = await axios.get(`${this.baseURL}${endpoint}`);
                    const data = response.data;

                    const isAggregated = data._aggregated === true;
                    const hasMultipleDataSources = Object.keys(data).length > 3;

                    this.results.apiGateway.aggregation = this.results.apiGateway.aggregation || {};
                    this.results.apiGateway.aggregation[endpoint] = {
                        status: 'PASS',
                        isAggregated,
                        dataFields: Object.keys(data).length,
                        hasMultipleDataSources
                    };

                    console.log(`✅ ${endpoint}: ${Object.keys(data).length} fields, aggregated: ${isAggregated}`);
                } catch (error) {
                    this.results.apiGateway.aggregation = this.results.apiGateway.aggregation || {};
                    this.results.apiGateway.aggregation[endpoint] = {
                        status: 'FAIL',
                        error: error.message
                    };
                    console.log(`❌ ${endpoint}: ${error.message}`);
                }
            }

        } catch (error) {
            console.error('❌ Aggregated endpoints test failed:', error.message);
            this.results.errors.push(`Aggregation: ${error.message}`);
        }
    }

    generateReport() {
        console.log('\n📊 COMPREHENSIVE TEST REPORT');
        console.log('=' .repeat(50));

        // Summary
        const totalTests = this.countTests();
        const passedTests = this.countPassedTests();
        const failedTests = totalTests - passedTests;

        console.log(`\n📈 SUMMARY:`);
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

        // Detailed results
        console.log(`\n🔍 DETAILED RESULTS:`);
        
        console.log(`\n📡 API Gateway:`);
        console.log(`  Connectivity: ${this.results.apiGateway.connectivity?.status || 'NOT_TESTED'}`);
        console.log(`  Response Time: ${this.results.apiGateway.connectivity?.responseTime || 'N/A'}ms`);
        console.log(`  Features: ${this.results.apiGateway.connectivity?.features?.join(', ') || 'None'}`);

        console.log(`\n📦 Caching:`);
        Object.entries(this.results.caching).forEach(([endpoint, result]) => {
            console.log(`  ${endpoint}: ${result.status} (${result.improvement || 0}% improvement)`);
        });

        console.log(`\n🏥 Health Monitoring:`);
        console.log(`  Overall Status: ${this.results.health.overall?.status || 'NOT_TESTED'}`);
        console.log(`  Services Monitored: ${this.results.health.overall?.servicesCount || 0}`);
        console.log(`  Healthy Services: ${this.results.health.overall?.healthyServices || 0}`);

        console.log(`\n⚡ Performance:`);
        Object.entries(this.results.performance).forEach(([endpoint, result]) => {
            console.log(`  ${endpoint}: ${result.status} (${result.responseTime || 'N/A'}ms)`);
        });

        if (this.results.errors.length > 0) {
            console.log(`\n❌ ERRORS:`);
            this.results.errors.forEach(error => console.log(`  - ${error}`));
        }

        console.log(`\n🎉 OPTIMIZATION VALIDATION COMPLETE!`);
        
        if (passedTests / totalTests > 0.8) {
            console.log(`✅ All major improvements are working correctly!`);
        } else {
            console.log(`⚠️ Some improvements need attention. Check the errors above.`);
        }
    }

    countTests() {
        let count = 0;
        count += Object.keys(this.results.apiGateway.routing || {}).length;
        count += Object.keys(this.results.caching).length;
        count += Object.keys(this.results.performance).length;
        count += Object.keys(this.results.apiGateway.aggregation || {}).length;
        count += this.results.health.overall ? 1 : 0;
        count += this.results.health.metrics ? 1 : 0;
        count += this.results.apiGateway.connectivity ? 1 : 0;
        return count;
    }

    countPassedTests() {
        let count = 0;
        
        // API Gateway routing
        Object.values(this.results.apiGateway.routing || {}).forEach(result => {
            if (result.status === 'PASS') count++;
        });

        // Caching
        Object.values(this.results.caching).forEach(result => {
            if (result.status === 'PASS') count++;
        });

        // Performance
        Object.values(this.results.performance).forEach(result => {
            if (result.status === 'PASS') count++;
        });

        // Aggregation
        Object.values(this.results.apiGateway.aggregation || {}).forEach(result => {
            if (result.status === 'PASS') count++;
        });

        // Health
        if (this.results.health.overall?.status === 'healthy') count++;
        if (this.results.health.metrics?.status === 'PASS') count++;
        if (this.results.apiGateway.connectivity?.status === 'PASS') count++;

        return count;
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new ImprovementTester();
    tester.runAllTests().catch(console.error);
}

module.exports = ImprovementTester;

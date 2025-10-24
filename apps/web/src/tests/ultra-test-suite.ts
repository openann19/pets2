/**
 * ULTRA TESTING SUITE 🧪
 * Comprehensive end-to-end testing for all PawfectMatch Premium features
 */
import apiClient from '../lib/api-client';

interface TestResult {
    name: string;
    passed: boolean;
    duration: number;
    error?: string;
}

class UltraTestSuite {
    results: TestResult[] = [];
    startTime = Date.now();
    async runAllTests() {
        console.log('🚀 ULTRA TESTING MODE ACTIVATED!');
        console.log('===============================');
        // Authentication Tests
        await this.testAuthenticationFlow();
        // API Endpoint Tests
        await this.testAllEndpoints();
        // WebSocket Tests
        await this.testWebSocketConnection();
        // AI Service Tests
        await this.testAIServices();
        // Performance Tests
        await this.testPerformance();
        // Error Handling Tests
        await this.testErrorHandling();
        this.printResults();
        return this.results;
    }
    async runTest(name, testFn) {
        const start = Date.now();
        try {
            console.log(`🧪 Testing: ${name}...`);
            const result = await testFn();
            const duration = Date.now() - start;
            this.results.push({
                name,
                status: 'PASS',
                duration,
                data: result
            });
            console.log(`✅ ${name} - PASSED (${duration}ms)`);
        }
        catch (error) {
            const duration = Date.now() - start;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.results.push({
                name,
                status: 'FAIL',
                duration,
                error: errorMessage
            });
            console.log(`❌ ${name} - FAILED (${duration}ms): ${errorMessage}`);
        }
    }
    // ============= AUTHENTICATION TESTS =============
    async testAuthenticationFlow() {
        console.log('\n🔐 AUTHENTICATION TESTS');
        console.log('========================');
        await this.runTest('Health Check - Backend API', async () => {
            const response = await fetch('http://localhost:5000/api/health');
            if (!response.ok)
                throw new Error(`Backend not responding: ${response.status}`);
            return await response.json();
        });
        await this.runTest('Health Check - AI Service', async () => {
            const response = await fetch('http://localhost:8000/health');
            if (!response.ok)
                throw new Error(`AI Service not responding: ${response.status}`);
            return await response.json();
        });
        await this.runTest('Register New User', async () => {
            const testUser = {
                email: `test-${Date.now()}@pawfectmatch.com`,
                password: 'testpass123',
                name: 'Test User'
            };
            const result = await apiClient.register(testUser);
            if (!result.token || !result.user)
                throw new Error('Registration failed');
            return result;
        });
        await this.runTest('Login with Valid Credentials', async () => {
            const result = await apiClient.login('demo@pawfectmatch.com', 'password123');
            if (!result.token || !result.user)
                throw new Error('Login failed');
            return result;
        });
        await this.runTest('Get Current User Profile', async () => {
            const result = await apiClient.getCurrentUser();
            if (!result.success)
                throw new Error(result.error || 'Failed to get user');
            return result.data;
        });
        await this.runTest('Update User Profile', async () => {
            const result = await apiClient.updateProfile({
                name: 'Updated Test User',
                bio: 'Ultra testing in progress!'
            });
            if (!result.success)
                throw new Error(result.error || 'Profile update failed');
            return result.data;
        });
    }
    // ============= API ENDPOINT TESTS =============
    async testAllEndpoints() {
        console.log('\n🌐 API ENDPOINT TESTS');
        console.log('=====================');
        // Pet Management Tests
        await this.runTest('Get All Pets', async () => {
            const result = await apiClient.getPets();
            if (!result.success)
                throw new Error(result.error || 'Failed to get pets');
            return { count: result.data?.length || 0 };
        });
        await this.runTest('Get My Pets', async () => {
            const result = await apiClient.getMyPets();
            if (!result.success)
                throw new Error(result.error || 'Failed to get my pets');
            return { count: result.data?.length || 0 };
        });
        await this.runTest('Create New Pet', async () => {
            const testPet = {
                name: 'Test Pet',
                species: 'dog',
                breed: 'Test Breed',
                age: 3,
                size: 'medium',
                photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'],
                bio: 'Test pet for ultra testing',
                personality: ['friendly', 'playful']
            };
            const result = await apiClient.createPet(testPet);
            if (!result.success)
                throw new Error(result.error || 'Pet creation failed');
            return result.data;
        });
        // Swipe & Matching Tests
        await this.runTest('Get Swipe Queue', async () => {
            const result = await apiClient.getSwipeQueue();
            if (!result.success)
                throw new Error(result.error || 'Failed to get swipe queue');
            return { count: result.data?.length || 0 };
        });
        await this.runTest('Perform Swipe Action', async () => {
            const queueResult = await apiClient.getSwipeQueue();
            if (!queueResult.success || !queueResult.data?.length) {
                throw new Error('No pets in queue to swipe');
            }
            const result = await apiClient.swipe({
                petId: queueResult.data[0].id,
                action: 'like',
                timestamp: new Date().toISOString()
            });
            if (!result.success)
                throw new Error(result.error || 'Swipe failed');
            return result.data;
        });
        await this.runTest('Get Matches', async () => {
            const result = await apiClient.getMatches();
            if (!result.success)
                throw new Error(result.error || 'Failed to get matches');
            return { count: result.data?.length || 0 };
        });
        // Location Tests
        await this.runTest('Update Location', async () => {
            const result = await apiClient.updateLocation({
                lat: 37.7749,
                lng: -122.4194,
                city: 'San Francisco',
                state: 'CA',
                country: 'USA'
            });
            if (!result.success)
                throw new Error(result.error || 'Location update failed');
            return result.data;
        });
        await this.runTest('Get Nearby Pets', async () => {
            const result = await apiClient.getNearbyPets(10);
            if (!result.success)
                throw new Error(result.error || 'Failed to get nearby pets');
            return { count: result.data?.length || 0 };
        });
        // Notification Tests
        await this.runTest('Get Notifications', async () => {
            const result = await apiClient.getNotifications();
            if (!result.success)
                throw new Error(result.error || 'Failed to get notifications');
            return { count: result.data?.length || 0 };
        });
    }
    // ============= AI SERVICE TESTS =============
    async testAIServices() {
        console.log('\n🤖 AI SERVICE TESTS');
        console.log('===================');
        await this.runTest('AI Bio Generation', async () => {
            const testPet = {
                id: 'test-pet-1',
                name: 'Buddy',
                species: 'dog',
                breed: 'Golden Retriever',
                age: 3,
                size: 'large',
                photos: [],
                personality: ['friendly', 'energetic', 'playful']
            };
            const result = await apiClient.generateBio({
                pet: testPet,
                tone: 'friendly',
                length: 'medium'
            });
            if (!result.success)
                throw new Error(result.error || 'Bio generation failed');
            return { bioLength: result.data?.bio?.length || 0 };
        });
        await this.runTest('AI Photo Analysis', async () => {
            const result = await apiClient.analyzePhoto('https://images.unsplash.com/photo-1552053831-71594a27632d?w=400');
            if (!result.success)
                throw new Error(result.error || 'Photo analysis failed');
            return result.data;
        });
        await this.runTest('AI Compatibility Calculation', async () => {
            const pet1 = {
                id: 'pet1',
                name: 'Buddy',
                species: 'dog',
                breed: 'Golden Retriever',
                age: 3,
                size: 'large',
                photos: [],
                personality: ['friendly', 'energetic']
            };
            const pet2 = {
                id: 'pet2',
                name: 'Luna',
                species: 'dog',
                breed: 'Labrador',
                age: 2,
                size: 'large',
                photos: [],
                personality: ['friendly', 'playful']
            };
            const result = await apiClient.calculateCompatibility(pet1, pet2);
            if (!result.success)
                throw new Error(result.error || 'Compatibility calculation failed');
            return result.data;
        });
        await this.runTest('AI Profile Suggestions', async () => {
            const testPet = {
                id: 'test-pet-1',
                name: 'Buddy',
                species: 'dog',
                breed: 'Golden Retriever',
                age: 3,
                size: 'large',
                photos: [],
                personality: ['friendly']
            };
            const result = await apiClient.suggestProfileImprovements(testPet);
            if (!result.success)
                throw new Error(result.error || 'Profile suggestions failed');
            return result.data;
        });
    }
    // ============= WEBSOCKET TESTS =============
    async testWebSocketConnection() {
        console.log('\n🔌 WEBSOCKET TESTS');
        console.log('==================');
        await this.runTest('WebSocket Connection', async () => {
            return new Promise((resolve, reject) => {
                const socket = apiClient.connectWebSocket('test-user-id');
                const timeout = setTimeout(() => {
                    reject(new Error('WebSocket connection timeout'));
                }, 5000);
                socket.on('connect', () => {
                    clearTimeout(timeout);
                    socket.disconnect();
                    resolve({ connected: true });
                });
                socket.on('connect_error', (error) => {
                    clearTimeout(timeout);
                    reject(new Error(`WebSocket connection failed: ${error.message}`));
                });
            });
        });
    }
    // ============= PERFORMANCE TESTS =============
    async testPerformance() {
        console.log('\n⚡ PERFORMANCE TESTS');
        console.log('===================');
        await this.runTest('API Response Time - Get Pets', async () => {
            const start = Date.now();
            await apiClient.getPets();
            const duration = Date.now() - start;
            if (duration > 2000) {
                throw new Error(`Response too slow: ${duration}ms`);
            }
            return { responseTime: duration };
        });
        await this.runTest('Concurrent API Calls', async () => {
            const start = Date.now();
            const promises = [
                apiClient.getPets(),
                apiClient.getMatches(),
                apiClient.getNotifications(),
                apiClient.getCurrentUser()
            ];
            await Promise.all(promises);
            const duration = Date.now() - start;
            return { totalTime: duration, avgTime: duration / promises.length };
        });
    }
    // ============= ERROR HANDLING TESTS =============
    async testErrorHandling() {
        console.log('\n🚨 ERROR HANDLING TESTS');
        console.log('=======================');
        await this.runTest('Invalid Login Credentials', async () => {
            const result = await apiClient.login('invalid@email.com', 'wrongpassword');
            if (result.success) {
                throw new Error('Should have failed with invalid credentials');
            }
            return { errorHandled: true, error: result.error };
        });
        await this.runTest('Invalid API Endpoint', async () => {
            try {
                const response = await fetch('http://localhost:5000/api/nonexistent');
                if (response.status !== 404) {
                    throw new Error(`Expected 404, got ${response.status}`);
                }
                return { errorHandled: true };
            }
            catch (error) {
                if (error instanceof Error && error.message.includes('Expected 404'))
                    throw error;
                return { errorHandled: true, networkError: true };
            }
        });
    }
    // ============= RESULTS REPORTING =============
    printResults() {
        const totalTests = this.results.length;
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const totalTime = Date.now() - this.startTime;
        console.log('\n🏆 ULTRA TEST RESULTS');
        console.log('=====================');
        console.log(`📊 Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⏱️  Total Time: ${totalTime}ms`);
        console.log(`📈 Success Rate: ${((passed / totalTests) * 100).toFixed(1)}%`);
        if (failed > 0) {
            console.log('\n💥 FAILED TESTS:');
            this.results
                .filter(r => r.status === 'FAIL')
                .forEach(r => {
                console.log(`❌ ${r.name}: ${r.error}`);
            });
        }
        console.log('\n🎯 PERFORMANCE METRICS:');
        const avgDuration = this.results.reduce((acc, r) => acc + r.duration, 0) / totalTests;
        console.log(`📊 Average Test Duration: ${avgDuration.toFixed(2)}ms`);
        const slowTests = this.results.filter(r => r.duration > 1000);
        if (slowTests.length > 0) {
            console.log('⚠️  Slow Tests (>1s):');
            slowTests.forEach(r => {
                console.log(`   ${r.name}: ${r.duration}ms`);
            });
        }
        if (passed === totalTests) {
            console.log('\n🎉 ALL TESTS PASSED! ULTRA TESTING COMPLETE! 🚀');
        }
        else {
            console.log('\n⚠️  Some tests failed. Check the errors above.');
        }
    }
}
// Export for use in browser console or test runner
export const ultraTestSuite = new UltraTestSuite();
// Auto-run if in browser
if (typeof window !== 'undefined') {
    window.runUltraTests = () => ultraTestSuite.runAllTests();
    console.log('🧪 Ultra Test Suite loaded! Run: runUltraTests()');
}
//# sourceMappingURL=ultra-test-suite.js.map
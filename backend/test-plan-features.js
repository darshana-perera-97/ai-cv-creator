const axios = require('axios');

const BASE_URL = 'http://localhost:5050/api';

async function testPlanFeatures() {
    try {
        console.log('Testing Plan Features...\n');

        // Test 1: Register a user with Free plan
        console.log('1. Testing user registration with Free plan...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            firstName: 'Test',
            lastName: 'User',
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            plan: 'Free'
        });

        if (registerResponse.data.success) {
            console.log('✅ User registered successfully with Free plan');
            const token = registerResponse.data.token;
            const userId = registerResponse.data.user.userId;

            // Test 2: Get plan info
            console.log('\n2. Testing plan info retrieval...');
            const planInfoResponse = await axios.get(`${BASE_URL}/auth/plan-info`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (planInfoResponse.data.success) {
                const planInfo = planInfoResponse.data.planInfo;
                console.log('✅ Plan info retrieved successfully:');
                console.log(`   Plan: ${planInfo.plan}`);
                console.log(`   Current CVs: ${planInfo.currentCount}`);
                console.log(`   Limit: ${planInfo.limit}`);
                console.log(`   Remaining: ${planInfo.remaining}`);
                console.log(`   Allowed: ${planInfo.allowed}`);

                // Test 3: Try to create CVs up to the limit
                console.log('\n3. Testing CV creation up to limit...');
                for (let i = 1; i <= 6; i++) {
                    try {
                        const cvResponse = await axios.post(`${BASE_URL}/cv/create`, {
                            cvData: {
                                personalInfo: { firstName: 'Test', lastName: 'User' },
                                summary: 'Test CV',
                                workExperience: [],
                                education: [],
                                skills: []
                            },
                            templateId: 'modern',
                            title: `Test CV ${i}`
                        }, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (cvResponse.data.success) {
                            console.log(`✅ CV ${i} created successfully`);
                        }
                    } catch (error) {
                        if (error.response?.status === 403) {
                            console.log(`❌ CV ${i} creation blocked (limit reached): ${error.response.data.message}`);
                            break;
                        } else {
                            console.log(`❌ CV ${i} creation failed: ${error.message}`);
                        }
                    }
                }

                // Test 4: Get updated plan info
                console.log('\n4. Testing updated plan info...');
                const updatedPlanInfoResponse = await axios.get(`${BASE_URL}/auth/plan-info`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (updatedPlanInfoResponse.data.success) {
                    const updatedPlanInfo = updatedPlanInfoResponse.data.planInfo;
                    console.log('✅ Updated plan info:');
                    console.log(`   Current CVs: ${updatedPlanInfo.currentCount}`);
                    console.log(`   Remaining: ${updatedPlanInfo.remaining}`);
                    console.log(`   Allowed: ${updatedPlanInfo.allowed}`);
                }

            } else {
                console.log('❌ Failed to get plan info');
            }

        } else {
            console.log('❌ User registration failed');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testPlanFeatures(); 
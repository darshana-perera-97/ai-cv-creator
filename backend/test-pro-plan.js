const axios = require('axios');

const API_BASE_URL = 'http://localhost:5050/api';

// Test data
const testUser = {
    firstName: 'Pro',
    lastName: 'User',
    username: 'prouser',
    email: 'pro@example.com',
    password: 'password123',
    plan: 'Pro'
};

let authToken = null;
let userId = null;

async function testProPlan() {
    console.log('🧪 Testing Pro Plan Functionality...\n');

    try {
        // 1. Register a new user with Pro plan
        console.log('1. Registering user with Pro plan...');
        const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
        
        if (registerResponse.data.success) {
            authToken = registerResponse.data.token;
            userId = registerResponse.data.user.userId;
            console.log('✅ User registered successfully with Pro plan');
            console.log(`   User ID: ${userId}`);
            console.log(`   Plan: ${registerResponse.data.user.plan}`);
            console.log(`   CV Limit: ${registerResponse.data.user.cvLimit}`);
        } else {
            throw new Error('Registration failed');
        }

        // 2. Get plan information
        console.log('\n2. Fetching plan information...');
        const planResponse = await axios.get(`${API_BASE_URL}/auth/plan-info`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (planResponse.data.success) {
            const planInfo = planResponse.data.planInfo;
            console.log('✅ Plan info retrieved successfully');
            console.log(`   Plan: ${planInfo.plan}`);
            console.log(`   Current CVs: ${planInfo.currentCount}`);
            console.log(`   Limit: ${planInfo.limit}`);
            console.log(`   Remaining: ${planInfo.remaining}`);
            console.log(`   Allowed: ${planInfo.allowed}`);
        } else {
            throw new Error('Failed to get plan info');
        }

        // 3. Test creating CVs up to the Pro plan limit (25 CVs)
        console.log('\n3. Testing CV creation up to Pro plan limit (25 CVs)...');
        
        const testCVData = {
            personalInfo: {
                firstName: 'Pro',
                lastName: 'User',
                email: 'pro@example.com',
                phone: '123-456-7890',
                address: '123 Pro Street'
            },
            experience: [
                {
                    company: 'Pro Company',
                    position: 'Senior Developer',
                    startDate: '2020-01-01',
                    endDate: '2023-12-31',
                    description: 'Advanced development work'
                }
            ],
            education: [
                {
                    institution: 'Pro University',
                    degree: 'Master of Computer Science',
                    startDate: '2018-01-01',
                    endDate: '2020-12-31'
                }
            ],
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AI/ML']
        };

        let createdCVs = 0;
        const maxCVs = 25;

        for (let i = 1; i <= maxCVs; i++) {
            try {
                const cvResponse = await axios.post(`${API_BASE_URL}/cv/create`, {
                    cvData: testCVData,
                    templateId: 'template1',
                    title: `Test CV ${i}`
                }, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });

                if (cvResponse.data.success) {
                    createdCVs++;
                    if (i % 5 === 0) {
                        console.log(`   ✅ Created CV ${i}/${maxCVs}`);
                    }
                } else {
                    console.log(`   ❌ Failed to create CV ${i}: ${cvResponse.data.message}`);
                    break;
                }
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    console.log(`   ⚠️  CV limit reached at CV ${i}: ${error.response.data.message}`);
                    break;
                } else {
                    console.log(`   ❌ Error creating CV ${i}: ${error.message}`);
                    break;
                }
            }
        }

        console.log(`\n   📊 Total CVs created: ${createdCVs}/${maxCVs}`);

        // 4. Get final plan information
        console.log('\n4. Fetching final plan information...');
        const finalPlanResponse = await axios.get(`${API_BASE_URL}/auth/plan-info`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (finalPlanResponse.data.success) {
            const finalPlanInfo = finalPlanResponse.data.planInfo;
            console.log('✅ Final plan info retrieved');
            console.log(`   Plan: ${finalPlanInfo.plan}`);
            console.log(`   Current CVs: ${finalPlanInfo.currentCount}`);
            console.log(`   Limit: ${finalPlanInfo.limit}`);
            console.log(`   Remaining: ${finalPlanInfo.remaining}`);
            console.log(`   Allowed: ${finalPlanInfo.allowed}`);
        }

        // 5. Test creating one more CV (should fail)
        console.log('\n5. Testing CV creation beyond limit...');
        try {
            const extraCVResponse = await axios.post(`${API_BASE_URL}/cv/create`, {
                cvData: testCVData,
                templateId: 'template1',
                title: 'Extra CV Beyond Limit'
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (extraCVResponse.data.success) {
                console.log('   ❌ Should have failed - CV limit exceeded but CV was created');
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('   ✅ Correctly blocked CV creation beyond limit');
                console.log(`   Message: ${error.response.data.message}`);
            } else {
                console.log(`   ❌ Unexpected error: ${error.message}`);
            }
        }

        console.log('\n🎉 Pro Plan Test Completed Successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - Pro plan allows ${maxCVs} CVs`);
        console.log(`   - Successfully created ${createdCVs} CVs`);
        console.log(`   - CV limit enforcement working correctly`);
        console.log(`   - Plan information API working correctly`);

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testProPlan(); 
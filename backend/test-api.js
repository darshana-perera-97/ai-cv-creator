const axios = require('axios');

const BASE_URL = 'http://localhost:5050/api';

// Test user data
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
};

async function testAPI() {
    try {
        console.log('🚀 Testing AI CV Creator API\n');

        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check:', healthResponse.data.message);
        console.log('');

        // Test user registration
        console.log('2. Testing user registration...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
        console.log('✅ Registration successful:', registerResponse.data.message);
        console.log('User ID:', registerResponse.data.user.userId);
        console.log('Token received:', registerResponse.data.token ? 'Yes' : 'No');
        console.log('');

        // Test user login
        console.log('3. Testing user login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('✅ Login successful:', loginResponse.data.message);
        console.log('User:', `${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`);
        console.log('');

        // Test get profile (protected route)
        console.log('4. Testing protected profile endpoint...');
        const token = loginResponse.data.token;
        const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Profile retrieved successfully');
        console.log('User details:', {
            userId: profileResponse.data.user.userId,
            username: profileResponse.data.user.username,
            email: profileResponse.data.user.email,
            name: `${profileResponse.data.user.firstName} ${profileResponse.data.user.lastName}`
        });
        console.log('');

        console.log('🎉 All tests passed successfully!');

    } catch (error) {
        if (error.response) {
            console.error('❌ API Error:', error.response.data);
        } else {
            console.error('❌ Network Error:', error.message);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testAPI();
}

module.exports = { testAPI }; 
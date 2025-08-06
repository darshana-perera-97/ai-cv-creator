const axios = require('axios');

const API_BASE_URL = 'http://localhost:5050/api';

async function testAdminPanel() {
    console.log('🧪 Testing Admin Panel Functionality...\n');

    try {
        // Test the admin users endpoint
        console.log('1. Testing admin users endpoint...');
        const response = await axios.get(`${API_BASE_URL}/admin/users`);

        if (response.data.success) {
            const users = response.data.users;
            console.log('✅ Admin endpoint working correctly');
            console.log(`   Total users: ${users.length}`);

            // Display user statistics
            const planStats = {
                Free: users.filter(u => u.plan === 'Free').length,
                Basic: users.filter(u => u.plan === 'Basic').length,
                Pro: users.filter(u => u.plan === 'Pro').length
            };

            console.log('\n📊 User Plan Distribution:');
            console.log(`   Free Plan: ${planStats.Free} users`);
            console.log(`   Basic Plan: ${planStats.Basic} users`);
            console.log(`   Pro Plan: ${planStats.Pro} users`);

            // Display detailed user information
            if (users.length > 0) {
                console.log('\n👥 User Details:');
                users.forEach((user, index) => {
                    console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.username})`);
                    console.log(`      Email: ${user.email}`);
                    console.log(`      Plan: ${user.plan} (${user.currentCount}/${user.cvLimit} CVs used, ${user.remaining} remaining)`);
                    console.log(`      Created: ${new Date(user.createdAt).toLocaleDateString()}`);
                    console.log('');
                });
            } else {
                console.log('\n📝 No users found in the system');
                console.log('   Register some users first to see them in the admin panel');
            }

            console.log('\n🎉 Admin Panel Test Completed Successfully!');
            console.log('\n📋 Next Steps:');
            console.log('   1. Open admin/admin-panel.html in your browser');
            console.log('   2. The panel should display the same user data');
            console.log('   3. Test the search functionality and refresh button');

        } else {
            throw new Error('Admin endpoint returned success: false');
        }

    } catch (error) {
        console.error('\n❌ Admin panel test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure the backend server is running on port 5050');
        console.log('   2. Check if there are any users in backend/data/users.json');
        console.log('   3. Verify the admin endpoint is properly added to server.js');
    }
}

// Run the test
testAdminPanel(); 
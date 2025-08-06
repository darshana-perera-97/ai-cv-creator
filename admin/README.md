# AI CV Creator - Admin Panel

This admin panel provides a comprehensive view of all users registered in the AI CV Creator system, including their plan details and CV usage statistics.

## Features

- **User Overview**: View all registered users in a table format
- **Plan Statistics**: See distribution of users across Free, Basic, and Pro plans
- **CV Usage Tracking**: Monitor how many CVs each user has created and their remaining quota
- **Search Functionality**: Search users by name, username, email, or plan
- **Real-time Data**: Refresh data to get the latest user information
- **Visual Progress Bars**: See CV usage progress with color-coded indicators

## How to Use

1. **Start the Backend Server**: Make sure your backend server is running on port 5050
   ```bash
   cd backend
   npm start
   ```

2. **Open the Admin Panel**: Open `admin-panel.html` in your web browser
   - You can double-click the file or open it via your browser's file menu
   - The panel will automatically connect to `http://localhost:5050/api`

3. **View User Data**: The panel will display:
   - Statistics cards showing total users and plan distribution
   - A detailed table with user information including:
     - User ID
     - Full Name
     - Username
     - Email
     - Selected Plan (with color-coded badges)
     - CV Usage (current/limit with remaining count)
     - Progress bar showing usage percentage
     - Account creation date

4. **Search Users**: Use the search box to filter users by:
   - First name or last name
   - Username
   - Email address
   - Plan type

5. **Refresh Data**: Click the refresh button to get the latest data from the server

## Data Display

### Plan Badges
- **Free Plan**: Gray badge (5 CV limit)
- **Basic Plan**: Blue badge (15 CV limit)
- **Pro Plan**: Green badge (25 CV limit)

### Progress Bars
- **Green**: Less than 70% usage
- **Yellow**: 70-90% usage
- **Red**: 90%+ usage (approaching limit)

### Statistics Cards
- **Total Users**: Overall user count
- **Free Plan**: Number of users on free plan
- **Basic Plan**: Number of users on basic plan
- **Pro Plan**: Number of users on pro plan

## Technical Details

- **Frontend**: Pure HTML/CSS/JavaScript with Bootstrap 5
- **Backend API**: RESTful endpoint at `/api/admin/users`
- **Data Source**: Reads from `backend/data/users.json` and `backend/data/cvs.json`
- **Security**: No authentication required (for admin access, consider adding authentication in production)

## API Endpoint

The admin panel uses the following backend endpoint:

```
GET /api/admin/users
```

**Response Format:**
```json
{
  "success": true,
  "users": [
    {
      "userId": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "plan": "Basic",
      "cvLimit": 15,
      "currentCount": 3,
      "remaining": 12,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Troubleshooting

1. **"Failed to load user data"**: Make sure the backend server is running on port 5050
2. **Empty table**: Check if there are any users registered in the system
3. **CORS errors**: Ensure the backend has CORS enabled (should be configured by default)

## Future Enhancements

Consider adding these features for production use:
- Admin authentication and authorization
- User management (edit, delete users)
- Export data to CSV/Excel
- More detailed analytics and charts
- User activity logs
- Plan upgrade/downgrade functionality 
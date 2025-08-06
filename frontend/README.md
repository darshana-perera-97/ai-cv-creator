# AI CV Creator - Frontend

A React-based frontend application for the AI CV Creator platform with user authentication and dashboard functionality.

## Features

- ✅ User registration with form validation
- ✅ User login with authentication
- ✅ Protected dashboard with user information
- ✅ Responsive navigation with user dropdown
- ✅ Bootstrap 5 styling with custom CSS
- ✅ React Router for navigation
- ✅ Context API for state management
- ✅ JWT token authentication
- ✅ Auto-login with token persistence

## Pages

### 1. Home Page (`/`)
- Welcome message and call-to-action
- Feature highlights
- Navigation to login/register for unauthenticated users
- Direct access to dashboard for authenticated users

### 2. Register Page (`/register`)
- User registration form with validation
- Fields: First Name, Last Name, Username, Email, Password, Confirm Password
- Password confirmation validation
- Link to login page

### 3. Login Page (`/login`)
- User login form
- Fields: Email, Password
- Error handling for invalid credentials
- Link to registration page

### 4. Dashboard (`/dashboard`)
- Protected route (requires authentication)
- User information display
- Quick action buttons
- Getting started guide
- User profile details

## Components

### Core Components
- **AuthContext**: Manages authentication state and user data
- **Navbar**: Navigation bar with user dropdown and logout
- **ProtectedRoute**: Wrapper for authenticated-only pages
- **Home**: Landing page with welcome message
- **Login**: User login form
- **Register**: User registration form
- **Dashboard**: User dashboard with profile information

### Configuration
- **config.js**: Centralized API configuration and helper functions

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will run on `http://localhost:3000`

## Dependencies

- **React**: Frontend framework
- **React Router DOM**: Client-side routing
- **Bootstrap**: CSS framework for styling
- **Bootstrap Icons**: Icon library
- **Axios**: HTTP client (for future API calls)

## Project Structure

```
src/
├── components/
│   ├── Dashboard.js
│   ├── Home.js
│   ├── Login.js
│   ├── Navbar.js
│   ├── ProtectedRoute.js
│   └── Register.js
├── context/
│   └── AuthContext.js
├── config/
│   └── config.js
├── App.js
├── App.css
└── index.js
```

## Authentication Flow

1. **Registration**: User fills out registration form → API call to backend → JWT token received → User logged in
2. **Login**: User enters credentials → API call to backend → JWT token received → User logged in
3. **Token Persistence**: JWT token stored in localStorage → Auto-login on page refresh
4. **Protected Routes**: Check authentication status → Redirect to login if not authenticated
5. **Logout**: Clear token and user data → Redirect to login page

## API Integration

The frontend integrates with the backend API at `http://localhost:5050/api`:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (protected)

## Styling

- **Bootstrap 5**: Primary styling framework
- **Custom CSS**: Additional styling in App.css
- **Bootstrap Icons**: Icon library for UI elements
- **Responsive Design**: Mobile-friendly layout

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:5050/api
```

## Backend Integration

This frontend is designed to work with the Node.js/Express backend. Make sure the backend server is running on port 5050 before testing the frontend.

## Security Features

- JWT token authentication
- Protected routes
- Form validation
- Secure password handling
- Token expiration handling

## Future Enhancements

- CV creation interface
- AI-powered content suggestions
- Multiple CV templates
- Export functionality (PDF, Word)
- User profile management
- Password reset functionality

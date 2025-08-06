# AI CV Creator - Backend API

A Node.js/Express backend API for the AI CV Creator platform with user authentication, document management, and AI-powered CV data extraction.

## Features

- ✅ User authentication (register/login/logout)
- ✅ JWT token-based authentication
- ✅ **User plan management (Free/Basic/Pro plans with CV limits)**
- ✅ Document upload and management (PDF, DOCX, TXT)
- ✅ Text extraction from uploaded documents
- ✅ **Admin panel for user management and analytics**
- ✅ **AI-powered CV data extraction using OpenAI**
- ✅ Protected API routes
- ✅ JSON file-based data storage
- ✅ CORS enabled for frontend integration

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create a `.env` file):
```env
PORT=5050
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

3. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5050`

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body**: `{ firstName, lastName, username, email, password, plan }`
- **Plan options**: `"Free"` (5 CVs), `"Basic"` (15 CVs), or `"Pro"` (25 CVs)
- **Response**: User data and JWT token

#### Login User
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: User data and JWT token

#### Get User Profile (Protected)
- **GET** `/api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User profile data

#### Get User Plan Information (Protected)
- **GET** `/api/auth/plan-info`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Plan details including current CV count, limit, and remaining CVs

### Admin Management

#### Get All Users (Admin)
- **GET** `/api/admin/users`
- **Response**: Array of all users with CV usage statistics
- **Note**: This endpoint provides user data for the admin panel

### Document Management

#### Upload Document (Protected)
- **POST** `/api/documents/upload`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: FormData with `document` file
- **Supported formats**: PDF, DOCX, TXT
- **Max size**: 10MB
- **Response**: Document metadata and extracted text

#### Get User's Documents (Protected)
- **GET** `/api/documents`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of user's documents

#### Get Specific Document (Protected)
- **GET** `/api/documents/:documentId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Document details

#### Delete Document (Protected)
- **DELETE** `/api/documents/:documentId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

### CV Management

#### Create CV (Protected)
- **POST** `/api/cv/create`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ cvData, templateId, title }`
- **CV Limits**: 
  - Free plan: 5 CVs maximum
  - Basic plan: 15 CVs maximum
  - Pro plan: 25 CVs maximum
- **Response**: Created CV data

#### Get User's CVs (Protected)
- **GET** `/api/cv`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of user's CVs

#### Get Specific CV (Protected)
- **GET** `/api/cv/:cvId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: CV details

#### Update CV (Protected)
- **PUT** `/api/cv/:cvId`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ cvData, templateId, title }`
- **Response**: Updated CV data

#### Delete CV (Protected)
- **DELETE** `/api/cv/:cvId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

#### Download CV as PDF (Protected)
- **GET** `/api/cv/:cvId/download`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: PDF file

#### Download CV as JPG (Protected)
- **GET** `/api/cv/:cvId/download-jpg`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: JPG image file

#### Generate Cover Letter (Protected)
- **POST** `/api/cv/:cvId/cover-letter`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: AI-generated cover letter

### CV Data Extraction

#### Extract CV Data from Documents (Protected)
- **POST** `/api/cv/extract-from-documents`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Structured CV data extracted using OpenAI
- **Features**:
  - Analyzes all user's uploaded documents
  - Uses OpenAI GPT-3.5-turbo for intelligent data extraction
  - Returns structured JSON with personal info, experience, education, skills
  - Handles multiple document formats and content types

### Health Check

#### Server Health
- **GET** `/api/health`
- **Response**: Server status and timestamp

## Data Storage

User data is stored in `/data/users.json` with the following structure:

```json
[
  {
    "userId": "uuid-generated-id",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "hashed-password",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

Document data is stored in `/data/documents.json` with the following structure:

```json
[
  {
    "documentId": "uuid-generated-id",
    "userId": "user-uuid",
    "fileName": "document.pdf",
    "originalName": "document.pdf",
    "filePath": "/path/to/file",
    "fileType": "application/pdf",
    "fileSize": 1024000,
    "extractedText": "Extracted text content...",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

Uploaded files are stored in `/data/uploads/` directory.

## AI Integration

### OpenAI Configuration

The backend integrates with OpenAI API for intelligent CV data extraction:

- **Model**: GPT-3.5-turbo
- **Temperature**: 0.3 (for consistent results)
- **Max Tokens**: 2000
- **Function**: Extracts structured CV data from document content

### CV Data Extraction Process

1. **Document Collection**: Gathers all user's uploaded documents
2. **Text Combination**: Combines extracted text from all documents
3. **AI Analysis**: Sends combined text to OpenAI with structured prompt
4. **Data Cleaning**: Removes placeholder text and validates extracted data
5. **Data Parsing**: Parses JSON response from OpenAI
6. **Structured Output**: Returns formatted CV data ready for form pre-filling

### Data Cleaning and Validation

The system includes intelligent data cleaning to ensure quality extraction:

- **Placeholder Detection**: Removes common placeholder text like "N/A", "Not Available", "Unknown"
- **Empty Field Handling**: Ensures fields are truly empty when no data is found
- **Array Validation**: Filters out incomplete work experience and education entries
- **String Cleaning**: Trims whitespace and validates string content
- **Conservative Approach**: Better to leave fields empty than include incorrect data

### Extracted Data Structure

```json
{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    "address": "",
    "linkedin": "",
    "website": ""
  },
  "summary": "",
  "workExperience": [
    {
      "company": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "gpa": ""
    }
  ],
  "skills": [],
  "languages": [],
  "certifications": []
}
```

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Token-based session management
- **Protected Routes**: Authentication middleware for sensitive endpoints
- **File Validation**: Type and size validation for uploads
- **CORS Configuration**: Secure cross-origin requests

## Dependencies

- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **uuid**: Unique ID generation
- **multer**: File upload handling
- **pdf-parse**: PDF text extraction
- **mammoth**: DOCX text extraction
- **openai**: OpenAI API integration
- **nodemon**: Development auto-restart

## Frontend Integration

The API is configured with CORS to work with React frontend. Use the following base URL:

```
http://localhost:5050/api
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5050` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `OPENAI_API_KEY` | OpenAI API key | `your-openai-api-key` |

## Error Handling

The API includes comprehensive error handling:

- **400**: Bad Request (missing fields, invalid data)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (invalid token)
- **404**: Not Found (user/document not found)
- **500**: Internal Server Error (server issues)

## Testing

Test the API endpoints using the included test script:

```bash
node test-api.js
```

This will test registration, login, and profile endpoints with sample data.

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- File compression and optimization
- Advanced AI features (CV optimization, job matching)
- Email verification
- Password reset functionality
- Rate limiting
- API documentation with Swagger 
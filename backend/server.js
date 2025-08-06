// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const OpenAI = require('openai');
const puppeteer = require('puppeteer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key'
});

// Debug: Check if API key is loaded (remove this in production)
console.log('OpenAI API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
if (process.env.OPENAI_API_KEY) {
    console.log('API Key starts with:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
}

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const documentsFile = path.join(dataDir, 'documents.json');
const cvsFile = path.join(dataDir, 'cvs.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize users.json if it doesn't exist
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}

// Initialize documents.json if it doesn't exist
if (!fs.existsSync(documentsFile)) {
    fs.writeFileSync(documentsFile, JSON.stringify([], null, 2));
}

// Initialize cvs.json if it doesn't exist
if (!fs.existsSync(cvsFile)) {
    fs.writeFileSync(cvsFile, JSON.stringify([], null, 2));
}

// Helper functions
const readUsers = () => {
    try {
        const data = fs.readFileSync(usersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeUsers = (users) => {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const findUserByEmail = (email) => {
    const users = readUsers();
    return users.find(user => user.email === email);
};

const findUserByUsername = (username) => {
    const users = readUsers();
    return users.find(user => user.username === username);
};

// Plan and CV limit helper functions
const findUserById = (userId) => {
    const users = readUsers();
    return users.find(user => user.userId === userId);
};

const checkCVLimit = (userId) => {
    const user = findUserById(userId);
    if (!user) {
        return { allowed: false, message: 'User not found' };
    }

    const userCVs = findCVsByUserId(userId);
    const currentCount = userCVs.length;
    const limit = user.cvLimit || (user.plan === 'Free' ? 5 : user.plan === 'Basic' ? 15 : 25);

    return {
        allowed: currentCount < limit,
        currentCount,
        limit,
        remaining: limit - currentCount,
        plan: user.plan
    };
};

// Document helper functions
const readDocuments = () => {
    try {
        const data = fs.readFileSync(documentsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeDocuments = (documents) => {
    fs.writeFileSync(documentsFile, JSON.stringify(documents, null, 2));
};

const findDocumentsByUserId = (userId) => {
    const documents = readDocuments();
    return documents.filter(doc => doc.userId === userId);
};

// CV helper functions
const readCVs = () => {
    try {
        const data = fs.readFileSync(cvsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeCVs = (cvs) => {
    fs.writeFileSync(cvsFile, JSON.stringify(cvs, null, 2));
};

const findCVsByUserId = (userId) => {
    const cvs = readCVs();
    return cvs.filter(cv => cv.userId === userId);
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(dataDir, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'), false);
        }
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid or expired token' 
            });
        }
        req.user = user;
        next();
    });
};

// Helper function to clean extracted CV data and ensure empty fields are properly handled
const cleanExtractedCVData = (cvData) => {
    // Remove any fields that might have been filled with placeholder text
    const cleanString = (str) => {
        if (!str || typeof str !== 'string') return '';
        const trimmed = str.trim();
        // Remove common placeholder text
        const placeholders = ['n/a', 'not available', 'not specified', 'unknown', 'none', 'tbd', 'to be determined'];
        if (placeholders.some(placeholder => trimmed.toLowerCase() === placeholder)) {
            return '';
        }
        return trimmed;
    };

    // Clean personal info
    const cleanedPersonalInfo = {
        firstName: cleanString(cvData.personalInfo?.firstName),
        lastName: cleanString(cvData.personalInfo?.lastName),
        email: cleanString(cvData.personalInfo?.email),
        phone: cleanString(cvData.personalInfo?.phone),
        address: cleanString(cvData.personalInfo?.address),
        linkedin: cleanString(cvData.personalInfo?.linkedin),
        website: cleanString(cvData.personalInfo?.website)
    };

    // Clean summary
    const cleanedSummary = cleanString(cvData.summary);

    // Clean work experience - remove entries with empty company/position
    const cleanedWorkExperience = (cvData.workExperience || [])
        .filter(exp => cleanString(exp.company) && cleanString(exp.position))
        .map(exp => ({
            company: cleanString(exp.company),
            position: cleanString(exp.position),
            startDate: cleanString(exp.startDate),
            endDate: cleanString(exp.endDate),
            current: exp.current === true,
            description: cleanString(exp.description)
        }));

    // Clean education - remove entries with empty institution/degree
    const cleanedEducation = (cvData.education || [])
        .filter(edu => cleanString(edu.institution) && cleanString(edu.degree))
        .map(edu => ({
            institution: cleanString(edu.institution),
            degree: cleanString(edu.degree),
            field: cleanString(edu.field),
            startDate: cleanString(edu.startDate),
            endDate: cleanString(edu.endDate),
            current: edu.current === true,
            gpa: cleanString(edu.gpa)
        }));

    // Clean skills - remove empty or placeholder skills
    const cleanedSkills = (cvData.skills || [])
        .map(skill => cleanString(skill))
        .filter(skill => skill && skill.length > 0);

    // Clean languages - remove empty entries
    const cleanedLanguages = (cvData.languages || [])
        .map(lang => cleanString(lang))
        .filter(lang => lang && lang.length > 0);

    // Clean certifications - remove empty entries
    const cleanedCertifications = (cvData.certifications || [])
        .map(cert => cleanString(cert))
        .filter(cert => cert && cert.length > 0);

    return {
        personalInfo: cleanedPersonalInfo,
        summary: cleanedSummary,
        workExperience: cleanedWorkExperience,
        education: cleanedEducation,
        skills: cleanedSkills,
        languages: cleanedLanguages,
        certifications: cleanedCertifications
    };
};

// Function to extract content from URL
const extractURLContent = async (url) => {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        // Extract text content from HTML
        const html = response.data;
        const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        return textContent;
    } catch (error) {
        console.error('Error extracting URL content:', error);
        throw new Error('Failed to extract content from URL');
    }
};

// Function to analyze job posting and extract requirements
const analyzeJobPosting = async (urlContent) => {
    try {
        const prompt = `
        Analyze the following job posting content and extract structured information. Return a JSON object with the following structure:
        {
            "jobTitle": "string",
            "company": "string",
            "location": "string",
            "salary": "string",
            "requirements": ["array of requirement strings"],
            "responsibilities": ["array of responsibility strings"],
            "skills": ["array of required skills"],
            "experience": "string",
            "education": "string"
        }
        
        Job posting content:
        ${urlContent.substring(0, 4000)}
        
        Extract only the information that is explicitly mentioned in the job posting. If any field is not found, use an empty string or empty array.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a job posting analyzer. Extract structured information from job postings and return valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 1000
        });

        const response = completion.choices[0].message.content;
        return JSON.parse(response);
    } catch (error) {
        console.error('Error analyzing job posting:', error);
        throw new Error('Failed to analyze job posting');
    }
};

// Function to calculate compatibility between CV and job posting
const calculateCompatibility = async (userDocuments, jobRequirements) => {
    try {
        // Combine all user documents
        const combinedText = userDocuments.map(doc => doc.extractedText).join(' ');
        
        const prompt = `You are a CV-job compatibility analyzer. Your task is to analyze the compatibility between a candidate's profile and a job posting.

IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any explanations, text, or markdown formatting.

Candidate's profile (from uploaded documents):
${combinedText.substring(0, 3000)}

Job requirements:
${JSON.stringify(jobRequirements, null, 2)}

Return ONLY a JSON object with this exact structure (no additional text):
{
    "overallMatch": 85,
    "categories": {
        "skills": 90,
        "experience": 75,
        "education": 80,
        "responsibilities": 85
    },
    "matchedSkills": ["skill1", "skill2"],
    "missingSkills": ["skill3", "skill4"],
    "recommendations": ["recommendation1", "recommendation2"]
}

Calculate realistic percentages based on the actual content. Skills should be matched case-insensitively.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a JSON-only response bot. You must respond with ONLY valid JSON objects. Never include explanations, text, or markdown formatting in your responses."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.1,
            max_tokens: 800
        });

        const response = completion.choices[0].message.content.trim();
        
        // Try to parse the response as JSON
        try {
            return JSON.parse(response);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response as JSON:', response);
            console.error('Parse error:', parseError);
            
            // Return a default compatibility structure if parsing fails
            return {
                overallMatch: 50,
                categories: {
                    skills: 50,
                    experience: 50,
                    education: 50,
                    responsibilities: 50
                },
                matchedSkills: [],
                missingSkills: [],
                recommendations: ["Unable to analyze compatibility due to parsing error"]
            };
        }
    } catch (error) {
        console.error('Error calculating compatibility:', error);
        throw new Error('Failed to calculate compatibility');
    }
};

// Function to generate CV data tailored to job posting
const generateCoverLetter = async (cvData, jobData, userInfo) => {
    try {
        const prompt = `Generate a professional cover letter for a job application based on the following information:

CV Data:
- Name: ${cvData.personalInfo?.firstName || userInfo.firstName} ${cvData.personalInfo?.lastName || userInfo.lastName}
- Email: ${cvData.personalInfo?.email || userInfo.email}
- Professional Summary: ${cvData.summary || 'Experienced professional'}
- Key Skills: ${cvData.skills?.join(', ') || 'Various skills'}
- Work Experience: ${cvData.workExperience?.map(exp => `${exp.position} at ${exp.company}`).join(', ') || 'Relevant experience'}

Job Information:
- Job Title: ${jobData.jobTitle || 'Position'}
- Company: ${jobData.company || 'Company'}
- Required Skills: ${jobData.requiredSkills?.join(', ') || 'Various skills'}
- Job Description: ${jobData.description || 'Job responsibilities'}

Please create a compelling cover letter that:
1. Addresses the hiring manager professionally
2. Explains why the candidate is interested in the position
3. Highlights relevant skills and experience from the CV
4. Shows enthusiasm for the company and role
5. Ends with a call to action for an interview

The cover letter should be professional, concise (around 300-400 words), and tailored to the specific job posting.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a professional career advisor and cover letter writer. Generate compelling, personalized cover letters that match the candidate's qualifications with the job requirements."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 800
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating cover letter:', error);
        return 'Unable to generate cover letter at this time.';
    }
};

const generateTailoredCVData = async (userDocuments, jobData, userInfo) => {
    try {
        const combinedText = userDocuments.map(doc => doc.extractedText).join(' ');
        
        const prompt = `You are a CV generation assistant. Your task is to create tailored CV data based on a candidate's documents and job requirements.

        IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any explanations, text, or markdown formatting.
        
        Job posting data:
        ${JSON.stringify(jobData, null, 2)}
        
        Candidate's documents:
        ${combinedText.substring(0, 3000)}
        
        User information:
        ${JSON.stringify(userInfo, null, 2)}
        
        Return ONLY a JSON object with this exact structure (no additional text):
        {
            "personalInfo": {
                "firstName": "string",
                "lastName": "string",
                "email": "string",
                "phone": "string",
                "address": "string",
                "linkedin": "string"
            },
            "summary": "string",
            "workExperience": [
                {
                    "company": "string",
                    "position": "string",
                    "period": "string",
                    "description": "string"
                }
            ],
            "education": [
                {
                    "institution": "string",
                    "degree": "string",
                    "period": "string",
                    "description": "string"
                }
            ],
            "skills": ["array of skills"],
            "languages": ["array of languages"],
            "certifications": ["array of certifications"]
        }
        
        Extract relevant information from the candidate's documents and tailor it to match the job requirements. If information is not available, use appropriate placeholder values.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a JSON-only response bot. You must respond with ONLY valid JSON objects. Never include explanations, text, or markdown formatting in your responses."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.1,
            max_tokens: 1500
        });

        const response = completion.choices[0].message.content.trim();
        
        // Try to parse the response as JSON
        try {
            return JSON.parse(response);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response as JSON:', response);
            console.error('Parse error:', parseError);
            
            // Return a default CV structure if parsing fails
            return {
                personalInfo: {
                    firstName: userInfo.firstname || "John",
                    lastName: userInfo.lastname || "Doe",
                    email: userInfo.email || "user@example.com",
                    phone: "+1234567890",
                    address: "City, Country",
                    linkedin: "linkedin.com/in/user"
                },
                summary: "Experienced professional with relevant skills and qualifications.",
                workExperience: [
                    {
                        company: "Company Name",
                        position: "Professional Role",
                        period: "2020 - Present",
                        description: "Professional experience and achievements."
                    }
                ],
                education: [
                    {
                        institution: "University Name",
                        degree: "Bachelor's Degree",
                        period: "2016 - 2020",
                        description: "Relevant field of study."
                    }
                ],
                skills: ["Skill 1", "Skill 2", "Skill 3"],
                languages: ["English"],
                certifications: ["Relevant Certification"]
            };
        }
    } catch (error) {
        console.error('Error generating tailored CV data:', error);
        throw new Error('Failed to generate tailored CV data');
    }
};

// Function to generate PDF from CV data
const generateCVJPG = async (cvData, templateId) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Generate HTML for the CV
        const html = generateCVHTML(cvData, templateId);
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        // Set viewport for consistent sizing
        await page.setViewport({ width: 1200, height: 1600 });
        
        // Wait for content to render
        await page.waitForTimeout(1000);
        
        // Take screenshot
        const screenshot = await page.screenshot({
            type: 'jpeg',
            quality: 90,
            fullPage: true
        });
        
        await browser.close();
        return screenshot;
    } catch (error) {
        console.error('Error generating CV JPG:', error);
        throw error;
    }
};

const generateCVPDF = async (cvData, templateId) => {
    try {
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Generate HTML content for the CV
        const htmlContent = generateCVHTML(cvData, templateId);
        
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.5in',
                left: '0.5in'
            }
        });
        
        await browser.close();
        return pdfBuffer;
    } catch (error) {
        console.error('PDF generation error:', error);
        throw error;
    }
};

// Function to generate HTML for CV
const generateCVHTML = (cvData, templateId) => {
    const template = getTemplateById(templateId);
    const colorClass = template?.color || 'primary';
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
            }
            .cv-container {
                max-width: 210mm;
                margin: 0 auto;
                background: white;
            }
            .cv-header {
                background: linear-gradient(135deg, #0d6efd, #0b5ed7);
                color: white;
                padding: 2rem;
            }
            .cv-name {
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
            }
            .cv-title {
                font-size: 1.5rem;
                font-weight: 500;
                opacity: 0.9;
                margin-bottom: 1rem;
            }
            .cv-summary {
                font-size: 1.1rem;
                line-height: 1.6;
                opacity: 0.95;
            }
            .cv-contact {
                margin-top: 1rem;
            }
            .cv-contact p {
                margin-bottom: 0.5rem;
                font-size: 0.95rem;
            }
            .cv-content {
                padding: 2rem;
            }
            .cv-section {
                margin-bottom: 2rem;
            }
            .cv-section-title {
                font-size: 1.3rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #0d6efd;
                border-bottom: 2px solid #0d6efd;
                padding-bottom: 0.5rem;
                margin-bottom: 1rem;
            }
            .cv-experience, .cv-education {
                margin-bottom: 1.5rem;
            }
            .cv-company, .cv-institution {
                font-weight: 600;
                color: #2c3e50;
                font-size: 1.1rem;
            }
            .cv-position, .cv-degree {
                font-weight: 500;
                color: #6c757d;
                font-size: 1rem;
            }
            .cv-period {
                font-size: 0.9rem;
                font-weight: 500;
                color: #6c757d;
            }
            .cv-description {
                line-height: 1.6;
                color: #495057;
                margin-top: 0.5rem;
            }
            .cv-skills {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            .skill-badge {
                background: #0d6efd;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 500;
            }
            .row {
                display: flex;
                gap: 2rem;
            }
            .col-md-8 {
                flex: 2;
            }
            .col-md-4 {
                flex: 1;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <div class="cv-header">
                <div class="row">
                    <div class="col-md-8">
                        <h1 class="cv-name">${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}</h1>
                        <h3 class="cv-title">${cvData.personalInfo.title || 'Professional'}</h3>
                        <p class="cv-summary">${cvData.summary || ''}</p>
                    </div>
                    <div class="col-md-4">
                        <div class="cv-contact">
                            ${cvData.personalInfo.email ? `<p>📧 ${cvData.personalInfo.email}</p>` : ''}
                            ${cvData.personalInfo.phone ? `<p>📞 ${cvData.personalInfo.phone}</p>` : ''}
                            ${cvData.personalInfo.address ? `<p>📍 ${cvData.personalInfo.address}</p>` : ''}
                            ${cvData.personalInfo.linkedin ? `<p>💼 ${cvData.personalInfo.linkedin}</p>` : ''}
                            ${cvData.personalInfo.website ? `<p>🌐 ${cvData.personalInfo.website}</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="cv-content">
                <div class="row">
                    <div class="col-md-8">
                        ${cvData.workExperience && cvData.workExperience.length > 0 ? `
                        <div class="cv-section">
                            <h4 class="cv-section-title">Professional Experience</h4>
                            ${cvData.workExperience.map(exp => `
                                <div class="cv-experience">
                                    <div style="display: flex; justify-content: space-between; align-items: start;">
                                        <h5 class="cv-company">${exp.company}</h5>
                                        <span class="cv-period">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
                                    </div>
                                    <h6 class="cv-position">${exp.position}</h6>
                                    <p class="cv-description">${exp.description || ''}</p>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                        
                        ${cvData.education && cvData.education.length > 0 ? `
                        <div class="cv-section">
                            <h4 class="cv-section-title">Education</h4>
                            ${cvData.education.map(edu => `
                                <div class="cv-education">
                                    <div style="display: flex; justify-content: space-between; align-items: start;">
                                        <h5 class="cv-institution">${edu.institution}</h5>
                                        <span class="cv-period">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}</span>
                                    </div>
                                    <h6 class="cv-degree">${edu.degree}</h6>
                                    ${edu.field ? `<p style="color: #6c757d; margin-top: 0.25rem;">${edu.field}</p>` : ''}
                                    ${edu.gpa ? `<p style="color: #6c757d; margin-top: 0.25rem;">GPA: ${edu.gpa}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="col-md-4">
                        ${cvData.skills && cvData.skills.length > 0 ? `
                        <div class="cv-section">
                            <h4 class="cv-section-title">Skills</h4>
                            <div class="cv-skills">
                                ${cvData.skills.map(skill => `
                                    <span class="skill-badge">${skill}</span>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${cvData.languages && cvData.languages.length > 0 ? `
                        <div class="cv-section">
                            <h4 class="cv-section-title">Languages</h4>
                            <div class="cv-skills">
                                ${cvData.languages.map(lang => `
                                    <span class="skill-badge">${lang}</span>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${cvData.certifications && cvData.certifications.length > 0 ? `
                        <div class="cv-section">
                            <h4 class="cv-section-title">Certifications</h4>
                            <ul style="list-style: none; padding: 0;">
                                ${cvData.certifications.map(cert => `
                                    <li style="margin-bottom: 0.5rem; padding-left: 1rem; position: relative;">
                                        <span style="position: absolute; left: 0; color: #0d6efd;">•</span>
                                        ${cert}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Helper function to get template by ID
const getTemplateById = (templateId) => {
    const templates = [
        { id: 'modern', name: 'Modern', color: 'primary', description: 'Clean and professional design' },
        { id: 'creative', name: 'Creative', color: 'success', description: 'Colorful and creative layout' },
        { id: 'minimal', name: 'Minimal', color: 'secondary', description: 'Simple and minimal design' },
        { id: 'executive', name: 'Executive', color: 'dark', description: 'Professional executive style' }
    ];
    return templates.find(t => t.id === templateId) || templates[0];
};

// OpenAI function to extract CV data from documents
const extractCVDataFromDocuments = async (documents) => {
    try {
        // Combine all document texts
        const allTexts = documents.map(doc => doc.extractedText).join('\n\n');
        
        const prompt = `
        Please analyze the following document content and extract CV/resume information. 
        Return the data in the following JSON format:
        
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
        
        Document content:
        ${allTexts}
        
        IMPORTANT INSTRUCTIONS:
        1. Extract ONLY information that is explicitly present in the documents
        2. If a field is not found in the documents, leave it as an empty string ("") or empty array []
        3. Do NOT make up or infer information that is not directly stated
        4. Do NOT use placeholder text or default values
        5. For arrays (workExperience, education, skills, etc.), only include items that are clearly mentioned
        6. If no relevant information is found, return empty arrays and empty strings
        7. Be conservative - it's better to leave fields empty than to include incorrect information
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a professional CV/resume parser. Your job is to extract ONLY information that is explicitly present in the provided documents. Do not make assumptions or add placeholder data. If information is not found, leave fields empty."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 2000
        });

        const response = completion.choices[0].message.content;
        
        // Try to parse the JSON response
        try {
            const cvData = JSON.parse(response);
            
            // Clean up the extracted data to ensure empty fields are properly handled
            const cleanedCVData = cleanExtractedCVData(cvData);
            
            return {
                success: true,
                data: cleanedCVData
            };
        } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError);
            return {
                success: false,
                message: 'Failed to parse extracted data'
            };
        }
    } catch (error) {
        console.error('OpenAI API error:', error);
        return {
            success: false,
            message: 'Failed to extract CV data from documents'
        };
    }
};

// Routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, username, email, password, plan } = req.body;

        if (!firstName || !lastName || !username || !email || !password || !plan) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required including plan selection'
            });
        }

        // Validate plan
        if (!['Free', 'Basic', 'Pro'].includes(plan)) {
            return res.status(400).json({
                success: false,
                message: 'Plan must be either "Free", "Basic", or "Pro"'
            });
        }

        const users = readUsers();

        // Check if email already exists
        if (findUserByEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Check if username already exists
        if (findUserByUsername(username)) {
            return res.status(400).json({
                success: false,
                message: 'Username already taken'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            userId: uuidv4(),
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            plan: plan,
            cvLimit: plan === 'Free' ? 5 : plan === 'Basic' ? 15 : 25,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        writeUsers(users);

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.userId, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const users = readUsers();
        const user = findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.userId, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get user profile (protected route)
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    try {
        const users = readUsers();
        const user = users.find(u => u.userId === req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get user plan information
app.get('/api/auth/plan-info', authenticateToken, (req, res) => {
    try {
        const limitCheck = checkCVLimit(req.user.userId);
        
        res.json({
            success: true,
            planInfo: {
                plan: limitCheck.plan,
                currentCount: limitCheck.currentCount,
                usedCVs: limitCheck.currentCount, // For frontend compatibility
                limit: limitCheck.limit,
                cvLimit: limitCheck.limit, // For frontend compatibility
                remaining: limitCheck.remaining,
                allowed: limitCheck.allowed
            }
        });
    } catch (error) {
        console.error('Plan info error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Document routes

// Upload document
app.post('/api/documents/upload', authenticateToken, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { originalname, filename, mimetype, size, path: filePath } = req.file;
        let extractedText = '';

        // Extract text based on file type
        try {
            if (mimetype === 'application/pdf') {
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdfParse(dataBuffer);
                extractedText = data.text;
            } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const result = await mammoth.extractRawText({ path: filePath });
                extractedText = result.value;
            } else if (mimetype === 'text/plain') {
                extractedText = fs.readFileSync(filePath, 'utf8');
            }
        } catch (extractError) {
            console.error('Text extraction error:', extractError);
            extractedText = 'Text extraction failed';
        }

        // Create document record
        const document = {
            documentId: uuidv4(),
            userId: req.user.userId,
            fileName: filename,
            originalName: originalname,
            filePath: filePath,
            fileType: mimetype,
            fileSize: size,
            extractedText: extractedText,
            uploadedAt: new Date().toISOString()
        };

        // Save to documents.json
        const documents = readDocuments();
        documents.push(document);
        writeDocuments(documents);

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            document: {
                documentId: document.documentId,
                fileName: document.fileName,
                originalName: document.originalName,
                fileType: document.fileType,
                fileSize: document.fileSize,
                extractedText: document.extractedText,
                uploadedAt: document.uploadedAt
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload document'
        });
    }
});

// Get user's documents
app.get('/api/documents', authenticateToken, (req, res) => {
    try {
        const userDocuments = findDocumentsByUserId(req.user.userId);
        
        // Remove filePath from response for security
        const safeDocuments = userDocuments.map(doc => {
            const { filePath, ...safeDoc } = doc;
            return safeDoc;
        });

        res.json({
            success: true,
            documents: safeDocuments
        });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve documents'
        });
    }
});

// Get specific document
app.get('/api/documents/:documentId', authenticateToken, (req, res) => {
    try {
        const { documentId } = req.params;
        const documents = readDocuments();
        const document = documents.find(doc => doc.documentId === documentId && doc.userId === req.user.userId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Remove filePath from response for security
        const { filePath, ...safeDocument } = document;

        res.json({
            success: true,
            document: safeDocument
        });
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve document'
        });
    }
});

// Delete document
app.delete('/api/documents/:documentId', authenticateToken, (req, res) => {
    try {
        const { documentId } = req.params;
        const documents = readDocuments();
        const documentIndex = documents.findIndex(doc => doc.documentId === documentId && doc.userId === req.user.userId);

        if (documentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const document = documents[documentIndex];

        // Delete file from filesystem
        try {
            if (fs.existsSync(document.filePath)) {
                fs.unlinkSync(document.filePath);
            }
        } catch (fileError) {
            console.error('File deletion error:', fileError);
        }

        // Remove from documents array
        documents.splice(documentIndex, 1);
        writeDocuments(documents);

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document'
        });
    }
});

// URL analysis and compatibility checking endpoint
app.post('/api/cv/analyze-url', authenticateToken, async (req, res) => {
    try {
        const { url } = req.body;
        const userId = req.user.userId;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Get user documents
        const userDocuments = findDocumentsByUserId(userId);
        if (userDocuments.length === 0) {
            return res.status(400).json({ error: 'No documents uploaded. Please upload documents first.' });
        }

        // Extract content from URL
        const urlContent = await extractURLContent(url);
        
        // Analyze job posting
        const jobData = await analyzeJobPosting(urlContent);
        
        // Calculate compatibility
        const compatibility = await calculateCompatibility(userDocuments, jobData);

        res.json({
            jobData,
            compatibility,
            url
        });
    } catch (error) {
        console.error('Error analyzing URL:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate tailored CV from URL endpoint
app.post('/api/cv/generate-from-url', authenticateToken, async (req, res) => {
    try {
        const { url, templateId, title } = req.body;
        const userId = req.user.userId;

        if (!url || !templateId || !title) {
            return res.status(400).json({ error: 'URL, template ID, and title are required' });
        }

        // Get user documents
        const userDocuments = findDocumentsByUserId(userId);
        if (userDocuments.length === 0) {
            return res.status(400).json({ error: 'No documents uploaded. Please upload documents first.' });
        }

        // Get user info
        const users = readUsers();
        const user = users.find(u => u.userId === userId);

        // Check CV limit
        const limitCheck = checkCVLimit(userId);
        if (!limitCheck.allowed) {
            return res.status(403).json({
                success: false,
                message: `CV limit reached. You have used ${limitCheck.currentCount}/${limitCheck.limit} CVs on your ${limitCheck.plan} plan. Please upgrade to create more CVs.`
            });
        }

        // Extract content from URL
        const urlContent = await extractURLContent(url);
        
        // Analyze job posting
        const jobData = await analyzeJobPosting(urlContent);
        
        // Generate tailored CV data
        const cvData = await generateTailoredCVData(userDocuments, jobData, user);

        // Save CV
        const cvs = readCVs();
        const newCV = {
            cvId: uuidv4(),
            userId,
            title,
            templateId,
            cvData,
            jobData,
            url,
            cvType: 'job-related', // Job-related CV
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        cvs.push(newCV);
        writeCVs(cvs);

        res.json({
            success: true,
            cv: newCV,
            message: 'CV generated successfully'
        });
    } catch (error) {
        console.error('Error generating CV from URL:', error);
        res.status(500).json({ error: error.message });
    }
});

// New endpoint: Extract CV data from user's documents using OpenAI
app.post('/api/cv/extract-from-documents', authenticateToken, async (req, res) => {
    try {
        // Get user's documents
        const userDocuments = findDocumentsByUserId(req.user.userId);
        
        if (userDocuments.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No documents found. Please upload some documents first.'
            });
        }

        // Extract CV data using OpenAI
        const result = await extractCVDataFromDocuments(userDocuments);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'CV data extracted successfully',
                cvData: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('CV extraction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to extract CV data from documents'
        });
    }
});

// CV Management endpoints

// Create new CV
app.post('/api/cv/create', authenticateToken, async (req, res) => {
    try {
        const { cvData, templateId, title } = req.body;

        if (!cvData || !templateId || !title) {
            return res.status(400).json({
                success: false,
                message: 'CV data, template ID, and title are required'
            });
        }

        // Check CV limit
        const limitCheck = checkCVLimit(req.user.userId);
        if (!limitCheck.allowed) {
            return res.status(403).json({
                success: false,
                message: `CV limit reached. You have used ${limitCheck.currentCount}/${limitCheck.limit} CVs on your ${limitCheck.plan} plan. Please upgrade to create more CVs.`
            });
        }

        const newCV = {
            cvId: uuidv4(),
            userId: req.user.userId,
            title: title,
            templateId: templateId,
            cvData: cvData,
            cvType: 'custom', // Custom generated CV
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const cvs = readCVs();
        cvs.push(newCV);
        writeCVs(cvs);

        res.status(201).json({
            success: true,
            message: 'CV created successfully',
            cv: {
                cvId: newCV.cvId,
                title: newCV.title,
                templateId: newCV.templateId,
                createdAt: newCV.createdAt,
                updatedAt: newCV.updatedAt
            }
        });
    } catch (error) {
        console.error('CV creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create CV'
        });
    }
});

// Get user's CVs
app.get('/api/cv', authenticateToken, (req, res) => {
    try {
        const userCVs = findCVsByUserId(req.user.userId);
        
        // Remove cvData from response for list view
        const safeCVs = userCVs.map(cv => ({
            cvId: cv.cvId,
            title: cv.title,
            templateId: cv.templateId,
            cvType: cv.cvType || 'custom', // Default to custom if not set
            createdAt: cv.createdAt,
            updatedAt: cv.updatedAt
        }));

        res.json({
            success: true,
            cvs: safeCVs
        });
    } catch (error) {
        console.error('Get CVs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve CVs'
        });
    }
});

// Get specific CV
app.get('/api/cv/:cvId', authenticateToken, (req, res) => {
    try {
        const { cvId } = req.params;
        const cvs = readCVs();
        const cv = cvs.find(c => c.cvId === cvId && c.userId === req.user.userId);

        if (!cv) {
            return res.status(404).json({
                success: false,
                message: 'CV not found'
            });
        }

        res.json({
            success: true,
            cv: cv
        });
    } catch (error) {
        console.error('Get CV error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve CV'
        });
    }
});

// Update CV
app.put('/api/cv/:cvId', authenticateToken, (req, res) => {
    try {
        const { cvId } = req.params;
        const { cvData, title } = req.body;
        
        const cvs = readCVs();
        const cvIndex = cvs.findIndex(c => c.cvId === cvId && c.userId === req.user.userId);

        if (cvIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'CV not found'
            });
        }

        cvs[cvIndex] = {
            ...cvs[cvIndex],
            cvData: cvData || cvs[cvIndex].cvData,
            title: title || cvs[cvIndex].title,
            updatedAt: new Date().toISOString()
        };

        writeCVs(cvs);

        res.json({
            success: true,
            message: 'CV updated successfully',
            cv: {
                cvId: cvs[cvIndex].cvId,
                title: cvs[cvIndex].title,
                templateId: cvs[cvIndex].templateId,
                createdAt: cvs[cvIndex].createdAt,
                updatedAt: cvs[cvIndex].updatedAt
            }
        });
    } catch (error) {
        console.error('Update CV error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update CV'
        });
    }
});

// Delete CV
app.delete('/api/cv/:cvId', authenticateToken, (req, res) => {
    try {
        const { cvId } = req.params;
        const cvs = readCVs();
        const cvIndex = cvs.findIndex(c => c.cvId === cvId && c.userId === req.user.userId);

        if (cvIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'CV not found'
            });
        }

        cvs.splice(cvIndex, 1);
        writeCVs(cvs);

        res.json({
            success: true,
            message: 'CV deleted successfully'
        });
    } catch (error) {
        console.error('Delete CV error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete CV'
        });
    }
});

// Download CV as PDF
app.get('/api/cv/:cvId/download', authenticateToken, async (req, res) => {
    try {
        const { cvId } = req.params;
        const cvs = readCVs();
        const cv = cvs.find(c => c.cvId === cvId && c.userId === req.user.userId);

        if (!cv) {
            return res.status(404).json({
                success: false,
                message: 'CV not found'
            });
        }

        // Generate PDF
        const pdfBuffer = await generateCVPDF(cv.cvData, cv.templateId);

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${cv.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF download error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF'
        });
    }
});

// Download CV as JPG
app.get('/api/cv/:cvId/download-jpg', authenticateToken, async (req, res) => {
    try {
        const { cvId } = req.params;
        const cvs = readCVs();
        const cv = cvs.find(c => c.cvId === cvId && c.userId === req.user.userId);

        if (!cv) {
            return res.status(404).json({
                success: false,
                message: 'CV not found'
            });
        }

        // Generate JPG
        const jpgBuffer = await generateCVJPG(cv.cvData, cv.templateId);

        // Set response headers for JPG download
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${cv.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg"`);
        res.setHeader('Content-Length', jpgBuffer.length);

        res.send(jpgBuffer);
    } catch (error) {
        console.error('JPG download error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate JPG'
        });
    }
});

// Generate cover letter for CV
app.post('/api/cv/:cvId/cover-letter', authenticateToken, async (req, res) => {
    try {
        const { cvId } = req.params;
        const cvs = readCVs();
        const cv = cvs.find(c => c.cvId === cvId && c.userId === req.user.userId);

        if (!cv) {
            return res.status(404).json({
                success: false,
                message: 'CV not found'
            });
        }

        // Get user info
        const users = readUsers();
        const user = users.find(u => u.userId === req.user.userId);

        let coverLetter;
        
        if (cv.cvType === 'job-related' && cv.jobData) {
            // Generate job-specific cover letter
            coverLetter = await generateCoverLetter(cv.cvData, cv.jobData, user);
        } else {
            // Generate generic cover letter
            coverLetter = await generateCoverLetter(cv.cvData, {
                jobTitle: 'Position',
                company: 'Company',
                requiredSkills: cv.cvData.skills || [],
                description: 'Professional opportunity'
            }, user);
        }

        res.json({
            success: true,
            coverLetter: coverLetter
        });
    } catch (error) {
        console.error('Cover letter generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate cover letter'
        });
    }
});

// Admin endpoint to get all users with CV usage statistics
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = readUsers();
        const cvs = readCVs();
        
        // Enhance user data with CV usage statistics
        const usersWithStats = users.map(user => {
            const userCVs = cvs.filter(cv => cv.userId === user.userId);
            const currentCount = userCVs.length;
            const limit = user.cvLimit || (user.plan === 'Free' ? 5 : user.plan === 'Basic' ? 15 : 25);
            const remaining = Math.max(0, limit - currentCount);
            
            return {
                ...user,
                currentCount,
                limit,
                remaining,
                // Remove sensitive data
                password: undefined
            };
        });

        res.json({
            success: true,
            users: usersWithStats
        });
    } catch (error) {
        console.error('Admin users endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users data'
        });
    }
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 
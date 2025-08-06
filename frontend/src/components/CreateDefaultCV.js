import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCVs } from '../context/CVContext';

const CreateDefaultCV = () => {
    const { user } = useAuth();
    const { createCV } = useCVs();
    const navigate = useNavigate();
    const location = useLocation();
    const template = location.state?.template;
    const extractedCVData = location.state?.cvData;
    const extractedFromDocuments = location.state?.extractedFromDocuments || false;

    const [formData, setFormData] = useState({
        title: '',
        personalInfo: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: '',
            address: '',
            linkedin: '',
            website: ''
        },
        summary: '',
        workExperience: [
            {
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            }
        ],
        education: [
            {
                institution: '',
                degree: '',
                field: '',
                startDate: '',
                endDate: '',
                current: false,
                gpa: ''
            }
        ],
        skills: [],
        languages: [],
        certifications: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Helper function to check if meaningful data was extracted
    const hasExtractedData = () => {
        return extractedCVData && (
            extractedCVData.personalInfo?.firstName || 
            extractedCVData.personalInfo?.lastName || 
            extractedCVData.personalInfo?.email ||
            extractedCVData.summary ||
            extractedCVData.workExperience?.length > 0 ||
            extractedCVData.education?.length > 0 ||
            extractedCVData.skills?.length > 0
        );
    };

    // Initialize form data with extracted CV data if available
    useEffect(() => {
        if (extractedCVData && extractedFromDocuments) {
            setFormData(prev => ({
                ...prev,
                personalInfo: {
                    // For basic user info, use extracted data first, then fall back to user data
                    firstName: extractedCVData.personalInfo?.firstName || user?.firstName || '',
                    lastName: extractedCVData.personalInfo?.lastName || user?.lastName || '',
                    email: extractedCVData.personalInfo?.email || user?.email || '',
                    // For other personal info, use extracted data only (leave empty if not found)
                    phone: extractedCVData.personalInfo?.phone || '',
                    address: extractedCVData.personalInfo?.address || '',
                    linkedin: extractedCVData.personalInfo?.linkedin || '',
                    website: extractedCVData.personalInfo?.website || ''
                },
                summary: extractedCVData.summary || '',
                workExperience: extractedCVData.workExperience?.length > 0 
                    ? extractedCVData.workExperience 
                    : [{
                        company: '',
                        position: '',
                        startDate: '',
                        endDate: '',
                        current: false,
                        description: ''
                    }],
                education: extractedCVData.education?.length > 0 
                    ? extractedCVData.education 
                    : [{
                        institution: '',
                        degree: '',
                        field: '',
                        startDate: '',
                        endDate: '',
                        current: false,
                        gpa: ''
                    }],
                skills: extractedCVData.skills || [],
                languages: extractedCVData.languages || [],
                certifications: extractedCVData.certifications || []
            }));
        }
    }, [extractedCVData, extractedFromDocuments, user]);

    const handleInputChange = (section, field, value, index = null) => {
        setFormData(prev => {
            const newData = { ...prev };
            if (index !== null) {
                newData[section][index][field] = value;
            } else if (field === '') {
                // Handle direct section updates (like title and summary)
                newData[section] = value;
            } else {
                newData[section][field] = value;
            }
            return newData;
        });
    };

    const addWorkExperience = () => {
        setFormData(prev => ({
            ...prev,
            workExperience: [
                ...prev.workExperience,
                {
                    company: '',
                    position: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    description: ''
                }
            ]
        }));
    };

    const removeWorkExperience = (index) => {
        setFormData(prev => ({
            ...prev,
            workExperience: prev.workExperience.filter((_, i) => i !== index)
        }));
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [
                ...prev.education,
                {
                    institution: '',
                    degree: '',
                    field: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    gpa: ''
                }
            ]
        }));
    };

    const removeEducation = (index) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };

    const addSkill = () => {
        const skill = prompt('Enter a skill:');
        if (skill && skill.trim()) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skill.trim()]
            }));
        }
    };

    const removeSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.title.trim()) {
            setError('Please enter a title for your CV');
            setLoading(false);
            return;
        }

        try {
            const cvData = {
                personalInfo: formData.personalInfo,
                summary: formData.summary,
                workExperience: formData.workExperience,
                education: formData.education,
                skills: formData.skills,
                languages: formData.languages,
                certifications: formData.certifications
            };

            const result = await createCV(cvData, template?.id || 'modern', formData.title);
            
            if (result) {
                alert('CV created successfully!');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error creating CV:', error);
            setError('Failed to create CV. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <h2 className="mb-0">
                                    <i className="bi bi-file-earmark-plus me-2"></i>
                                    Create Default CV
                                </h2>
                                {extractedFromDocuments && (
                                    <div className={`alert ${hasExtractedData() ? 'alert-success' : 'alert-warning'} mb-0 py-2 px-3`}>
                                        <i className={`bi ${hasExtractedData() ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                                        <small>
                                            {hasExtractedData() 
                                                ? 'Data extracted from uploaded documents using AI'
                                                : 'No CV data found in documents'
                                            }
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {extractedFromDocuments && (
                                <div className="alert alert-info" role="alert">
                                    <i className="bi bi-info-circle me-2"></i>
                                    <strong>AI-Powered Data Extraction:</strong> 
                                    {hasExtractedData() 
                                        ? " Your CV form has been pre-filled with information extracted from your uploaded documents using OpenAI. You can review and edit any fields as needed."
                                        : " No relevant CV information was found in your uploaded documents. The form has been left empty for you to fill in manually."
                                    }
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* CV Title */}
                                <div className="mb-4">
                                    <h4 className="border-bottom pb-2">
                                        <i className="bi bi-file-earmark-text me-2"></i>
                                        CV Title
                                    </h4>
                                    <div className="mb-3">
                                        <label className="form-label">CV Title *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter a title for your CV (e.g., 'Software Developer CV', 'Marketing Manager CV')"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', '', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div className="mb-4">
                                    <h4 className="border-bottom pb-2">
                                        <i className="bi bi-person-circle me-2"></i>
                                        Personal Information
                                    </h4>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">First Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.personalInfo.firstName}
                                                onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Last Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.personalInfo.lastName}
                                                onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={formData.personalInfo.email}
                                                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={formData.personalInfo.phone}
                                                onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Address</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={formData.personalInfo.address}
                                            onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">LinkedIn</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                value={formData.personalInfo.linkedin}
                                                onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Website</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                value={formData.personalInfo.website}
                                                onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Summary */}
                                <div className="mb-4">
                                    <h4 className="border-bottom pb-2">
                                        <i className="bi bi-card-text me-2"></i>
                                        Professional Summary
                                    </h4>
                                    <div className="mb-3">
                                        <label className="form-label">Summary *</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            placeholder="Write a brief professional summary..."
                                            value={formData.summary}
                                            onChange={(e) => handleInputChange('summary', '', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Work Experience */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                        <h4 className="mb-0">
                                            <i className="bi bi-briefcase me-2"></i>
                                            Work Experience
                                        </h4>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={addWorkExperience}
                                        >
                                            <i className="bi bi-plus-circle me-1"></i>
                                            Add Experience
                                        </button>
                                    </div>
                                    {formData.workExperience.map((exp, index) => (
                                        <div key={index} className="card mt-3">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <h6 className="card-title">Experience #{index + 1}</h6>
                                                    {formData.workExperience.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => removeWorkExperience(index)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Company *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={exp.company}
                                                            onChange={(e) => handleInputChange('workExperience', 'company', e.target.value, index)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Position *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={exp.position}
                                                            onChange={(e) => handleInputChange('workExperience', 'position', e.target.value, index)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label">Start Date *</label>
                                                        <input
                                                            type="month"
                                                            className="form-control"
                                                            value={exp.startDate}
                                                            onChange={(e) => handleInputChange('workExperience', 'startDate', e.target.value, index)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label">End Date</label>
                                                        <input
                                                            type="month"
                                                            className="form-control"
                                                            value={exp.endDate}
                                                            onChange={(e) => handleInputChange('workExperience', 'endDate', e.target.value, index)}
                                                            disabled={exp.current}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3 d-flex align-items-end">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={exp.current}
                                                                onChange={(e) => handleInputChange('workExperience', 'current', e.target.checked, index)}
                                                            />
                                                            <label className="form-check-label">
                                                                Currently working here
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Description</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="3"
                                                        value={exp.description}
                                                        onChange={(e) => handleInputChange('workExperience', 'description', e.target.value, index)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Education */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                        <h4 className="mb-0">
                                            <i className="bi bi-mortarboard me-2"></i>
                                            Education
                                        </h4>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={addEducation}
                                        >
                                            <i className="bi bi-plus-circle me-1"></i>
                                            Add Education
                                        </button>
                                    </div>
                                    {formData.education.map((edu, index) => (
                                        <div key={index} className="card mt-3">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <h6 className="card-title">Education #{index + 1}</h6>
                                                    {formData.education.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => removeEducation(index)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Institution *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={edu.institution}
                                                            onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Degree *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={edu.degree}
                                                            onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">Field of Study</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={edu.field}
                                                            onChange={(e) => handleInputChange('education', 'field', e.target.value, index)}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <label className="form-label">GPA</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={edu.gpa}
                                                            onChange={(e) => handleInputChange('education', 'gpa', e.target.value, index)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label">Start Date</label>
                                                        <input
                                                            type="month"
                                                            className="form-control"
                                                            value={edu.startDate}
                                                            onChange={(e) => handleInputChange('education', 'startDate', e.target.value, index)}
                                                        />
                                                    </div>
                                                    <div className="col-md-3 mb-3">
                                                        <label className="form-label">End Date</label>
                                                        <input
                                                            type="month"
                                                            className="form-control"
                                                            value={edu.endDate}
                                                            onChange={(e) => handleInputChange('education', 'endDate', e.target.value, index)}
                                                            disabled={edu.current}
                                                        />
                                                    </div>
                                                    <div className="col-md-6 mb-3 d-flex align-items-end">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={edu.current}
                                                                onChange={(e) => handleInputChange('education', 'current', e.target.checked, index)}
                                                            />
                                                            <label className="form-check-label">
                                                                Currently studying
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Skills */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                        <h4 className="mb-0">
                                            <i className="bi bi-tools me-2"></i>
                                            Skills
                                        </h4>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={addSkill}
                                        >
                                            <i className="bi bi-plus-circle me-1"></i>
                                            Add Skill
                                        </button>
                                    </div>
                                    <div className="mt-3">
                                        {formData.skills.map((skill, index) => (
                                            <span key={index} className="badge bg-primary me-2 mb-2 p-2">
                                                {skill}
                                                <button
                                                    type="button"
                                                    className="btn-close btn-close-white ms-2"
                                                    onClick={() => removeSkill(index)}
                                                ></button>
                                            </span>
                                        ))}
                                        {formData.skills.length === 0 && (
                                            <p className="text-muted">No skills added yet. Click "Add Skill" to get started.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Back to Dashboard
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Creating CV...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                Create CV
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateDefaultCV; 
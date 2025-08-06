import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        
        // Add a small delay to ensure state updates are processed
        setTimeout(() => {
            navigate('/login');
        }, 100);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    AI CV Creator
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        {isAuthenticated && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/dashboard">
                                    Dashboard
                                </Link>
                            </li>
                        )}
                    </ul>

                    <ul className="navbar-nav">
                        {isAuthenticated ? (
                            <>
                                <li className="nav-item dropdown" ref={dropdownRef}>
                                    <button
                                        className="nav-link dropdown-toggle"
                                        type="button"
                                        onClick={toggleDropdown}
                                        aria-expanded={dropdownOpen}
                                    >
                                        <i className="bi bi-person-circle me-1"></i>
                                        {user?.firstName || user?.firstname} {user?.lastName || user?.lastname}
                                    </button>
                                    <ul className={`dropdown-menu dropdown-menu-end ${dropdownOpen ? 'show' : ''}`}>
                                        <li>
                                            <div className="dropdown-item-text">
                                                <small className="text-muted">Username</small><br />
                                                <strong>{user?.username}</strong>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="dropdown-item-text">
                                                <small className="text-muted">Email</small><br />
                                                <strong>{user?.email}</strong>
                                            </div>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <Link
                                                className="dropdown-item"
                                                to="/dashboard/account-details"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <i className="bi bi-person-gear me-1"></i>
                                                Account Details
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button
                                                className="dropdown-item text-danger"
                                                onClick={handleLogout}
                                            >
                                                <i className="bi bi-box-arrow-right me-1"></i>
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CreateDefaultCV from './components/CreateDefaultCV';
import CreateCVForURL from './components/CreateCVForURL';
import CVTemplateSelection from './components/CVTemplateSelection';
import CVPreview from './components/CVPreview';
import CVList from './components/CVList';
import CVView from './components/CVView';
import AccountDetails from './components/AccountDetails';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/cv-templates" 
            element={
              <ProtectedRoute>
                <CVTemplateSelection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/cv-preview/:templateId" 
            element={
              <ProtectedRoute>
                <CVPreview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/create-cv" 
            element={
              <ProtectedRoute>
                <CreateDefaultCV />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/create-cv-url" 
            element={
              <ProtectedRoute>
                <CreateCVForURL />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/view-cv/:cvId" 
            element={
              <ProtectedRoute>
                <CVView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/edit-cv/:cvId" 
            element={
              <ProtectedRoute>
                <CreateDefaultCV />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/account-details" 
            element={
              <ProtectedRoute>
                <AccountDetails />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

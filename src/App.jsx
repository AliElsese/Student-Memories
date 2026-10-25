import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { AmbientBackground } from './components/layout/AmbientBackground.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { GroupCardsPage } from './pages/GroupCardsPage.jsx';
import { MessagesPage } from './pages/MessagesPage.jsx';
import { AdminLoginPage } from './pages/AdminLoginPage.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="relative min-h-screen flex flex-col font-sans">
          {/* Ambient Glowing Glass Background */}
          <AmbientBackground />

          {/* Sticky Glass Navbar */}
          <Navbar />

          {/* Page Routing */}
          <main className="flex-grow">
            <Routes>
              {/* Default redirect to Register */}
              <Route path="/" element={<Navigate to="/register" replace />} />
              
              {/* Page 1: Student Registration & QR Code Generation */}
              <Route path="/register" element={<RegisterPage />} />

              {/* Page 2: Group Students Cards from Scanned QR */}
              <Route path="/cards/:studentId" element={<GroupCardsPage />} />

              {/* Page 4: Anonymous Messages Inbox for QR Owner */}
              <Route path="/messages/:studentId" element={<MessagesPage />} />

              {/* Super Admin Authentication & Dashboard */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

              {/* Catch-all unknown routes redirect to register */}
              <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

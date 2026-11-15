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
          <AmbientBackground />

          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Navigate to="/register" replace />} />
              
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/cards/:studentId" element={<GroupCardsPage />} />

              <Route path="/messages/:studentId" element={<MessagesPage />} />

              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

              <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

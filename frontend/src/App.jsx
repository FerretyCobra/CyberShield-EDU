import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/layout/Sidebar';

import TextScan from './pages/detection/TextScan';
import URLScan from './pages/detection/URLScan';
import PDFScan from './pages/detection/PDFScan';
import ImageScan from './pages/detection/ImageScan';

import Awareness from './pages/awareness/Awareness';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen">

        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Application Area */}
        <main className="main-content flex-1 overflow-y-auto">

          {/* Page Wrapper */}
          <div className="max-w-6xl mx-auto w-full">

            {/* Routes */}
            <Routes>
              <Route path="/" element={<Navigate to="/text" replace />} />

              <Route path="/text" element={<TextScan />} />
              <Route path="/url" element={<URLScan />} />
              <Route path="/pdf" element={<PDFScan />} />
              <Route path="/image" element={<ImageScan />} />

              <Route path="/awareness" element={<Awareness />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>

          </div>

        </main>

      </div>
    </Router>
  );
}

export default App;
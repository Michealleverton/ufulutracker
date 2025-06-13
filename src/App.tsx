import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './pages/Navbar';
import { Footer } from './pages/Footer';
import { Home } from './pages/Home';
import { Community } from './pages/Community';
import './css/Loader.css'

// Lazy-loaded components
const Analytics = React.lazy(() => import('./pages/userdash/pages/Analytics'));
const Login = React.lazy(() => import('./pages/userdash/pages/Login'));
const Register = React.lazy(() => import('./pages/userdash/pages/Register'));
const Dashboard = React.lazy(() => import('./pages/userdash/pages/Dashboard'));
const Journal = React.lazy(() => import('./pages/userdash/pages/Journal'));
const Trades = React.lazy(() => import('./pages/userdash/pages/Trades'));
const Settings = React.lazy(() => import('./pages/userdash/pages/Settings'));
const Tradingplan = React.lazy(() => import('./pages/userdash/pages/Tradingplan'));
const NewsPage = React.lazy(() => import('./pages/userdash/pages/News'));
const Charts = React.lazy(() => import('./pages/userdash/pages/Charts'));
// const Overview = React.lazy(() => import('./pages/userdash/pages/Overview')); // Uncomment if needed

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
        <Suspense 
          fallback={
            <div className="flex justify-center items-center h-screen bg-gray-900">
              <div className='loader'>
                <div className="loader-item"></div>
                <div className="loader-item"></div>
                <div className="loader-item"></div>
              </div>
            </div>
          }
        >
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Home />
                  <Footer />
                </>
              }
            />
            <Route
              path="/community"
              element={
                <>
                  <Navbar />
                  <Community />
                  <Footer />
                </>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard/*" element={<Dashboard />}>
              <Route index element={<Analytics />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="journal" element={<Journal />} />
              <Route path="trades" element={<Trades />} />
              <Route path="settings" element={<Settings />} />
              <Route path="tradingplan" element={<Tradingplan />} />
              <Route path="news" element={<NewsPage />} />
              {/* <Route path="overview" element={<Overview />} /> */}
              <Route path="charts" element={<Charts />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      
    </Router>
  );
}
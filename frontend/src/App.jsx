import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Chatbot from './pages/Chatbot'
import AuthPage from './pages/AuthPage'
import BottomNav from './components/BottomNav'
import DiseaseDetection from './pages/DiseaseDetection'
import Weather from './pages/Weather'
import FertilizerGuide from './pages/FertilizerGuide'
import MandiPrices from './pages/MandiPrices'
import SoilChecker from './pages/SoilChecker'
import FasalCalendar from './pages/FasalCalendar'
import Settings from './pages/Settings'
import AdminPanel from './pages/AdminPanel'
import AdminRoute from './components/AdminRoute'
import OfflineBanner from './components/OfflineBanner'
import InstallPWA from './components/InstallPWA'
import ForgotPassword from './pages/ForgotPassword'
import ChatHistory from './pages/ChatHistory'
import ExpenseTracker from './pages/ExpenseTracker'
import Community from './pages/Community'
import CropRecommendation from './pages/CropRecommendation'
import YieldPrediction from './pages/YieldPrediction'
import SprayCalculator from './pages/SprayCalculator'
import FasalDiary from './pages/FasalDiary'
import About from './pages/About'
import FAQ from './pages/FAQ'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'

const NO_NAV_PAGES = ['/auth', '/forgot-password', '/reset-password']

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                element={<Home />} />
      <Route path="/auth"            element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ForgotPassword />} />
      <Route path="/chat"            element={<Chatbot />} />
      <Route path="/history"         element={<ChatHistory />} />
      <Route path="/disease"         element={<DiseaseDetection />} />
      <Route path="/weather"         element={<Weather />} />
      <Route path="/fertilizer"      element={<FertilizerGuide />} />
      <Route path="/mandi"           element={<MandiPrices />} />
      <Route path="/soil"            element={<SoilChecker />} />
      <Route path="/calendar"        element={<FasalCalendar />} />
      <Route path="/settings"        element={<Settings />} />
      <Route path="/expense"         element={<ExpenseTracker />} />
      <Route path="/community"       element={<Community />} />
      <Route path="/crop"            element={<CropRecommendation />} />
      <Route path="/yield"           element={<YieldPrediction />} />
      <Route path="/spray"           element={<SprayCalculator />} />
      <Route path="/diary"           element={<FasalDiary />} />
      <Route path="/about"           element={<About />} />
      <Route path="/faq"             element={<FAQ />} />
      <Route path="/privacy"         element={<PrivacyPolicy />} />
      <Route path="/terms"           element={<TermsOfService />} />
      <Route path="/admin/*"         element={
        <AdminRoute><AdminPanel /></AdminRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  const location = useLocation()
  const hideNav  = NO_NAV_PAGES.some(p => location.pathname.startsWith(p))

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #f3faf4; overflow-x: hidden; }
        .app-wrapper { width: 100%; min-height: 100vh; }
        .mobile-bottom-padding { padding-bottom: 70px; }
        @media (min-width: 768px) {
          .mobile-bottom-padding { padding-bottom: 0; }
          .bottom-nav-wrapper { display: none !important; }
        }
        @media (max-width: 767px) {
          .bottom-nav-wrapper { display: block; }
        }
        .kisan-header { padding-top: 20px !important; }
        @media (max-width: 767px) { .kisan-header { padding-top: 20px !important; } }
        .mandi-tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .mandi-tabs::-webkit-scrollbar { display: none; }
        .mandi-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        @media (max-width: 380px) { .mandi-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <OfflineBanner />

      <div className={`app-wrapper ${!hideNav ? 'mobile-bottom-padding' : ''}`}>
        <AppRoutes />
      </div>

      {!hideNav && (
        <div className="bottom-nav-wrapper">
          <BottomNav />
        </div>
      )}

      <InstallPWA />
    </>
  )
}
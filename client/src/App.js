import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import './i18n'; // Initialize i18n

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RoleSelection from './pages/auth/RoleSelection';
import LanguageSelection from './pages/auth/LanguageSelection';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';

import CropManagement from './pages/farmer/CropManagement';
import DiseaseDetection from './pages/DiseaseDetection';
import CropRecommendation from './pages/farmer/CropRecommendation';
import WeatherForecast from './pages/farmer/WeatherForecast';
import WasteManagement from './pages/farmer/WasteManagement';
import ChatBot from './pages/farmer/ChatBot';
import Posts from './pages/common/Posts';
import MarketIntelligencePage from './pages/farmer/MarketIntelligencePage';
import RetailerContact from './pages/farmer/RetailerContact';
import GovernmentSchemes from './pages/farmer/GovernmentSchemes';

import Negotiation from './pages/farmer/Negotiation';
import AgricultureProducts from './pages/farmer/AgricultureProducts';
import ConsumerListings from './pages/farmer/ConsumerListings';
import ExchangeRequestForm from './pages/farmer/ExchangeRequestForm';
import MySentRequests from './pages/farmer/MySentRequests';
import MyReceivedRequests from './pages/farmer/MyReceivedRequests';
import MyDisputes from './pages/farmer/MyDisputes';
import FindLabour from './pages/farmer/FindLabour';
import AdminDisputeDashboard from './pages/admin/AdminDisputeDashboard';

// Retailer Pages
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import RetailerProducts from './pages/retailer/RetailerProducts';
import RetailerInventory from './pages/retailer/RetailerInventory';
import RetailerOptions from './pages/retailer/RetailerOptions';
import RetailerProductsList from './pages/retailer/RetailerProductsList';
import RetailerWasteProducts from './pages/retailer/RetailerWasteProducts';
import RetailerChatBot from './pages/retailer/ChatBot';
import RetailerConsumerListings from './pages/retailer/RetailerConsumerListings';


// Consumer Pages
import ConsumerDashboard from './pages/consumer/ConsumerDashboard';
import ProductDetails from './pages/consumer/ProductDetails';
import Cart from './pages/consumer/Cart';
import FarmerContact from './pages/consumer/FarmerContact';
import ConsumerChatBot from './pages/consumer/ChatBot';

import ConsumerShop from './pages/consumer/ConsumerShop';
import Wishlist from './pages/consumer/Wishlist';
import Checkout from './pages/consumer/Checkout';
import OrderConfirmation from './pages/consumer/OrderConfirmation';

// Common Pages
import Profile from './pages/common/Profile';
import Chat from './pages/common/Chat';

import Orders from './pages/common/Orders';
import ReportSection from './pages/common/ReportSection';
import MarketPrices from './pages/common/MarketPrices';
import GovtSchemes from './pages/common/GovtSchemes';
import News from './pages/common/News';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <SocketProvider>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
            error: {
              duration: 4000,
              theme: {
                primary: 'red',
                secondary: 'black',
              },
            },
          }}
        />

        {/* Global Page Layout */}
        <div className="flex flex-col min-h-screen relative overflow-x-hidden">

          {/* ── Page content – z-10 keeps it above all decoratives ── */}
          <div className="flex-grow z-10 pb-32">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                isAuthenticated ? (
                  user?.role === 'farmer' ? <Navigate to="/farmer/dashboard" /> :
                    user?.role === 'retailer' ? <Navigate to="/retailer/options" /> :
                      <Navigate to="/consumer/dashboard" />
                ) : <RoleSelection />
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/language-selection" element={<LanguageSelection />} />

              {/* Farmer Routes */}
              <Route path="/farmer/dashboard" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/farmer/products" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <AgricultureProducts />
                </ProtectedRoute>
              } />
              <Route path="/farmer/crops" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <CropManagement />
                </ProtectedRoute>
              } />
              <Route path="/farmer/disease-detection" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <DiseaseDetection />
                </ProtectedRoute>
              } />
              <Route path="/farmer/crop-recommendation" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <CropRecommendation />
                </ProtectedRoute>
              } />
              <Route path="/farmer/weather" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <WeatherForecast />
                </ProtectedRoute>
              } />
              <Route path="/farmer/waste" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <WasteManagement />
                </ProtectedRoute>
              } />
              <Route path="/farmer/chatbot" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <ChatBot />
                </ProtectedRoute>
              } />
              <Route path="/farmer/community" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <Posts />
                </ProtectedRoute>
              } />
              <Route path="/farmer/market-intelligence" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <MarketIntelligencePage />
                </ProtectedRoute>
              } />
              <Route path="/farmer/retailers" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <RetailerContact />
                </ProtectedRoute>
              } />
              <Route path="/farmer/schemes" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <GovernmentSchemes />
                </ProtectedRoute>
              } />
              <Route path="/farmer/add-products" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <ConsumerListings />
                </ProtectedRoute>
              } />
              <Route path="/farmer/negotiation" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <Negotiation />
                </ProtectedRoute>
              } />
              <Route path="/farmer/exchange/new" element={
                <ProtectedRoute allowedRoles={['farmer', 'retailer']}>
                  <ExchangeRequestForm />
                </ProtectedRoute>
              } />
              <Route path="/farmer/exchanges/sent" element={
                <ProtectedRoute allowedRoles={['farmer', 'retailer']}>
                  <MySentRequests />
                </ProtectedRoute>
              } />
              <Route path="/farmer/exchanges/received" element={
                <ProtectedRoute allowedRoles={['farmer', 'retailer']}>
                  <MyReceivedRequests />
                </ProtectedRoute>
              } />
              <Route path="/farmer/disputes" element={
                <ProtectedRoute allowedRoles={['farmer', 'retailer']}>
                  <MyDisputes />
                </ProtectedRoute>
              } />
              <Route path="/farmer/find-labour" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FindLabour />
                </ProtectedRoute>
              } />
              <Route path="/admin/disputes" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDisputeDashboard />
                </ProtectedRoute>
              } />

              {/* Retailer Routes */}
              <Route path="/retailer/dashboard" element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <RetailerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/retailer/products" element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <RetailerProducts />
                </ProtectedRoute>
              } />
              <Route path="/retailer/inventory" element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <RetailerInventory />
                </ProtectedRoute>
              } />
              <Route path="/retailer/options" element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <RetailerOptions />
                </ProtectedRoute>
              } />
              <Route path="/retailer/products-list" element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <RetailerProductsList />
                </ProtectedRoute>
              } />
              <Route path="/retailer/waste-products" element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <RetailerWasteProducts />
                </ProtectedRoute>
              } />
              <Route path="/retailer/farmers" element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <FarmerContact />
                </ProtectedRoute>
              } />
              <Route path="/retailer/chatbot" element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <RetailerChatBot />
                </ProtectedRoute>
              } />
              <Route path="/retailer/community" element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <Posts />
                </ProtectedRoute>
              } />
              <Route path="/retailer/consumer-listings" element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <RetailerConsumerListings />
                </ProtectedRoute>
              } />

              {/* Consumer Routes */}
              <Route path="/consumer/dashboard" element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <ConsumerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/product/:id" element={
                <ProtectedRoute>
                  <ProductDetails />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/consumer/farmers" element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <FarmerContact />
                </ProtectedRoute>
              } />
              <Route path="/consumer/chatbot" element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <ConsumerChatBot />
                </ProtectedRoute>
              } />
              <Route path="/consumer/community" element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <Posts />
                </ProtectedRoute>
              } />
              <Route path="/consumer/shop" element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <ConsumerShop />
                </ProtectedRoute>
              } />
              <Route path="/consumer/wishlist" element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <Wishlist />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/order-confirmation/:id" element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              } />

              {/* Common Routes */}
              <Route path="/products" element={
                <ProtectedRoute>
                  <ConsumerShop />
                </ProtectedRoute>
              } />
              <Route path="/market" element={
                <ProtectedRoute>
                  <ConsumerShop />
                </ProtectedRoute>
              } />
              <Route path="/posts" element={
                <ProtectedRoute>
                  <Posts />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="/community" element={
                <ProtectedRoute>
                  <Posts />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/report" element={
                <ProtectedRoute>
                  <ReportSection />
                </ProtectedRoute>
              } />
              <Route path="/market-prices" element={
                <ProtectedRoute>
                  <MarketPrices />
                </ProtectedRoute>
              } />
              <Route path="/govt-schemes" element={
                <ProtectedRoute>
                  <GovtSchemes />
                </ProtectedRoute>
              } />
              <Route path="/news" element={
                <ProtectedRoute>
                  <News />
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* ── Sky background (z-0) ── */}
          <div className="farm-sky-bg" />

          {/* ── Clouds (z-1) — 3 layers drifting at different speeds ── */}
          <div className="farm-clouds">
            <div className="farm-cloud farm-cloud-1">
              <svg width="130" height="52" viewBox="0 0 120 48" fill="none">
                <ellipse cx="60" cy="30" rx="48" ry="16" fill="white" opacity="0.45" />
                <ellipse cx="40" cy="24" rx="26" ry="13" fill="white" opacity="0.42" />
                <ellipse cx="78" cy="26" rx="22" ry="11" fill="white" opacity="0.42" />
                <ellipse cx="55" cy="20" rx="20" ry="11" fill="white" opacity="0.5" />
              </svg>
            </div>
            <div className="farm-cloud farm-cloud-2">
              <svg width="95" height="38" viewBox="0 0 120 48" fill="none">
                <ellipse cx="60" cy="30" rx="48" ry="15" fill="white" opacity="0.35" />
                <ellipse cx="42" cy="23" rx="24" ry="11" fill="white" opacity="0.35" />
                <ellipse cx="76" cy="25" rx="19" ry="10" fill="white" opacity="0.38" />
              </svg>
            </div>
            <div className="farm-cloud farm-cloud-3">
              <svg width="75" height="30" viewBox="0 0 120 48" fill="none">
                <ellipse cx="60" cy="28" rx="42" ry="13" fill="white" opacity="0.28" />
                <ellipse cx="44" cy="23" rx="20" ry="9" fill="white" opacity="0.28" />
              </svg>
            </div>
          </div>


        </div>
      </div>
    </SocketProvider>
  );
}

export default App;
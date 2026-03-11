import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import TenantLogin from "./pages/TenantLogin";
import TenantSignup from "./pages/TenantSignup";
import TenantDashboard from "./pages/TenantDashboard";
import TenantProfile from "./pages/TenantProfile";
import TenantOrders from "./pages/TenantOrders";
import ViewProducts from "./pages/ViewProducts";
import AddProduct from "./pages/AddProduct";
import StorePreview from "./pages/StorePreview";
import ViewAnalytics from "./pages/ViewAnalytics";
import PublicStore from "./pages/PublicStore";
import UserSignup from "./pages/UserSignup";
import UserLogin from "./pages/UserLogin";
import UserDashboard from "./pages/UserDashboard";
import AllStores from "./pages/AllStores";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import UserProfile from "./pages/UserProfile";
import Cart from "./pages/Cart";
import { getRole } from "./auth/auth";

function ProtectedRoute({ children, requiredRole }) {
  const role = getRole();
  
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tenant-signup" element={<TenantSignup />} />
        <Route path="/tenant-login" element={<TenantLogin />} />
        <Route path="/tenant" element={<TenantDashboard />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/view-products" element={<ViewProducts />} />
        <Route path="/tenant-profile" element={<TenantProfile />} />
        <Route path="/user-signup" element={<UserSignup />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user" element={<UserDashboard />} />
        
        {/* Keep /home for redirect after login */}
        <Route path="/home" element={<Home />} />

        {/* TENANT protected routes */}
        <Route 
          path="/tenant" 
          element={
            <ProtectedRoute requiredRole="TENANT">
              <TenantDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tenant-profile" 
          element={
            <ProtectedRoute requiredRole="TENANT">
              <TenantProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/view-products" 
          element={
            <ProtectedRoute requiredRole="TENANT">
              <ViewProducts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add-product" 
          element={
            <ProtectedRoute requiredRole="TENANT">
              <AddProduct />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tenant-orders" 
          element={
            <ProtectedRoute requiredRole="TENANT">
              <TenantOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/store-preview" 
          element={
            <ProtectedRoute requiredRole="TENANT">
              <StorePreview />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/view-analytics" 
          element={
            <ProtectedRoute requiredRole="TENANT">
              <ViewAnalytics />
            </ProtectedRoute>
          } 
        />

        {/* USER protected routes */}
        <Route 
          path="/user" 
          element={
            <ProtectedRoute requiredRole="USER">
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/marketplace" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/all-stores" 
          element={
            <ProtectedRoute requiredRole="USER">
              <AllStores />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute requiredRole="USER">
              <Orders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requiredRole="USER">
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute requiredRole="USER">
              <Checkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } 
        />

        {/* Public store */}
        <Route path="/store/:tenantId" element={<PublicStore />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; // to be finished commit
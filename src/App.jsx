import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/customer/LandingPage.jsx";
import ComponentsPage from "./pages/customer/ComponentsPage.jsx";
import DesktopPage from "./pages/customer/DesktopPage.jsx";
import LaptopPage from "./pages/customer/LaptopPage.jsx";
import CartPage from "./pages/customer/CartPage.jsx";
import PCBuilder from "./pages/customer/PCBuilder.jsx";
import AuthPage from "./pages/auth/AuthPage.jsx";
import ProductDetails from "./pages/customer/ProductDetails.jsx";
import CustomerAccountLayout from "./layouts/CustomerAccountLayout";
import ProfilePage from "./pages/customer/ProfilePage";
import EditProfilePage from "./pages/customer/EditProfilePage";
import AccountPlaceholderPage from "./pages/customer/AccountPlaceholderPage";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminProductCatalog from "./pages/admin/AdminProductCatalog";
import AdminPriceManagement from "./pages/admin/AdminPriceManagement";
import AdminInventoryManagement from "./pages/admin/AdminInventoryManagement";
import AdminOrderFulfillment from "./pages/admin/AdminOrderFulfillment";
import AdminReportsAnalytics from "./pages/admin/AdminReportsAnalytics";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/components" element={<ComponentsPage />} />
          <Route path="/desktop" element={<DesktopPage />} />
          <Route path="/laptop" element={<LaptopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/pc-builder" element={<PCBuilder />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/forgot-password" element={<AuthPage />} />
          <Route path="/reset-password" element={<AuthPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Admin */}
          {/* Admin */}
          <Route path="/admin" element={<Dashboard />} />

          <Route path="/admin/products"element={<AdminProductCatalog />} />
      <Route path="/admin/price-management"element={<AdminPriceManagement />}/>
      <Route path="/admin/inventory"element={<AdminInventoryManagement />} />
      <Route path="/admin/orders" element={<AdminOrderFulfillment />} />
      <Route path="/admin/reports"element={<AdminReportsAnalytics />}/>

          {/* Customer Account */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<CustomerAccountLayout />}>
              <Route index element={<Navigate to="profile" replace />} />

              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/edit" element={<EditProfilePage />} />

              <Route
                path="orders"
                element={
                  <AccountPlaceholderPage
                    title="My Orders"
                    description="View your purchases, check order status, and track deliveries."
                  />
                }
              />

              <Route
                path="orders/:orderId"
                element={
                  <AccountPlaceholderPage
                    title="Order Details"
                    description="Order details and tracking information will appear here."
                  />
                }
              />

              <Route
                path="wishlist"
                element={
                  <AccountPlaceholderPage
                    title="My Wishlist"
                    description="Save products you love and find them here when you're ready to shop."
                  />
                }
              />

              <Route
                path="addresses"
                element={
                  <AccountPlaceholderPage
                    title="Saved Addresses"
                    description="Manage your shipping and delivery addresses."
                  />
                }
              />

              <Route
                path="settings"
                element={
                  <AccountPlaceholderPage
                    title="Account Settings"
                    description="Manage your password, security, and preferences."
                  />
                }
              />
            </Route>
          </Route>

          {/* Unknown URLs go to the landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
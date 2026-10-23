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
import AccountSettingsPage from "./pages/customer/AccountSettingsPage";
import EditProfilePage from "./pages/customer/EditProfilePage";
import AddressesPage from "./pages/customer/AddressesPage";
import WishlistPage from "./pages/customer/WishlistPage";
import CheckoutPage from "./pages/customer/CheckoutPage.jsx";
import MyOrdersPage from "./pages/customer/MyOrdersPage.jsx";
import OrderDetailsPage from "./pages/customer/OrderDetailsPage.jsx";
import AccountPlaceholderPage from "./pages/customer/AccountPlaceholderPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
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

            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/account" element={<CustomerAccountLayout />}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/edit" element={<EditProfilePage />} />
                <Route path="orders" element={<MyOrdersPage />} />
                <Route
                  path="orders/:orderId"
                  element={<OrderDetailsPage />}
                />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="addresses" element={<AddressesPage />} />
                <Route path="settings" element={<AccountSettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

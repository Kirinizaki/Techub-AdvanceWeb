import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ComponentsPage from "./pages/ComponentsPage";
import DesktopPage from "./pages/DesktopPage";
import LaptopPage from "./pages/LaptopPage";
import CartPage from "./pages/CartPage";
import PCBuilder from "./pages/PCBuilder";
import AuthPage from "./pages/AuthPage.jsx";

function App() {
  return (
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
      </Routes>
    </BrowserRouter>
  )
}

export default App

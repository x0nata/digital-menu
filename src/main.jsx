import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import LoginPage from './admin/LoginPage.jsx'
import Dashboard from './admin/Dashboard.jsx'
import DishesManager from './admin/DishesManager.jsx'
import CategoriesManager from './admin/CategoriesManager.jsx'
import SettingsManager from './admin/SettingsManager.jsx'
import WaiterScanner from './waiter/WaiterScanner.jsx'
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://placeholder-url.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

function ThemeProvider({ children }) {
  const settings = useQuery(api.settings.getSettings);

  useEffect(() => {
    if (settings?.theme) {
      document.documentElement.style.setProperty('--brand-red', settings.theme.brandRed);
      document.documentElement.style.setProperty('--creamy', settings.theme.creamy);
    }
  }, [settings]);

  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/waiter" element={<WaiterScanner />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="dishes" element={<DishesManager />} />
              <Route path="categories" element={<CategoriesManager />} />
              <Route path="settings" element={<SettingsManager />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ConvexProvider>
  </StrictMode>,
)

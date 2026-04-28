import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./state/auth.jsx";
import { AppLayout } from "./ui/AppLayout.jsx";
import { DashboardPage } from "./views/DashboardPage.jsx";
import { TasksPage } from "./views/TasksPage.jsx";
import { JournalPage } from "./views/JournalPage.jsx";
import { LoginPage } from "./views/LoginPage.jsx";
import { RegisterPage } from "./views/RegisterPage.jsx";
import { ToastProvider } from "./ui/Toast.jsx";

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-6">Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="journal" element={<JournalPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

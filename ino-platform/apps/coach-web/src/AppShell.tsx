/**
 * App Shell
 * Wraps the entire app with AuthProvider.
 * Shows Login when unauthenticated, Command Center when authenticated.
 */
import { AuthProvider, useAuth } from "./lib/auth";
import LoginPage from "./pages/Login";
import INOCoachCommandCenter from "./App";

function AppRouter() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#080A12", fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "linear-gradient(135deg, #818CF8, #6366F1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 11,
          animation: "pulse 1.5s ease-in-out infinite",
        }}>
          INÖ
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return <INOCoachCommandCenter user={user} onLogout={logout} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

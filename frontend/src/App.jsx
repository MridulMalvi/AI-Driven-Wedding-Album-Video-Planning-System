import { Component } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { ClientDashboard, EditorDashboard } from './pages/Dashboard';
import WeddingWizard from './pages/WeddingWizard';
import { GeneratePlanPage, PlanPage, WeddingDetail } from './pages/WeddingPages';
import { AdminDashboard, AdminWeddings } from './pages/AdminPages';
import { useAuth } from './context/AuthContext';

// ---------------------------------------------------------------------------
// Global Error Boundary — catches render errors and shows a recovery screen
// instead of a blank white page.
// ---------------------------------------------------------------------------
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you could send this to Sentry / Datadog etc.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '2rem',
          background: '#0f0a1a', color: '#f8f4ff', fontFamily: 'sans-serif', textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: '#a78bfa', marginBottom: '2rem', maxWidth: 480 }}>
            An unexpected error occurred. Refreshing the page usually fixes this.
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#6d28d9', marginBottom: '2rem' }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none',
              background: '#7c3aed', color: '#fff', cursor: 'pointer', fontSize: '1rem',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// App routing
// ---------------------------------------------------------------------------
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? `/${user.role}/dashboard` : '/login'} replace />;
}

const weddingRoutes = (prefix) => (
  <>
    <Route path={`${prefix}/weddings/:id`} element={<WeddingDetail />} />
    <Route path={`${prefix}/weddings/:id/ai-plan`} element={<GeneratePlanPage />} />
    <Route path={`${prefix}/weddings/:id/video-plan`} element={<PlanPage tab="video-plan" />} />
    <Route path={`${prefix}/weddings/:id/highlight`} element={<PlanPage tab="highlight" />} />
    <Route path={`${prefix}/weddings/:id/album`} element={<PlanPage tab="album" />} />
  </>
);

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Client workspace */}
            <Route element={<ProtectedRoute roles={['client']} />}>
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/client/weddings/new" element={<WeddingWizard />} />
              <Route path="/client/weddings/:id/functions" element={<WeddingDetail />} />
              {weddingRoutes('/client')}
            </Route>

            {/* Admin workspace */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/weddings" element={<AdminWeddings />} />
              {weddingRoutes('/admin')}
            </Route>

            {/* Editor workspace */}
            <Route element={<ProtectedRoute roles={['editor']} />}>
              <Route path="/editor/dashboard" element={<EditorDashboard />} />
              {weddingRoutes('/editor')}
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </ErrorBoundary>
  );
}

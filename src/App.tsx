import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const StudentLogin = lazy(() => import('./pages/student/Login'));
const Instruction = lazy(() => import('./pages/student/Instruction'));
const Exam = lazy(() => import('./pages/student/Exam'));
const Review = lazy(() => import('./pages/student/Review'));
const Result = lazy(() => import('./pages/student/Result'));

const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const QuestionBank = lazy(() => import('./pages/admin/QuestionBank'));
const Students = lazy(() => import('./pages/admin/Students'));
const Tokens = lazy(() => import('./pages/admin/Tokens'));
const AdminResults = lazy(() => import('./pages/admin/Results'));
const AdminImport = lazy(() => import('./pages/admin/Import'));
const Monitor = lazy(() => import('./pages/admin/Monitor'));

const ProtectedStudentRoute = ({ children }: { children: React.ReactNode }) => {
  const { auth } = useAuth();
  if (!auth.student) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { auth } = useAuth();
  if (!auth.isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const Layout = () => (
  <div className="app-container">
    <main className="main-content">
      <Suspense fallback={<div className="text-center mt-8">Loading...</div>}>
        <Outlet />
      </Suspense>
    </main>
  </div>
);

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Navigate to="/login" replace /> },
      { path: "/login", element: <StudentLogin /> },
      { path: "/instructions", element: <ProtectedStudentRoute><Instruction /></ProtectedStudentRoute> },
      { path: "/exam", element: <ProtectedStudentRoute><Exam /></ProtectedStudentRoute> },
      { path: "/review", element: <ProtectedStudentRoute><Review /></ProtectedStudentRoute> },
      { path: "/result", element: <ProtectedStudentRoute><Result /></ProtectedStudentRoute> },
      
      { path: "/admin", element: <Navigate to="/admin/login" replace /> },
      { path: "/admin/login", element: <AdminLogin /> },
      { path: "/admin/dashboard", element: <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute> },
      { path: "/admin/students", element: <ProtectedAdminRoute><Students /></ProtectedAdminRoute> },
      { path: "/admin/questions", element: <ProtectedAdminRoute><QuestionBank /></ProtectedAdminRoute> },
      { path: "/admin/import", element: <ProtectedAdminRoute><AdminImport /></ProtectedAdminRoute> },
      { path: "/admin/tokens", element: <ProtectedAdminRoute><Tokens /></ProtectedAdminRoute> },
      { path: "/admin/monitor", element: <ProtectedAdminRoute><Monitor /></ProtectedAdminRoute> },
      { path: "/admin/results", element: <ProtectedAdminRoute><AdminResults /></ProtectedAdminRoute> },
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

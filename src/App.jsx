import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PageShell from './components/PageShell.jsx';
import ProtectedStaffRoute from './components/ProtectedStaffRoute.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Services = lazy(() => import('./pages/Services.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Team = lazy(() => import('./pages/Team.jsx'));
const UsefulLinks = lazy(() => import('./pages/UsefulLinks.jsx'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail.jsx'));
const News = lazy(() => import('./pages/News.jsx'));
const NewsArticle = lazy(() => import('./pages/NewsArticle.jsx'));
const StaffLogin = lazy(() => import('./pages/staff/StaffLogin.jsx'));
const StaffArticles = lazy(() => import('./pages/staff/StaffArticles.jsx'));
const StaffArticleEditor = lazy(() => import('./pages/staff/StaffArticleEditor.jsx'));

const routes = [
  { path: '/', element: <Home /> },
  { path: '/services', element: <Services /> },
  { path: '/services/:slug', element: <ServiceDetail /> },
  { path: '/team', element: <Team /> },
  { path: '/non-profit', element: <Navigate to="/services" replace /> },
  { path: '/affiliations', element: <Navigate to="/about" replace /> },
  { path: '/about', element: <About /> },
  { path: '/contact', element: <Contact /> },
  { path: '/useful-links', element: <UsefulLinks /> },
  { path: '/news', element: <News /> },
  { path: '/news/:slug', element: <NewsArticle /> },
  { path: '/staff/login', element: <StaffLogin /> },
  { path: '/staff/articles', element: <ProtectedStaffRoute><StaffArticles /></ProtectedStaffRoute> },
  { path: '/staff/articles/new', element: <ProtectedStaffRoute><StaffArticleEditor /></ProtectedStaffRoute> },
  { path: '/staff/articles/:id/edit', element: <ProtectedStaffRoute><StaffArticleEditor /></ProtectedStaffRoute> },
];

function RouteFallback() {
  return <div className="min-h-[40vh]" aria-live="polite" />;
}

function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <PageShell>
      <Suspense fallback={<RouteFallback />}>
        <PageTransition>
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </Suspense>
    </PageShell>
  );
}

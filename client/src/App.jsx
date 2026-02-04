import { Route, Routes, BrowserRouter } from 'react-router-dom';

// Layouts
import IndexLayout from './layouts/IndexLayout';
import AdminLayout from './components/admin/layout/AdminLayout';
import RequireAdminAuth from './components/admin/layout/RequireAdminAuth';

// User Pages
import SignIn from './pages/auth/Signin';

import RegisterWithOTP from './pages/auth/RegisterWithOTP';
import ResetPassword from './pages/auth/resetpassword';
import Dashboard from './pages/user/dashboard/dashboard';
import Portfolio from './pages/user/portfolio/portfolio';
import PublicRelations from './pages/user/public_relations/public_relations';
// import TemplatePort from './pages/user/template/templatePort';    
import PortfolioView from './pages/user/template/portfolioView';
import UniversalAnouncement from './pages/UniversalAnouncement/anouncement';
import Certificate from './pages/user/certificate/certificate';
import UserProfile from './pages/user/user/index'; // Import UserProfile
import ActivityPage from './pages/user/portfolio/ActivityPage';
import SportPage from './pages/user/portfolio/SportPage';
import WorkPage from './pages/user/portfolio/WorkPage';

// Admin Pages
import AdminLogin from './pages/auth/adminLogin';
import AdminDashboard from './pages/admin/dashboard/adminDashboard';
import UserManagement from './pages/admin/users/userManagement';
import NewsManagement from './pages/admin/content/newsManagement';
import Announcements from './pages/admin/content/announcements';
import Analytics from './pages/admin/analytics/analytics';
import AdminSettings from './pages/admin/settings/adminSettings';
import UserFormPage from './pages/admin/users/UserFormPage';
import NewsFormPage from './pages/admin/content/NewsFormPage';
import CategoryManagement from './pages/admin/content/CategoryManagement';
import EmailBroadcastPage from './pages/admin/communications/emailBroadcast';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* USER ROUTES */}
        <Route path="/sign-in" element={<SignIn />} />

        <Route path="/register-otp" element={<RegisterWithOTP />} />
        <Route element={<IndexLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-portfolio" element={<Portfolio />} />
          <Route path="/public-relations" element={<PublicRelations />} />
          <Route path="/certificate" element={<Certificate />} />
          <Route path="/profile" element={<UserProfile />} />

          {/* Portfolio Sub-pages */}
          <Route path="/portfolio/activities" element={<ActivityPage />} />
          <Route path="/portfolio/sports" element={<SportPage />} />
          <Route path="/portfolio/work-experience" element={<WorkPage />} />
          <Route path="/portfolio/certificates" element={<Certificate />} />

          {/* <Route path="/template" element={<TemplatePort />} /> */}

        </Route>


        <Route path="/" element={<UniversalAnouncement />} />
        <Route path="/template/view" element={<PortfolioView />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        {/* </Route> */}

        {/* ADMIN ROUTES */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAdminAuth><AdminLayout /></RequireAdminAuth>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/create" element={<UserFormPage />} />
          <Route path="users/edit/:id" element={<UserFormPage />} />
          <Route path="content/news" element={<NewsManagement />} />
          <Route path="content/news/categories" element={<CategoryManagement />} />
          <Route path="content/news/create" element={<NewsFormPage />} />
          <Route path="content/news/edit/:id" element={<NewsFormPage />} />
          <Route path="content/announcements" element={<Announcements />} />
          <Route path="content/announcements/create" element={<NewsFormPage />} />
          <Route path="content/announcements/edit/:id" element={<NewsFormPage />} />
          <Route path="communications/email" element={<EmailBroadcastPage />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

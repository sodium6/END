import { Route, Routes, BrowserRouter } from 'react-router-dom';

// Layouts
import IndexLayout from './layouts/IndexLayout';
import AdminLayout from './components/admin/layout/AdminLayout';
import RequireAdminAuth from './components/admin/layout/RequireAdminAuth';

// User Pages
import SignIn from './pages/auth/Signin';
import SignUp from './pages/auth/SignUp';
import ResetPassword from './pages/auth/resetpassword';
import Dashboard from './pages/user/dashboard/dashboard';
import Portfolio from './pages/user/portfolio/portfolio';
import PublicRelations from './pages/user/public_relations/public_relations';
// import TemplatePort from './pages/user/template/templatePort';    
import PortfolioView from './pages/user/template/portfolioView';
import UniversalAnouncement from './pages/UniversalAnouncement/anouncement';
import Certificate from './pages/user/certificate/certificate';
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
import EmailBroadcastPage from './pages/admin/communications/emailBroadcast';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* USER ROUTES */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route element={<IndexLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />     
        <Route path="/my-portfolio" element={<Portfolio />} />     
        <Route path="/public-relations" element={<PublicRelations />} />
        <Route path="/certificate" element={<Certificate />} />
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

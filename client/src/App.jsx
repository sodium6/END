import IndexLayout from './layouts/IndexLayout';
import DashBoard from './pages/user';
import IndexCompany from './pages/user/company';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Profile from './pages/user/user';
import IndexHistory from './pages/user/history/Index';
import SignIn from './pages/auth/Signin';
import SignUp from './pages/auth/SignUp';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route element={<PrivateRoute />}> */}
        <Route element={<IndexLayout />}>
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/company" element={<IndexCompany />} />
          <Route path="/import-data" />
          <Route path="/history" element={<IndexHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/help" />
        </Route>

          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
     
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

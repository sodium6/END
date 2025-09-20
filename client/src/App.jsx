import IndexLayout from './layouts/IndexLayout';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

import SignIn from './pages/auth/Signin';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/user/dashboard/dashboard';
import Portfolio from './pages/user/portfolio/portfolio';
import PublicRelations from './pages/user/public_relations/public_relations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route element={<PrivateRoute />}> */}
        <Route element={<IndexLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />     
        <Route path="/my-portfolio" element={<Portfolio />} />     
        <Route path="/public-relations" element={<PublicRelations />} />
        </Route>

          <Route path="/" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

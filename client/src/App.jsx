import IndexLayout from './layouts/IndexLayout';

import { Route, Routes, BrowserRouter } from 'react-router-dom';

import SignIn from './pages/auth/Signin';
import SignUp from './pages/auth/SignUp';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route element={<PrivateRoute />}> */}
        <Route element={<IndexLayout />}>

        </Route>

          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
     
        {/* </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

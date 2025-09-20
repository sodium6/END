import { Route, Routes, BrowserRouter } from "react-router-dom";

import IndexLayout from "./layouts/IndexLayout";
import Profile from "./pages/user/user";
import SignIn from "./pages/auth/Signin";
import SignUp from "./pages/auth/SignUp";
import StudentPortfolioDashboard from "./pages/dashboard/dashboard";
import PublicRelations from "./pages/public_relations/public_relations";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<IndexLayout />}>
          <Route path="/dashboard.jsx" element={<StudentPortfolioDashboard />} />
          <Route path="/import-data" element={<div />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/help" element={<div />} />
          <Route path="/public-relations" element={<PublicRelations />} />
        </Route>

        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
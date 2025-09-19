import { Route, Routes, BrowserRouter } from "react-router-dom";

import IndexLayout from "./layouts/IndexLayout";
import Profile from "./pages/user/user";
import SignIn from "./pages/auth/Signin";
import SignUp from "./pages/auth/SignUp";
import StudentPortfolioDashboard from "./pages/dashboard/dashboard"; // <-- ต้องมี default export ชื่อนี้

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<IndexLayout />}>
          <Route path="/dashboard" element={<StudentPortfolioDashboard />} />
          <Route path="/import-data" element={<div />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/help" element={<div />} />
        </Route>

        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

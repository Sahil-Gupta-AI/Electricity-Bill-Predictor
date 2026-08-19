import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import PredictBillPage from "./pages/PredictBillPage";
import ProtectedRoute from "./pages/ProtectedRoute";
import BillHistory from "./pages/BillHistory";
import ConsumptionHistory from "./pages/ConsumptionHistory";
import Tips from "./pages/Tips";
import Profile from "./pages/Profile";
import UploadBill from "./pages/UploadBill";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/predictbill" element={<ProtectedRoute><PredictBillPage /></ProtectedRoute>} />
        <Route path="/billhistory" element={<ProtectedRoute><BillHistory /></ProtectedRoute>} />
        <Route path="/consumptionhistory" element={<ProtectedRoute><ConsumptionHistory /></ProtectedRoute>} />
        <Route path="/tips" element={<ProtectedRoute><Tips /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/uploadbill" element={<ProtectedRoute><UploadBill /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

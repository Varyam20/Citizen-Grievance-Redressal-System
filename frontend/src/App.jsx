import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewComplaint from "./pages/NewComplaint";
import MyComplaints from "./pages/MyComplaints";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import Navbar from "./components/Navbar";
import AllComplaints from "./pages/AllComplaints";
import FullComplaintView from "./pages/FullComplaintView";

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-0 min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/new" element={<NewComplaint />} />
          <Route path="/my" element={<MyComplaints />} />
          <Route path="/all" element={<AllComplaints />} />
          <Route path="/authority" element={<AuthorityDashboard />} />
          <Route path="/complaint/:id" element={<FullComplaintView />} />
        </Routes>
      </div>
    </Router>
  );
}

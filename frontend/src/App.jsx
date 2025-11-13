import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewComplaint from "./pages/NewComplaint";
import MyComplaints from "./pages/MyComplaints";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import Navbar from "./components/Navbar";
import AllComplaints from "./pages/AllComplaints";

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/new" element={<NewComplaint />} />
          <Route path="/my" element={<MyComplaints />} />
          <Route path="/all" element={<AllComplaints />} />
          <Route path="/authority" element={<AuthorityDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

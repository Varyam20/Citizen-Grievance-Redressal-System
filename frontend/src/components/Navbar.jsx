import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [name, setName] = useState(localStorage.getItem("name"));

  // Listen for role/name changes dynamically
  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem("role"));
      setName(localStorage.getItem("name"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        <h1
          onClick={() => navigate("/")}
          className="text-xl font-bold text-blue-600 cursor-pointer"
        >
          CGRS
        </h1>

        <div className="flex items-center gap-5 text-gray-700 text-sm font-medium">
          {/* Citizen Links */}
          {role === "citizen" && (
            <>
              <Link to="/new" className="hover:text-blue-600">
                New Complaint
              </Link>
              <Link to="/my" className="hover:text-blue-600">
                My Complaints
              </Link>
            </>
          )}

          {/* Authority Links */}
          {role === "authority" && (
            <Link to="/authority" className="hover:text-blue-600">
              Dashboard
            </Link>
          )}

          {/* Greeting */}
          {name && (
            <span className="text-gray-500 hidden sm:inline">
              Hi, {name.split(" ")[0]}
            </span>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/login", form);

      // Save auth data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("department", res.data.department || "");
      localStorage.setItem("name", res.data.name);

      // Redirect based on role
      if (res.data.role === "authority") {
        window.location.href = "/authority";
      } else {
        window.location.href = "/my";
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-semibold mb-6 text-center text-blue-600">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border rounded w-full p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          New user?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Authority demo logins:</p>
          <p>roads@cgrs.in / roads123</p>
          <p>water@cgrs.in / water123</p>
          <p>electricity@cgrs.in / electric123</p>
          <p>sanitation@cgrs.in / clean123</p>
        </div>
      </div>
    </div>
  );
}

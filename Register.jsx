import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'mail.com', 'protonmail.com'];
    const domain = email.split('@')[1];
    return validDomains.includes(domain?.toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(form.email)) {
      setError('Please use a valid email domain (gmail.com, yahoo.com, outlook.com, hotmail.com, aol.com, mail.com, or protonmail.com)');
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      setRegistered(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-xl mb-4">Register</h1>
      {error && <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="px-3 py-2 border rounded" placeholder="Name" onChange={(e)=>setForm({...form, name:e.target.value})}/>
        <input className="px-3 py-2 border rounded" placeholder="Email" onChange={(e)=>setForm({...form, email:e.target.value})}/>
        <input type="password" className="px-3 py-2 border rounded" placeholder="Password" onChange={(e)=>setForm({...form, password:e.target.value})}/>
        <button
          className={`py-2 rounded ${registered ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}
          disabled={registered}
        >
          {registered ? 'Registered!' : 'Register'}
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/auth/register", form);
    setRegistered(true);
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-xl mb-4">Register</h1>
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

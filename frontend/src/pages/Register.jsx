import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/auth/register", form);
    alert("Registered! Now login.");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-xl mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input placeholder="Name" onChange={(e)=>setForm({...form, name:e.target.value})}/>
        <input placeholder="Email" onChange={(e)=>setForm({...form, email:e.target.value})}/>
        <input type="password" placeholder="Password" onChange={(e)=>setForm({...form, password:e.target.value})}/>
        <button className="bg-blue-600 text-white py-1">Register</button>
      </form>
    </div>
  );
}

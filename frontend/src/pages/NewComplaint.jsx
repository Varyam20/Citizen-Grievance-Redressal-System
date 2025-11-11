import AutocompleteInput from "../components/Autocomplete";
import { useState } from "react";
import axios from "axios";
import { DEPARTMENTS, CHANDIGARH_LOCATIONS } from "../utils/constants";
import { useNavigate } from "react-router-dom";

export default function NewComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", locationText: "", department: "" });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return alert("Please login first");
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("locationText", form.locationText);
      fd.append("department", form.department);
      for (let i = 0; i < photos.length; i++) fd.append("photos", photos[i]);

      const res = await axios.post("http://localhost:5000/api/complaints", fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Complaint submitted");
      navigate("/my");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow p-6 rounded mt-8">
      <h2 className="text-xl font-semibold mb-4">File New Complaint (Chandigarh)</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
        <textarea className="w-full" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required />
        <AutocompleteInput
          value={form.locationText}
          onChange={(val) => setForm({ ...form, locationText: val })}
          placeholder="Type sector / address in Chandigarh..."
        />
        <select className="w-full" value={form.department} onChange={e=>setForm({...form,department:e.target.value})} required>
          <option value="">Select Department</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input type="file" multiple accept="image/*" onChange={(e)=>setPhotos(e.target.files)} />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button type="button" className="px-4 py-2 border rounded" onClick={()=>{ setForm({title:"",description:"",locationText:"",department:""}); setPhotos([]); }}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

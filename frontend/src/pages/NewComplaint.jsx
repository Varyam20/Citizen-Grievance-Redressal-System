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
  const [submitState, setSubmitState] = useState(null); // 'submitting', 'submitted', null

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSubmitState('submitting');
      const token = localStorage.getItem("token");
      if (!token) return alert("Please login first");
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("locationText", form.locationText);
      fd.append("department", form.department);
      for (let i = 0; i < photos.length; i++) fd.append("photos", photos[i]);

      await axios.post("http://localhost:5000/api/complaints", fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Show "Submitted" state
      setSubmitState('submitted');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setLoading(false);
        setSubmitState(null);
        setForm({ title: "", description: "", locationText: "", department: "" });
        setPhotos([]);
        navigate("/my");
      }, 2500);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Submit failed");
      setLoading(false);
      setSubmitState(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow p-6 rounded mt-8">
      <h2 className="text-xl font-semibold mb-4">File New Complaint</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Title"
            value={form.title}
            onChange={e=>setForm({...form,title:e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Description"
            value={form.description}
            onChange={e=>setForm({...form,description:e.target.value})}
            required
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <AutocompleteInput
            value={form.locationText}
            onChange={(val) => setForm({ ...form, locationText: val })}
            placeholder="Type sector / address..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={form.department}
            onChange={e=>setForm({...form,department:e.target.value})}
            required
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Photos (optional)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e)=>setPhotos(e.target.files)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button 
            type="submit" 
            className={`text-white px-5 py-2 rounded-lg font-semibold shadow transition ${
              submitState === 'submitted' ? 'bg-green-600 hover:bg-green-700' :
              submitState === 'submitting' ? 'bg-green-500 hover:bg-green-600' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading}
          >
            {submitState === 'submitted' ? 'Submitted' :
             submitState === 'submitting' ? 'Submitting...' :
             loading ? 'Submitting...' : 'Submit'}
          </button>
          <button 
            type="button" 
            className="px-5 py-2 border border-gray-300 rounded-lg font-semibold bg-gray-50 hover:bg-gray-100 transition" 
            onClick={()=>{ setForm({title:"",description:"",locationText:"",department:""}); setPhotos([]); }}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

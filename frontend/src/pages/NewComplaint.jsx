import AutocompleteInput from "../components/Autocomplete";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { DEPARTMENTS} from "../utils/constants";
import { useNavigate } from "react-router-dom";
import DuplicateModal from "../components/DuplicateModal";
export default function NewComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", locationText: "", department: "" });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitState, setSubmitState] = useState(null); // 'submitting', 'submitted', null
  const descRef = useRef(null);
  const [duplicateData, setDuplicateData] = useState(null);
  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, [form.description]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return alert("Please login first");

      // 🔁 First check duplicates
      const checkRes = await axios.post(
        "https://cgrs-backend.onrender.com/api/complaints/check-duplicate",
        {
          title: form.title,
          locationText: form.locationText,
          department: form.department
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (checkRes.data.duplicate) {
        setDuplicateData(checkRes.data.similarComplaints);
        setLoading(false);
        return;
      }

      await submitComplaint(token);

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Submit failed");
      setLoading(false);
    }
  };

  const submitComplaint = async (token) => {
    setSubmitState('submitting');

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("locationText", form.locationText);
    fd.append("department", form.department);
    for (let i = 0; i < photos.length; i++) fd.append("photos", photos[i]);

    await axios.post(
      "https://cgrs-backend.onrender.com/api/complaints",
      fd,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSubmitState('submitted');

    setTimeout(() => {
      setLoading(false);
      setSubmitState(null);
      setForm({ title: "", description: "", locationText: "", department: "" });
      setPhotos([]);
      navigate("/my");
    }, 2500);
  };

  const handleUpvote = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://cgrs-backend.onrender.com/api/complaints/${id}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Upvoted successfully!");
      setDuplicateData(null);
      navigate("/all");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to upvote");
    }
  };

  const handleSubmitAnyway = async () => {
    const token = localStorage.getItem("token");
    setDuplicateData(null);
    await submitComplaint(token);
  };

  const handleCloseModal = () => {
    setDuplicateData(null);
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
            ref={descRef}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition overflow-hidden resize-none"
            placeholder="Description"
            value={form.description}
            onChange={e => {
              setForm({ ...form, description: e.target.value });
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            required
            rows={1}
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
      {duplicateData && (
        <DuplicateModal
          complaints={duplicateData}
          onUpvote={handleUpvote}
          onSubmitAnyway={handleSubmitAnyway}
          onClose={handleCloseModal}
          currentUserId={localStorage.getItem("id")}
        />
      )}
    </div>
  );
}

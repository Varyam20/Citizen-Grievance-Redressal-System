import { useEffect, useState } from "react";
import axios from "axios";

export default function AuthorityDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [update, setUpdate] = useState({ status: "", comment: "" });
  const [savingState, setSavingState] = useState(null); // Track which complaint is being saved
  const token = localStorage.getItem("token");
  const myDept = localStorage.getItem("department");

  useEffect(() => {
    if (!token || !myDept) return; // Ensure myDept is valid
    const fetch = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/complaints", {
          headers: { Authorization: `Bearer ${token}` },
          params: { sort: "top" },
        });
        const filtered = res.data.filter(
          (c) => (c.department === myDept || c.department === "General") && c.status !== "Resolved"
        );
        setComplaints(filtered);
      } catch (err) {
        console.error("Failed to fetch complaints", err);
      }
    };
    fetch();
  }, [token, myDept]);

  const handleUpdate = async (id) => {
    try {
      setSavingState({ id, state: 'saving' });
      await axios.put(`http://localhost:5000/api/complaints/${id}/status`, update, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Show "Saved" state
      setSavingState({ id, state: 'saved' });
      
      // After 2 seconds, refresh and re-render
      setTimeout(async () => {
        const res = await axios.get("http://localhost:5000/api/complaints", {
          headers: { Authorization: `Bearer ${token}` },
          params: { sort: "top" },
        });
        const filtered = res.data.filter(
          (c) => (c.department === myDept || c.department === "General") && c.status !== "Resolved"
        );
        setComplaints(filtered);
        setSelected(null);
        setUpdate({ status: "", comment: "" });
        setSavingState(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to update complaint", err);
      setSavingState(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h1 className="text-2xl font-semibold mb-6">Authority Dashboard</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {complaints.map(c => (
          <div
            key={c._id}
            className="bg-white p-4 rounded shadow flex flex-col justify-between cursor-pointer hover:shadow-lg transition"
            onDoubleClick={() => window.open(`/complaint/${c._id}`, "_blank")}
          >
            <div>
              <div className="font-semibold text-lg">{c.title} <span className="text-sm text-gray-500">({c.department})</span></div>
              <div className="text-sm text-gray-600">{c.description}</div>
              <div className="text-xs text-gray-500">Location: {c.locationText} • Votes: {c.upvotes}</div>
              <div className="mt-2 text-sm">Status: <span className="font-medium">{c.status}</span></div>
              {c.photos && c.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {c.photos.map((p, i) => (
                    <img
                      key={i}
                      src={`http://localhost:5000/${p.replace(/\\/g, "/")}`}
                      alt="Complaint"
                      className="w-24 h-24 object-cover rounded border"
                    />
                  ))}
                </div>
              )}
              {c.authorityComments?.map((ac,i) => <div key={i} className="text-xs text-gray-500">Comment: {ac.comment}</div>)}
            </div>
            <div className="mt-2">
              <button className="text-sm underline text-blue-600" onClick={()=>setSelected(c._id)}>Update</button>
              {selected===c._id && (
                <div className="mt-2 space-y-2">
                  <select className="w-full border p-1" onChange={e=>setUpdate({...update, status:e.target.value})}>
                    <option value="">Set status</option>
                    <option>Submitted</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                  <input className="w-full border p-1" placeholder="Comment" onChange={e=>setUpdate({...update, comment:e.target.value})} />
                  <div className="flex gap-2 mt-2">
                    <button 
                      className={`text-white px-3 py-1 rounded transition ${
                        savingState?.id === c._id && savingState?.state === 'saved' ? 'bg-green-600' :
                        savingState?.id === c._id && savingState?.state === 'saving' ? 'bg-green-500' :
                        'bg-blue-600 hover:bg-blue-700'
                      }`}
                      onClick={()=>handleUpdate(c._id)}
                      disabled={savingState?.id === c._id}
                    >
                      {savingState?.id === c._id && savingState?.state === 'saved' ? 'Saved' :
                       savingState?.id === c._id && savingState?.state === 'saving' ? 'Saving...' :
                       'Save'}
                    </button>
                    <button className="px-3 py-1 border rounded" onClick={()=>setSelected(null)} disabled={savingState?.id === c._id}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {complaints.length===0 && <p className="text-gray-500">No complaints for your department or general complaints.</p>}
    </div>
  );
}

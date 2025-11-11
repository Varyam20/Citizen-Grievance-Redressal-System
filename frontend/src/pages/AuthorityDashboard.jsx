import { useEffect, useState } from "react";
import axios from "axios";
import { DEPARTMENTS } from "../utils/constants";

export default function AuthorityDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [dept, setDept] = useState("");
  const [selected, setSelected] = useState(null);
  const [update, setUpdate] = useState({ status: "", comment: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      const params = {};
      if (dept) params.department = dept;
      // sort top by upvotes
      const res = await axios.get("http://localhost:5000/api/complaints", { headers: { Authorization: `Bearer ${token}` }, params: { ...params, sort: "top" } });
      setComplaints(res.data);
    };
    fetch();
  }, [token, dept]);

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}/status`, update, { headers: { Authorization: `Bearer ${token}` }});
      alert("Updated");
      // refresh
      const res = await axios.get("http://localhost:5000/api/complaints", { headers: { Authorization: `Bearer ${token}` }, params: { department: dept, sort: "top" } });
      setComplaints(res.data);
      setSelected(null);
      setUpdate({ status: "", comment: "" });
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Authority Dashboard</h1>
        <div>
          <select className="border p-1" value={dept} onChange={e=>setDept(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d=> <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {complaints.map(c => (
          <div key={c._id} className="bg-white p-4 rounded shadow flex justify-between">
            <div>
              <div className="font-semibold text-lg">{c.title} <span className="text-sm text-gray-500">({c.department})</span></div>
              <div className="text-sm text-gray-600">{c.description}</div>
              <div className="text-xs text-gray-500">Location: {c.locationText} • Votes: {c.upvotes}</div>
              <div className="mt-2 text-sm">Status: <span className="font-medium">{c.status}</span></div>
              {c.authorityComments?.map((ac,i) => <div key={i} className="text-xs text-gray-500">Comment: {ac.comment}</div>)}
            </div>

            <div className="w-64">
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
                    <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={()=>handleUpdate(c._id)}>Save</button>
                    <button className="px-3 py-1 border rounded" onClick={()=>setSelected(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {complaints.length===0 && <p className="text-gray-500">No complaints for the selected filter.</p>}
    </div>
  );
}

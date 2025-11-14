import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function FullComplaintView() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !id) return;
    const fetch = async () => {
      try {
        // Fetch complaints based on user role
        const role = localStorage.getItem("role");
        let res;
        if (role === "authority") {
          res = await axios.get(`http://localhost:5000/api/complaints`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { sort: "top" }
          });
        } else {
          // For citizens, try to fetch from all complaints first, then from their own
          try {
            res = await axios.get(`http://localhost:5000/api/complaints/all`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch {
            res = await axios.get(`http://localhost:5000/api/complaints/my`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }
        const found = res.data.find((c) => c._id === id);
        setComplaint(found);
      } catch (err) {
        console.error(err);
        setComplaint(null);
      }
    };
    fetch();
  }, [token, id]);

  if (!complaint)
    return <div className="max-w-2xl mx-auto mt-12 text-center text-gray-500">Complaint not found or you do not have access.</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white p-8 rounded-xl shadow h-[76vh]">
      <h2 className="text-2xl font-bold text-blue-700 mb-2">{complaint.title}</h2>
      <div className="mb-2 text-gray-700">{complaint.description}</div>
      <div className="text-sm text-gray-500 mb-2">Department: {complaint.department} • Location: {complaint.locationText}</div>
      <div className="text-sm text-gray-500 mb-2">Upvotes: {complaint.upvotes}</div>
      <div className="text-sm mb-2">Status: <span className="font-semibold">{complaint.status}</span></div>
      {complaint.photos && complaint.photos.length > 0 && (
        <div className="flex flex-wrap gap-6 mb-6 justify-center">
          {complaint.photos.map((p, i) => (
            <img
              key={i}
              src={`http://localhost:5000/${p.replace(/\\/g, "/")}`}
              alt="Complaint"
              className="max-w-full h-auto object-contain rounded-xl border-20 border-gray-300 shadow"
              style={{ maxHeight: "18rem" }}
            />
          ))}
        </div>
      )}
      {complaint.authorityComments && complaint.authorityComments.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Department Comments</h3>
          {complaint.authorityComments.map((ac, i) => (
            <div key={i} className="text-sm text-gray-600 mb-1">
              • {ac.comment} <span className="text-xs text-gray-400">({new Date(ac.createdAt).toLocaleString()})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

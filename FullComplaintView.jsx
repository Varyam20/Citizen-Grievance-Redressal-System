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
    <div className="max-w-6xl mx-auto mt-8 mb-8 bg-white p-8 rounded-xl shadow">
      <div className="max-h-[80vh] overflow-y-auto pr-2">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">{complaint.title}</h2>
        <div className="mb-4 text-gray-700 leading-relaxed">{complaint.description}</div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
          <div><span className="font-semibold">Department:</span> {complaint.department}</div>
          <div><span className="font-semibold">Location:</span> {complaint.locationText}</div>
          <div><span className="font-semibold">Upvotes:</span> {complaint.upvotes}</div>
          <div><span className="font-semibold">Status:</span> <span className="text-blue-600 font-semibold">{complaint.status}</span></div>
        </div>
        {complaint.photos && complaint.photos.length > 0 && (
          <div className="flex flex-wrap gap-6 mb-6 justify-center">
            {complaint.photos.map((p, i) => (
              <img
                key={i}
                src={`http://localhost:5000/${p.replace(/\\/g, "/")}`}
                alt="Complaint"
                className="max-w-full h-auto object-contain rounded-xl border border-gray-300 shadow"
                style={{ maxHeight: "18rem" }}
              />
            ))}
          </div>
        )}
        {complaint.authorityComments && complaint.authorityComments.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-300">Department Comments</h3>
            <div className="space-y-3 max-h-[30vh] overflow-y-auto">
              {complaint.authorityComments.map((ac, i) => (
                <div key={i} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="text-sm text-gray-700 break-words">{ac.comment}</div>
                  <span className="text-xs text-gray-500 mt-1 block">{new Date(ac.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

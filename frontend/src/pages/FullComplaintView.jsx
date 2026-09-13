import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function FullComplaintView() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchComplaint = async () => {
    try {
      // Directly fetch the single complaint by ID (much more efficient!)
      const res = await axios.get(
        `https://cgrs-backend.onrender.com/api/complaints/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaint(res.data);
    } catch (err) {
      console.error("Error fetching complaint:", err);
      setComplaint(null);
    }
  };

  useEffect(() => {
    if (!token || !id) return;
    fetchComplaint();
  }, [token, id]);

  const handleReopen = async () => {
    try {
      await axios.put(
        `https://cgrs-backend.onrender.com/complaints/${id}/reopen`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      await fetchComplaint(); // refresh
      alert("Complaint reopened successfully");

    } catch (err) {
      alert(err.response?.data?.message || "Error reopening complaint");
    }
  };

  if (!complaint)
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center text-gray-500">
        Complaint not found or you do not have access.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto mt-8 mb-8 bg-white p-8 rounded-xl shadow">
      <div className="max-h-[80vh] overflow-y-auto pr-2">

        <h2 className="text-2xl font-bold text-blue-700 mb-4">
          {complaint.title}
        </h2>

        <div className="mb-4 text-gray-700 leading-relaxed">
          {complaint.description}
        </div>

        {/* Complaint Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
          <div><span className="font-semibold">Department:</span> {complaint.department}</div>
          <div><span className="font-semibold">Location:</span> {complaint.locationText}</div>
          <div><span className="font-semibold">Upvotes:</span> {complaint.upvotes}</div>
          <div>
            <span className="font-semibold">Status:</span>{" "}
            <span className="text-blue-600 font-semibold">{complaint.status}</span>
          </div>
        </div>

        {/* 🕒 Timeline Section */}
        <div className="text-sm text-gray-500 mb-6 space-y-1">
          <div>Submitted on: {new Date(complaint.createdAt).toLocaleString()}</div>
          <div>Last Updated: {new Date(complaint.updatedAt).toLocaleString()}</div>
          {complaint.resolvedAt && (
            <div className="text-green-600 font-medium">
              Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Reopen Button (Citizen Only) */}
        {role === "citizen" && complaint.status === "Resolved" && (
          <button
            onClick={handleReopen}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg mb-6"
          >
            Reopen Complaint
          </button>
        )}

        {/* Photos */}
        {complaint.photos && complaint.photos.length > 0 && (
          <div className="flex flex-wrap gap-6 mb-6 justify-center">
            {complaint.photos.map((p, i) => (
              <img
                key={i}
                src={`https://cgrs-backend.onrender.com/${p.replace(/\\/g, "/")}`}
                alt="Complaint"
                className="max-w-full h-auto object-contain rounded-xl border border-gray-300 shadow"
                style={{ maxHeight: "18rem" }}
              />
            ))}
          </div>
        )}

        {/* Authority Comments */}
        {complaint.authorityComments &&
          complaint.authorityComments.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-300">
                Department Comments
              </h3>

              <div className="space-y-3 max-h-[30vh] overflow-y-auto">
                {complaint.authorityComments.map((ac, i) => (
                  <div
                    key={i}
                    className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                  >
                    <div className="text-sm text-gray-700 break-words">
                      {ac.comment}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {new Date(ac.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

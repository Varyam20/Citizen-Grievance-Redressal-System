import { useEffect, useState } from "react";
import axios from "axios";

export default function MyComplaints() {
  const [mine, setMine] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      try {
        const r1 = await axios.get("http://localhost:5000/api/complaints/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMine(r1.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [token]);

  // No upvote or all complaints logic needed here

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-8">
      {/* My Complaints Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          My Complaints
        </h2>

        {mine.length === 0 ? (
          <p className="text-sm text-gray-500">
            You have not filed any complaint yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {mine.map((c) => (
              <div
                key={c._id}
                className="border rounded-lg p-3 bg-gray-50 hover:shadow-md transition"
              >
                <div className="font-semibold text-blue-700 mb-1">
                  {c.title}
                </div>
                <div className="text-sm text-gray-600">{c.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Dept: {c.department} • Location: {c.locationText}
                </div>
                <div className="text-xs mt-1">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      c.status === "Resolved"
                        ? "text-green-600"
                        : c.status === "In Progress"
                        ? "text-yellow-600"
                        : "text-gray-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Images */}
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

                {/* Department Comments */}
                {c.authorityComments && c.authorityComments.length > 0 && (
                  <div className="mt-3 border-t pt-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Department Comments:
                    </p>
                    {c.authorityComments.map((ac, i) => (
                      <div key={i} className="text-sm text-gray-600">
                        • {ac.comment}{" "}
                        <span className="text-xs text-gray-400">
                          ({new Date(ac.createdAt).toLocaleString()})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ...existing code... */}
    </div>
  );
}

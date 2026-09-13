import { useEffect, useState } from "react";
import axios from "axios";

export default function AllComplaints() {
  const [all, setAll] = useState([]);
  const [deptFilter, setDeptFilter] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  const fetchComplaints = async () => {
    try {
      const r2 = await axios.get(
        "https://cgrs-backend.onrender.com/api/complaints/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAll(r2.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchComplaints();
  }, [token]);

  const upvote = async (id) => {
    try {
      await axios.post(
        `https://cgrs-backend.onrender.com/api/complaints/${id}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchComplaints(); // refresh after upvote

    } catch (err) {
      alert(err?.response?.data?.message || "Upvote failed");
    }
  };

  const visibleAll = deptFilter
    ? all.filter((c) => c.department === deptFilter)
    : all;

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            All Complaints (Browse & Upvote)
          </h2>

          <select
            className="border rounded p-1 text-sm"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            <option>Roads</option>
            <option>Water</option>
            <option>Electricity</option>
            <option>Sanitation</option>
            <option>General</option>
          </select>
        </div>

        {visibleAll.length === 0 ? (
          <p className="text-sm text-gray-500">No complaints found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">

            {visibleAll.map((c) => {

              const alreadyUpvoted =
                c.upvoters && c.upvoters.includes(userId);

              const isAuthor = c.authorId === userId;

              const isResolved = c.status === "Resolved";

              const canUpvote =
                !alreadyUpvoted && !isAuthor && !isResolved;

              return (
                <div
                  key={c._id}
                  className="border rounded-lg p-3 bg-gray-50 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div
                    className="cursor-pointer"
                    onDoubleClick={() =>
                      window.open(`/complaint/${c._id}`, "_blank")
                    }
                  >
                    <div className="font-semibold text-blue-700">
                      {c.title}{" "}
                      <span className="text-xs text-gray-500">
                        ({c.department})
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      {c.description}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      Location: {c.locationText} • Votes: {c.upvotes}
                    </div>

                    {/* Images */}
                    {c.photos && c.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {c.photos.map((p, i) => (
                          <img
                            key={i}
                            src={`https://cgrs-backend.onrender.com/${p.replace(/\\/g, "/")}`}
                            alt="Complaint"
                            className="w-24 h-24 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}

                    {/* Status */}
                    <div className="text-xs mt-1">
                      Status:{" "}
                      <span
                        className={`font-medium ${
                          c.status === "Resolved"
                            ? "text-green-600"
                            : c.status === "In Progress"
                            ? "text-yellow-600"
                            : c.status === "On Hold"
                            ? "text-orange-600"
                            : c.status === "Rejected"
                            ? "text-red-600"
                            : c.status === "Reopened"
                            ? "text-purple-600"
                            : "text-gray-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>

                  {/* Upvote Button */}
                  {!isResolved && (
                    <button
                      className={`mt-3 px-3 py-1 rounded text-sm transition ${
                        canUpvote
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-400 text-white cursor-not-allowed"
                      }`}
                      onClick={() => canUpvote && upvote(c._id)}
                      disabled={!canUpvote}
                    >
                      {isResolved
                        ? "Resolved"
                        : isAuthor
                        ? "Your Complaint"
                        : alreadyUpvoted
                        ? "Upvoted"
                        : "Upvote"}
                    </button>
                  )}

                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}

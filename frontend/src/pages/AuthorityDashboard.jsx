import { useEffect, useState } from "react";
import axios from "axios";

export default function AuthorityDashboard() {

  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [update, setUpdate] = useState({ status: "", comment: "" });
  const [savingState, setSavingState] = useState(null);

  // 🔥 NEW STATES
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [sortOption, setSortOption] = useState("date");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("token");

  // 🔥 FETCH FUNCTION (NOW DYNAMIC)
  const fetchComplaints = async () => {
    if (!token) return;
    try {
      const params = { page, limit: 6 };
      if (statusFilter) params.status = statusFilter;
      if (areaFilter) params.area = areaFilter;
      if (sortOption) params.sort = sortOption;

      const res = await axios.get(
        "https://cgrs-backend.onrender.com/api/complaints",
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      let fetched = res.data.complaints || [];

      // fallback client-side filtering/sorting in case backend params were ignored
      if (areaFilter) {
        const af = areaFilter.toLowerCase();
        fetched = fetched.filter((c) =>
          c.locationText?.toLowerCase().includes(af)
        );
      }

      if (sortOption === "upvotes") {
        fetched.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      } else {
        // date
        fetched.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      setComplaints(fetched);
      setTotalPages(res.data.totalPages || 1);

    } catch (err) {
      console.error("Failed to fetch complaints", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [token, statusFilter, areaFilter, sortOption, page]);

  const handleUpdate = async (id) => {
    try {
      setSavingState({ id, state: "saving" });

      await axios.put(
        `https://cgrs-backend.onrender.com/api/complaints/${id}/status`,
        update,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSavingState({ id, state: "saved" });

      setTimeout(() => {
        fetchComplaints();
        setSelected(null);
        setUpdate({ status: "", comment: "" });
        setSavingState(null);
      }, 1500);

    } catch (err) {
      console.error("Failed to update complaint", err);
      setSavingState(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8">

      <h1 className="text-2xl font-semibold mb-6">
        Authority Dashboard
      </h1>

      {/* 🔥 FILTER SECTION */}
      <div className="flex gap-4 mb-6 flex-wrap">

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="border rounded p-1 text-sm"
        >
          <option value="">All Status</option>
          <option value="Submitted">Submitted</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Reopened">Reopened</option>
        </select>

        <input
          type="text"
          placeholder="Filter by Area"
          value={areaFilter}
          onChange={(e) => {
            setPage(1);
            setAreaFilter(e.target.value);
          }}
          className="border rounded p-1 text-sm"
        />

        <select
          value={sortOption}
          onChange={(e) => {
            setPage(1);
            setSortOption(e.target.value);
          }}
          className="border rounded p-1 text-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="upvotes">Sort by Upvotes</option>
        </select>

      </div>

      {/* 🔥 COMPLAINT GRID */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">

        {(complaints
          .filter((c) => {
            // If a specific status is chosen, only show complaints with that status
            if (statusFilter) return c.status === statusFilter;
            // by default, hide Resolved and Rejected from active view
            return c.status !== "Resolved" && c.status !== "Rejected";
          })
        ).map((c) => (

          <div
            key={c._id}
            className="bg-white p-4 rounded shadow flex flex-col justify-between hover:shadow-lg transition"
            onDoubleClick={() =>
              window.open(`/complaint/${c._id}`, "_blank")
            }
          >

            <div>
              <div className="font-semibold text-lg">
                {c.title}
                <span className="text-sm text-gray-500">
                  {" "}({c.department})
                </span>
              </div>

              <div className="text-sm text-gray-600">
                {c.description}
              </div>

              <div className="text-xs text-gray-500">
                Location: {c.locationText} • Votes: {c.upvotes}
              </div>

              <div className="mt-2 text-sm">
                Status:{" "}
                <span className={`font-medium ${
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
                }`}>{c.status}</span>
              </div>

              {c.photos?.length > 0 && (
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

              {c.authorityComments?.map((ac, i) => (
                <div key={i} className="text-xs text-gray-500">
                  Comment: {ac.comment}
                </div>
              ))}
            </div>

            {/* 🔥 UPDATE SECTION */}
            <div className="mt-2">

              <button
                className="text-sm underline text-blue-600"
                onClick={() => setSelected(c._id)}
              >
                Update
              </button>

              {selected === c._id && (
                <div className="mt-2 space-y-2">

                  <select
                    className="w-full border p-1"
                    onChange={(e) =>
                      setUpdate({ ...update, status: e.target.value })
                    }
                  >
                    <option value="">Set status</option>
                    {[
                      "In Progress",
                      "On Hold",
                      "Resolved",
                      "Rejected",
                    ]
                      .filter((s) => s !== c.status)
                      .map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                  </select>

                  <input
                    className="w-full border p-1"
                    placeholder="Comment"
                    onChange={(e) =>
                      setUpdate({ ...update, comment: e.target.value })
                    }
                  />

                  <div className="flex gap-2 mt-2">

                    <button
                      className={`text-white px-3 py-1 rounded transition ${
                        savingState?.id === c._id &&
                        savingState?.state === "saved"
                          ? "bg-green-600"
                          : savingState?.id === c._id &&
                            savingState?.state === "saving"
                          ? "bg-green-500"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      onClick={() => handleUpdate(c._id)}
                      disabled={savingState?.id === c._id}
                    >
                      {savingState?.id === c._id &&
                      savingState?.state === "saved"
                        ? "Saved"
                        : savingState?.id === c._id &&
                          savingState?.state === "saving"
                        ? "Saving..."
                        : "Save"}
                    </button>

                    <button
                      className="px-3 py-1 border rounded"
                      onClick={() => setSelected(null)}
                      disabled={savingState?.id === c._id}
                    >
                      Cancel
                    </button>

                  </div>
                </div>
              )}

            </div>

          </div>
        ))}

      </div>

      {/* 🔥 PAGINATION */}
      <div className="flex gap-2 mt-8 justify-center">

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-3 py-1 text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>

      </div>

      {complaints.length === 0 && (
        <p className="text-gray-500 mt-6 text-center">
          No complaints found.
        </p>
      )}

    </div>
  );
}

import React, { useState } from "react";

export default function DuplicateModal({ complaints, onUpvote, onSubmitAnyway, onClose, currentUserId }) {
  const [upvoteError, setUpvoteError] = useState(null);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-red-600">
          ⚠ Similar complaint found
        </h2>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {complaints.map(c => {
            const isAuthor = c.authorId === currentUserId;
            return (
              <div key={c._id} className="border p-3 rounded">
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-gray-500">
                  {c.locationText} • {c.department}
                </p>
                <p className="text-sm font-semibold text-blue-600">
                  👍 {c.upvotes} upvotes
                </p>
                <button
                  onClick={() => {
                    if (isAuthor) {
                      setUpvoteError("You cannot upvote your own complaint");
                      setTimeout(() => setUpvoteError(null), 3000);
                    } else {
                      onUpvote(c._id);
                    }
                  }}
                  disabled={isAuthor}
                  title={isAuthor ? "You cannot upvote your own complaint" : "Upvote this complaint"}
                  className={`mt-2 px-3 py-1 rounded text-sm font-medium transition ${
                    isAuthor
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Upvote Instead
                </button>
              </div>
            );
          })}
        </div>

        {upvoteError && (
          <div className="mt-3 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
            ❌ {upvoteError}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSubmitAnyway}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Submit Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
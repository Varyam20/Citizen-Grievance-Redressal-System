import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    locationText: { type: String, required: true }, // e.g., sector-17
    department: { type: String, required: true },

    photos: [String], // ✅ removed duplicate

    status: {
      type: String,
      enum: [
        "Submitted",
        "In Progress",
        "On Hold",
        "Resolved",
        "Reopened",
        "Rejected"
      ],
      default: "Submitted"
    },

    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    upvotes: { type: Number, default: 0 },
    upvoters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    authorityComments: [
      {
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],

    resolvedAt: { type: Date } // ✅ NEW FIELD
  },
  {
    timestamps: true // ✅ Automatically adds createdAt & updatedAt
  }
);
// Performance Indexes
complaintSchema.index({ department: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ locationText: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ upvotes: -1 });
complaintSchema.index({ 
  department: 1, 
  locationText: 1, 
  status: 1 
});      // Compound index for duplicate detection
export default mongoose.model("Complaint", complaintSchema);
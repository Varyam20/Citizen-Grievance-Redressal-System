import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  locationText: { type: String, required: true }, // e.g., sector-17
  photos: [String],
  department: { type: String, required: true }, // e.g., "Roads"
  status: { type: String, enum: ["Submitted","In Progress","Resolved"], default: "Submitted" },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  upvotes: { type: Number, default: 0 },
  upvoters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  authorityComments: [
    { by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, comment: String, createdAt: { type: Date, default: Date.now }, },
  ],
  photos: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Complaint", complaintSchema);

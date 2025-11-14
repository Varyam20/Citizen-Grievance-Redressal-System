import express from "express";
import multer from "multer";
import Complaint from "../models/Complaint.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Create complaint (citizen)
router.post("/", authMiddleware, upload.array("photos", 3), async (req, res) => {
  try {
    const photoPaths = req.files ? req.files.map(f => f.path) : [];
    const { title, description, locationText, department } = req.body;
    if (!title || !description || !locationText || !department)
      return res.status(400).json({ message: "Missing required fields" });

    const newComplaint = await Complaint.create({
      title, description, locationText, department,
      photos: photoPaths,
      authorId: req.user.id
    });
    res.status(201).json(newComplaint);
  } catch (err) {
    res.status(500).json({ message: "Error creating complaint", error: err.message });
  }
});

// My complaints (citizen)
router.get("/my", authMiddleware, async (req, res) => {
  const complaints = await Complaint.find({ authorId: req.user.id }).sort({ upvotes: -1 });
  res.json(complaints);
});

// All complaints for browsing (authenticated users) - can be filtered by dept
router.get("/all", authMiddleware, async (req, res) => {
  const filter = req.query.department ? { department: req.query.department } : {};
  const complaints = await Complaint.find(filter).sort({ upvotes: -1 });
  res.json(complaints);
});

// Upvote (authenticated user)
router.post("/:id/upvote", authMiddleware, async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: "Not found" });
  if (complaint.upvoters.includes(req.user.id))
    return res.status(400).json({ message: "Already upvoted" });
  complaint.upvotes += 1;
  complaint.upvoters.push(req.user.id);
  await complaint.save();
  res.json(complaint);
});

// Authority: Get all complaints (view + optional department filter); sort by upvotes if query sort=top
router.get("/", authMiddleware, authorizeRoles("authority"), async (req, res) => {
  // Filter by authority's department and 'General' complaints
  const filter = req.query.department 
    ? { department: req.query.department } 
    : { $or: [{ department: req.user.department }, { department: "General" }] };
  const sort = req.query.sort === "top" ? { upvotes: -1 } : { createdAt: -1 }; // default sort by newest
  const complaints = await Complaint.find(filter).sort(sort);
  res.json(complaints);
});

// Authority: Update status + comment
router.put("/:id/status", authMiddleware, authorizeRoles("authority"), async (req, res) => {
  const { status, comment } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: "Not found" });

  if (status) {
    // allow only defined statuses
    if (!["Submitted","In Progress","Resolved"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    complaint.status = status;
  }
  if (comment) {
    complaint.authorityComments.push({ by: req.user.id, comment });
  }
  complaint.updatedAt = Date.now();
  await complaint.save();
  res.json(complaint);
});

export default router;

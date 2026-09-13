import User from "../models/User.js";
import { sendEmail as sendAsyncEmail } from "../utils/emailService.js";
import express from "express";
import path from "path";
import Complaint from "../models/Complaint.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/* =============================
   📧 Email Templates
============================= */

const complaintCreatedTemplate = (title, location, department) => `
<div style="font-family:Arial;padding:20px">
<h2>New Complaint Filed</h2>

<table>
<tr><td><b>Title:</b></td><td>${title}</td></tr>
<tr><td><b>Location:</b></td><td>${location}</td></tr>
<tr><td><b>Department:</b></td><td>${department}</td></tr>
</table>

<p>Please login to the dashboard to review it.</p>
</div>
`;

const statusUpdateTemplate = (title, status) => `
<div style="font-family:Arial;padding:20px">
<h2>Complaint Status Updated</h2>

<p><b>${title}</b></p>
<p>Status: <b>${status}</b></p>
</div>
`;

const commentTemplate = (title, comment) => `
<div style="font-family:Arial;padding:20px">
<h2>Authority Comment</h2>

<p><b>${title}</b></p>

<div style="background:#f4f4f4;padding:10px;border-radius:5px">
${comment}
</div>
</div>
`;

const complaintDeletedTemplate = (title, location, department) => `
<div style="font-family:Arial;padding:20px">
<h2>Complaint Deleted by Citizen</h2>

<p>A complaint previously submitted has been deleted by the citizen.</p>

<table>
<tr><td><b>Title:</b></td><td>${title}</td></tr>
<tr><td><b>Location:</b></td><td>${location}</td></tr>
<tr><td><b>Department:</b></td><td>${department}</td></tr>
</table>

<p>The complaint has been removed from the portal.</p>

<hr/>
<small>City Grievance Redressal System</small>
</div>
`;

/* =============================
   📦 Cloudinary Setup
============================= */

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cgrs_complaints",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

/* =============================
   🔍 Duplicate Check
============================= */

router.post("/check-duplicate", authMiddleware, async (req, res) => {

  try {

    const { title, locationText, department } = req.body;

    const matches = await Complaint.find({
      department,
      locationText: { $regex: locationText, $options: "i" },
      status: { $nin: ["Resolved","Rejected"] }
    }).select("title");

    if (!matches.length)
      return res.json({ duplicate:false });

    const words = title.toLowerCase().split(" ");

    const similar = matches.filter(c =>
      words.some(w => c.title.toLowerCase().includes(w))
    );

    if(similar.length)
      return res.json({ duplicate:true, similarComplaints:similar });

    res.json({ duplicate:false });

  } catch(err) {

    res.status(500).json({ error:err.message });

  }

});

/* =============================
   ➕ Create Complaint
============================= */

router.post("/", authMiddleware, upload.array("photos",3), async (req,res)=>{

  try{

    const photoPaths = req.files ? req.files.map(f=>f.path) : [];

    const {title,description,locationText,department} = req.body;

    const newComplaint = await Complaint.create({

      title,
      description,
      locationText,
      department,
      photos:photoPaths,
      authorId:req.user.id,
      upvotes:1,
      upvoters:[req.user.id]

    });

    /* Send ONE demo email */

    await sendAsyncEmail(
      process.env.DEMO_EMAIL,
      "New Complaint Filed",
      complaintCreatedTemplate(title,locationText,department),
      null,
      newComplaint._id,
      "NEW_COMPLAINT"
    );

    res.status(201).json(newComplaint);

  }catch(err){

    res.status(500).json({
      message:"Error creating complaint",
      error:err.message
    });

  }

});

/* =============================
   👤 My Complaints
============================= */

router.get("/my", authMiddleware, async (req,res)=>{

  const complaints = await Complaint
    .find({authorId:req.user.id})
    .sort({upvotes:-1});

  res.json(complaints);

});

/* =============================
   🌍 Browse Complaints
============================= */

router.get("/all", authMiddleware, async (req,res)=>{

  const complaints = await Complaint
    .find()
    .sort({upvotes:-1});

  res.json(complaints);

});

/* =============================
   📄 View Single Complaint
============================= */

router.get("/:id", authMiddleware, async (req,res)=>{

  try{

    const complaint = await Complaint
      .findById(req.params.id)
      .populate("authorId","name email")
      .populate("authorityComments.by","name");

    if(!complaint)
      return res.status(404).json({message:"Complaint not found"});

    const isAuthor =
      complaint.authorId._id.toString() === req.user.id;

    const isAuthority =
      req.user.role === "authority" &&
      (complaint.department === "General" ||
       complaint.department === req.user.department);

    if(!isAuthor && !isAuthority)
      return res.status(403).json({
        message:"Complaint not found or you do not have access"
      });

    res.json(complaint);

  }catch(err){

    res.status(500).json({
      message:"Error fetching complaint",
      error:err.message
    });

  }

});

/* =============================
   👍 Upvote
============================= */

router.post("/:id/upvote", authMiddleware, async (req,res)=>{

  try{

    const complaint = await Complaint.findById(req.params.id);

    if(!complaint)
      return res.status(404).json({message:"Not found"});

    if(complaint.authorId.toString()===req.user.id)
      return res.status(400).json({message:"Cannot upvote own complaint"});

    if(complaint.upvoters.includes(req.user.id))
      return res.status(400).json({message:"Already upvoted"});

    complaint.upvotes += 1;
    complaint.upvoters.push(req.user.id);

    await complaint.save();

    res.json(complaint);

  }catch(err){

    res.status(500).json({message:err.message});

  }

});

/* =============================
   🗑 Delete Complaint
============================= */

router.delete("/:id", authMiddleware, authorizeRoles("citizen"), async (req,res)=>{

  try{

    const complaint = await Complaint.findById(req.params.id);

    if(!complaint)
      return res.status(404).json({
        message:"Complaint not found"
      });

    if(complaint.authorId.toString() !== req.user.id)
      return res.status(403).json({
        message:"You can delete only your own complaints"
      });

    const title = complaint.title;
    const location = complaint.locationText;
    const department = complaint.department;

    await complaint.deleteOne();

    /* Notify authorities (demo email) */

    await sendAsyncEmail(
      process.env.DEMO_EMAIL,
      "Complaint Deleted by Citizen",
      complaintDeletedTemplate(title,location,department),
      null,
      null,
      "DELETED"
    );

    res.json({
      message:"Complaint deleted successfully"
    });

  }catch(err){

    res.status(500).json({
      message:"Server error",
      error:err.message
    });

  }

});

/* =============================
   📊 Authority Dashboard
============================= */

router.get("/", authMiddleware, authorizeRoles("authority"), async (req,res)=>{

  try{

    const { status, area, sort, page = 1, limit = 6 } = req.query;

    const query = {
      $or:[
        { department: req.user.department },
        { department: "General" }
      ]
    };

    // By default exclude resolved and rejected from the active dashboard
    if(status){
      query.status = status;
    } else {
      query.status = { $nin: ["Resolved","Rejected"] };
    }

    if(area){
      query.locationText = { $regex: area, $options: "i" };
    }

    const sortObj = sort === "upvotes" ? { upvotes: -1 } : { createdAt: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const lim = parseInt(limit, 10) || 6;

    const totalCount = await Complaint.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(totalCount / lim));

    const complaints = await Complaint.find(query)
      .sort(sortObj)
      .skip((pageNum - 1) * lim)
      .limit(lim);

    res.json({ complaints, totalPages });

  }catch(err){

    res.status(500).json({error:err.message});

  }

});

/* =============================
   🔧 Authority Update Status
============================= */

router.put("/:id/status", authMiddleware, authorizeRoles("authority"), async (req,res)=>{

  try{

    const {status,comment} = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if(!complaint)
      return res.status(404).json({message:"Not found"});

    if(status){

      complaint.status=status;

      if(status==="Resolved")
        complaint.resolvedAt=new Date();

    }

    if(comment){

      complaint.authorityComments.push({
        by:req.user.id,
        comment
      });

    }

    await complaint.save();

    /* Send emails based on what was updated */

    if(comment){
      await sendAsyncEmail(
        process.env.DEMO_EMAIL,
        "New Comment on Your Complaint",
        commentTemplate(complaint.title,comment),
        null,
        complaint._id,
        "COMMENT"
      );
    }

    if(status){
      await sendAsyncEmail(
        process.env.DEMO_EMAIL,
        "Complaint Status Updated",
        statusUpdateTemplate(complaint.title,complaint.status),
        null,
        complaint._id,
        "STATUS_UPDATE"
      );
    }

    res.json(complaint);

  }catch(err){

    res.status(500).json({error:err.message});

  }

});

/* =============================
   🔄 Citizen Reopen
============================= */

router.put("/:id/reopen", authMiddleware, authorizeRoles("citizen"), async (req,res)=>{

  try{

    const complaint = await Complaint.findById(req.params.id);

    if(!complaint)
      return res.status(404).json({message:"Complaint not found"});


    if(complaint.status !== "Resolved" && complaint.status !== "Rejected")
      return res.status(400).json({
        message:"Only resolved or rejected complaints can be reopened"
      });

    complaint.status = "Reopened";
    complaint.resolvedAt = null;

    await complaint.save();

    await sendAsyncEmail(
      process.env.DEMO_EMAIL,
      "Complaint Reopened",
      complaintCreatedTemplate(
        complaint.title,
        complaint.locationText,
        complaint.department
      ),
      null,
      complaint._id,
      "REOPENED"
    );

    res.json({
      message:"Complaint reopened successfully",
      complaint
    });

  }catch(err){

    res.status(500).json({error:err.message});

  }

});

export default router;
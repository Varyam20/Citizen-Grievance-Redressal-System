// import express from "express";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import cors from "cors";
// import rateLimit from "express-rate-limit";
// import helmet from "helmet";
// import fs from "fs";

// import authRoutes from "./routes/authRoutes.js";
// import complaintRoutes from "./routes/complaintRoutes.js";
// import Complaint from "./models/Complaint.js";

// dotenv.config();
// const app = express();

// /* =======================
//    🔐 Security Middleware
// ======================= */

// // Helmet adds security headers (disable CSP for now to test)
// app.use(helmet({
//   contentSecurityPolicy: false,
//   crossOriginResourcePolicy: false,
//   crossOriginOpenerPolicy: false
// }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP
//   message: "Too many requests, please try again later."
// });
// app.use(limiter);

// // Restrict JSON payload size (prevent abuse)
// app.use(express.json({ limit: "10kb" }));

// // CORS (restrict if needed)
// app.use(cors({
//   origin: process.env.CLIENT_URL || "*",
//   credentials: true
// }));

// // Static folder - with explicit CORS
// app.use("/uploads", cors(), express.static("uploads"));

// /* =======================
//    🗄 Database Connection
// ======================= */

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.log("❌ Mongo error:", err));

// /* =======================
//    📦 Routes
// ======================= */

// app.use("/api/auth", authRoutes);
// app.use("/api/complaints", complaintRoutes);

// // 🔍 DEBUG: Check image paths in DB
// app.get("/api/debug/images", async (req, res) => {
//   try {
//     const complaints = await Complaint.find({}, { _id: 1, title: 1, photos: 1 }).limit(5);
//     const uploadsFiles = fs.readdirSync("uploads/");
//     res.json({
//       uploadsFolderContents: uploadsFiles,
//       complaintsInDB: complaints
//     });
//   } catch (err) {
//     res.json({ error: err.message });
//   }
// });

// /* =======================
//    ❌ Global Error Handler
// ======================= */

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something went wrong" });
// });

// /* =======================
//    🚀 Server
// ======================= */

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import fs from "fs";

import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import Complaint from "./models/Complaint.js";

dotenv.config();
const app = express();

/* =======================
   🔐 Security Middleware
======================= */

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});
app.use(limiter);

app.use(express.json({ limit: "10kb" }));

/* =======================
   🌐 CORS
======================= */

// app.use(cors({
//   origin: process.env.CLIENT_URL || "*",
//   credentials: true
// }));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://citizen-grievance-redressal-system.vercel.app"
  ],
  credentials: true
}));

/* =======================
   📂 Static uploads
======================= */

app.use("/uploads", cors(), express.static("uploads"));

/* =======================
   ❤️ Health Route
======================= */

app.get("/", (req, res) => {
  res.send("CGRS Backend API running 🚀");
});

/* =======================
   🗄 Database Connection
======================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ Mongo error:", err));

/* =======================
   📦 Routes
======================= */

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

/* =======================
   🔍 Debug Route (optional)
======================= */

if (process.env.NODE_ENV !== "production") {
  app.get("/api/debug/images", async (req, res) => {
    try {
      const complaints = await Complaint.find({}, { _id: 1, title: 1, photos: 1 }).limit(5);
      const uploadsFiles = fs.readdirSync("uploads/");
      res.json({
        uploadsFolderContents: uploadsFiles,
        complaintsInDB: complaints
      });
    } catch (err) {
      res.json({ error: err.message });
    }
  });
}

/* =======================
   ❌ Global Error Handler
======================= */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

/* =======================
   🚀 Server
======================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
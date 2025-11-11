import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const authorities = [
  { name: "Roads Dept", email: "roads@cgrs.in", password: "roads123", department: "Roads" },
  { name: "Water Dept", email: "water@cgrs.in", password: "water123", department: "Water" },
  { name: "Electricity Dept", email: "electricity@cgrs.in", password: "electric123", department: "Electricity" },
  { name: "Sanitation Dept", email: "sanitation@cgrs.in", password: "clean123", department: "Sanitation" }
];

for (const auth of authorities) {
  const existing = await User.findOne({ email: auth.email });
  if (existing) continue;
  const passwordHash = await bcrypt.hash(auth.password, 10);
  await User.create({ ...auth, passwordHash, role: "authority" });
  console.log(`Created authority: ${auth.email}`);
}

await mongoose.disconnect();

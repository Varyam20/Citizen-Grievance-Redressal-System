import { Resend } from "resend";
import Notification from "../models/Notification.js";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

console.log("📧 Resend email service initialized");

export const sendEmail = async (
  to,
  subject,
  html,
  userId = null,
  complaintId = null,
  type = null
) => {

  try {

    // Redirect fake authority domains to demo inbox
    if (to.endsWith("@cgrs.in")) {
      console.log(`Redirecting ${to} → ${process.env.DEMO_EMAIL}`);
      to = process.env.DEMO_EMAIL;
    }

    const { data, error } = await resend.emails.send({
      from: "City Grievance Portal <onboarding@resend.dev>",
      to,
      subject,
      html
    });

    if (error) {
      console.error("Resend error:", error);
      return;
    }

    console.log("📨 Email sent:", data.id);

    // Save notification log
    if (userId) {
      await Notification.create({
        userId,
        email: to,
        subject,
        complaintId,
        type
      });
    }

  } catch (err) {
    console.error("Email failed:", err.message);
  }

};
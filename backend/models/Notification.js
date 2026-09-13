import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  email: {
    type: String,
    required: true
  },

  subject: String,

  type: {
    type: String,
    enum: [
      "NEW_COMPLAINT",
      "STATUS_UPDATE",
      "COMMENT",
      "REOPENED"
    ]
  },

  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint"
  },

  sentAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("Notification", notificationSchema);
import mongoose from 'mongoose';
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
    subject: { type: String, required: true, trim: true, maxlength: 180 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);
contactSchema.index({ isRead: 1, createdAt: -1 });
export default mongoose.model('Contact', contactSchema);

import mongoose from 'mongoose';
const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    organization: { type: String, required: true, trim: true, maxlength: 150 },
    date: { type: Date, required: true },
    credentialUrl: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);
certificationSchema.index({ order: 1, date: -1 });
export default mongoose.model('Certification', certificationSchema);

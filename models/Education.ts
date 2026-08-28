import mongoose from 'mongoose';
const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true, trim: true, maxlength: 150 },
    program: { type: String, trim: true, maxlength: 150, default: '' },
    school: { type: String, required: true, trim: true, maxlength: 150 },
    startYear: { type: Number, required: true, min: 1900, max: 2100 },
    endYear: { type: Number, min: 1900, max: 2100 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    achievements: [{ type: String, trim: true, maxlength: 300 }],
    order: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);
educationSchema.index({ order: 1, endYear: -1 });
export default mongoose.model('Education', educationSchema);

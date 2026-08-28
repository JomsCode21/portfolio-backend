import mongoose from 'mongoose';
const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    category: {
      type: String,
      required: true,
      enum: ['Frontend', 'Backend', 'Database', 'Tools', 'Other'],
    },
    icon: { type: String, trim: true, maxlength: 2048, default: '' },
    order: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);
skillSchema.index({ category: 1, order: 1 });
export default mongoose.model('Skill', skillSchema);

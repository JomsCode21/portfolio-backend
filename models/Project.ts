import mongoose from 'mongoose';
const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    shortDescription: { type: String, required: true, trim: true, maxlength: 300 },
    longDescription: { type: String, trim: true, maxlength: 5000, default: '' },
    image: { type: String, trim: true, default: '' },
    screenshots: [{ type: String, trim: true }],
    technologies: [{ type: String, trim: true, maxlength: 50 }],
    features: [{ type: String, trim: true, maxlength: 200 }],
    githubUrl: { type: String, trim: true, default: '' },
    liveUrl: { type: String, trim: true, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);
projectSchema.index({ featured: -1, order: 1, createdAt: -1 });
export default mongoose.model('Project', projectSchema);

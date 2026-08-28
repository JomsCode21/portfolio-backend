import mongoose from 'mongoose';
const experienceSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    employmentType: {
      type: String,
      required: true,
      enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Academic', 'Other'],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    description: { type: String, trim: true, maxlength: 3000, default: '' },
    responsibilities: [{ type: String, trim: true, maxlength: 300 }],
    technologies: [{ type: String, trim: true, maxlength: 50 }],
    order: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);
experienceSchema.index({ order: 1, startDate: -1 });
export default mongoose.model('Experience', experienceSchema);

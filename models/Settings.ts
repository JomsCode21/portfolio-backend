import mongoose from 'mongoose';
const settingsSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 100, default: 'Jhumari Job Galos' },
    title: { type: String, trim: true, maxlength: 120, default: 'MERN Stack Developer' },
    tagline: {
      type: String,
      trim: true,
      maxlength: 400,
      default:
        'I build modern, responsive, and scalable full-stack web applications using MongoDB, Express.js, React.js, and Node.js.',
    },
    aboutHeading: {
      type: String,
      trim: true,
      maxlength: 180,
      default: 'A practical, curious full-stack developer.',
    },
    bio: { type: String, trim: true, maxlength: 4000, default: '' },
    focus: { type: String, trim: true, maxlength: 120, default: 'Full-stack applications' },
    approach: {
      type: String,
      trim: true,
      maxlength: 160,
      default: 'Thoughtful, iterative, user-centred',
    },
    email: { type: String, trim: true, lowercase: true, default: 'iramuhjsolag@gmail.com' },
    phone: { type: String, trim: true, maxlength: 50, default: '' },
    location: { type: String, trim: true, maxlength: 100, default: '' },
    github: { type: String, trim: true, default: 'https://github.com/JomsCode21' },
    linkedin: {
      type: String,
      trim: true,
      default: 'https://www.linkedin.com/in/jhumari-job-galos-395509311/',
    },
    socialLinks: [{ label: { type: String, trim: true }, url: { type: String, trim: true } }],
    resumeUrl: { type: String, trim: true, default: '' },
    resumeFileKey: { type: String, trim: true, default: '' },
    heroImageUrl: { type: String, trim: true, default: '' },
    heroImageFileKey: { type: String, trim: true, default: '' },
    profileImage: { type: String, trim: true, default: '' },
    availableForWork: { type: Boolean, default: true },
    footerText: { type: String, trim: true, maxlength: 200, default: '' },
  },
  { timestamps: true },
);
export default mongoose.model('Settings', settingsSchema);

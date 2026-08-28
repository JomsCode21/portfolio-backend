import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
await connectDB();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.');
let user = await User.findOne({ email: email.toLowerCase() });
if (!user) {
  user = await User.create({ name: 'Portfolio Admin', email, password });
  console.log(`Admin created for ${user.email}`);
} else console.log('Admin already exists.');
await Settings.findOneAndUpdate({}, {}, { upsert: true, setDefaultsOnInsert: true });
process.exit(0);

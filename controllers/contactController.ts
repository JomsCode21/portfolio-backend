import Contact from '../models/Contact.js';
import { notifyNewContact } from '../services/notificationService.js';
export async function submit(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    if (![name, email, subject, message].every(Boolean))
      return res.status(400).json({
        success: false,
        message: 'Please complete every contact field.',
      });
    const contact = await Contact.create({ name, email, subject, message });
    await notifyNewContact(contact);
    res.status(201).json({ success: true, message: 'Thanks! Your message has been sent.' });
  } catch (e) {
    next(e);
  }
}
export async function list(req, res, next) {
  try {
    res.json({
      success: true,
      data: await Contact.find().sort({ isRead: 1, createdAt: -1 }).lean(),
    });
  } catch (e) {
    next(e);
  }
}
export async function get(req, res, next) {
  try {
    const item = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
}
export async function markRead(req, res, next) {
  try {
    const item = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
}
export async function remove(req, res, next) {
  try {
    const item = await Contact.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: 'Message deleted.' });
  } catch (e) {
    next(e);
  }
}

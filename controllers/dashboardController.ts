import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Certification from '../models/Certification.js';
import Contact from '../models/Contact.js';
export async function stats(req, res, next) {
  try {
    const [projects, skills, experiences, certifications, messages, unreadMessages] =
      await Promise.all([
        Project.countDocuments(),
        Skill.countDocuments(),
        Experience.countDocuments(),
        Certification.countDocuments(),
        Contact.countDocuments(),
        Contact.countDocuments({ isRead: false }),
      ]);
    res.json({
      success: true,
      data: { projects, skills, experiences, certifications, messages, unreadMessages },
    });
  } catch (e) {
    next(e);
  }
}

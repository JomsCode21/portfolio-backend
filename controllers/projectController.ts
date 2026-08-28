import Project from '../models/Project.js';
import { makeResourceController } from './resourceController.js';
const base = makeResourceController(Project);
export const { list, get, create, update, remove } = base;
export async function getBySlug(req, res, next) {
  try {
    const item = await Project.findOne({ slug: req.params.slug }).lean();
    if (!item) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
}

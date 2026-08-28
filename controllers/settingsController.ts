import Settings from '../models/Settings.js';
export async function getSettings(req, res, next) {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, data: settings });
  } catch (e) {
    next(e);
  }
}
export async function updateSettings(req, res, next) {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });
    res.json({ success: true, data: settings });
  } catch (e) {
    next(e);
  }
}

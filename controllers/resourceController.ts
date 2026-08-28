export const makeResourceController = (Model) => ({
  list: async (req, res, next) => {
    try {
      const items = await Model.find().sort({ featured: -1, order: 1, createdAt: -1 }).lean();
      res.json({ success: true, data: items });
    } catch (e) {
      next(e);
    }
  },
  get: async (req, res, next) => {
    try {
      const item = await Model.findById(req.params.id).lean();
      if (!item) return res.status(404).json({ success: false, message: 'Record not found.' });
      res.json({ success: true, data: item });
    } catch (e) {
      next(e);
    }
  },
  create: async (req, res, next) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (e) {
      next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item) return res.status(404).json({ success: false, message: 'Record not found.' });
      res.json({ success: true, data: item });
    } catch (e) {
      next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'Record not found.' });
      res.json({ success: true, message: 'Record deleted.' });
    } catch (e) {
      next(e);
    }
  },
});

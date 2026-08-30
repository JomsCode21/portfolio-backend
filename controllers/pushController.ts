import PushSubscription from '../models/PushSubscription.js';
import { getVapidPublicKey } from '../services/notificationService.js';

export function publicKey(req, res) {
  const key = getVapidPublicKey();
  if (!key)
    return res.status(503).json({
      success: false,
      message: 'Browser notifications have not been configured yet.',
    });
  res.json({ success: true, data: { publicKey: key } });
}

export async function subscribe(req, res, next) {
  try {
    const { endpoint, expirationTime, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth)
      return res
        .status(400)
        .json({ success: false, message: 'A valid push subscription is required.' });

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { user: req.user._id, endpoint, expirationTime: expirationTime || null, keys },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    res.status(201).json({ success: true, message: 'Browser notifications enabled.' });
  } catch (error) {
    next(error);
  }
}

export async function unsubscribe(req, res, next) {
  try {
    if (!req.body.endpoint)
      return res
        .status(400)
        .json({ success: false, message: 'A subscription endpoint is required.' });
    await PushSubscription.deleteOne({ endpoint: req.body.endpoint, user: req.user._id });
    res.json({ success: true, message: 'Browser notifications disabled.' });
  } catch (error) {
    next(error);
  }
}

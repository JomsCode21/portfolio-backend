import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    req.user = await User.findById(decoded.id as string);
    if (!req.user) throw new Error();
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}
export function authorize(...roles) {
  return (req, res, next) =>
    roles.includes(req.user?.role)
      ? next()
      : res
          .status(403)
          .json({ success: false, message: 'You do not have permission for this action.' });
}

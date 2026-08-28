export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}
export function errorHandler(err: any, req, res, next) {
  console.error(err);
  const status =
    err.name === 'ValidationError' ? 400 : err.code === 11000 ? 400 : err.statusCode || 500;
  const message =
    err.name === 'ValidationError'
      ? Object.values(err.errors)
          .map((e: any) => e.message)
          .join(', ')
      : err.code === 11000
        ? 'A record with that value already exists.'
        : err.message || 'Server error.';
  res.status(status).json({ success: false, message });
}

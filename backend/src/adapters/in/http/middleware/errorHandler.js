const errorHandler = (err, req, res, next) => {
  const status  = err.statusCode || 500;
  const message = err.message    || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
  }

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;

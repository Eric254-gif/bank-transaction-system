// Centralized error-handling middleware. Every controller either throws
// an ApiError (or lets Mongoose throw a ValidationError/CastError) and
// this middleware turns it into a consistent JSON response shape:
// { success: false, message: "..." }
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose validation error (e.g. missing required field, bad enum value)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose bad ObjectId (e.g. /api/customers/not-a-valid-id)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
  }

  // Duplicate key error (e.g. email or accountNumber already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `That ${field} is already in use` : "Duplicate value";
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
  });
};

// Handles requests to routes that don't exist
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };

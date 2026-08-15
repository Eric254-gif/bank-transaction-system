// A small custom error class that carries an HTTP status code alongside
// the error message, so the error-handling middleware knows what status
// to respond with.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;

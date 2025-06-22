const { CustomAPIError } = require('../errors/custom-error')

const errorHandlerMiddleware = (err, req, res, next) => {
  // console.error(err); // Uncomment for detailed error logging during development

  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    // Joining messages for a cleaner error response in the API, could also return array
    return res.status(400).json({
      msg: 'Validation Error',
      errors: messages.join('. '),
    });
  }

  // Handle Mongoose Cast Errors (e.g., invalid ObjectId format for _id)
  // Check err.path to be more specific, e.g., if the cast error is for an '_id' field
  if (err.name === 'CastError' && err.path === '_id') {
    return res.status(404).json({ msg: `No task found with id: ${err.value}. Invalid ID format.` });
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code && err.code === 11000) {
    // Provides a more user-friendly message indicating which field was duplicated
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(400).json({
      msg: `Duplicate value for field '${field}'. The value '${value}' already exists.`,
    });
  }

  // Default to 500 internal server error for any other unhandled errors
  // Log the error server-side for debugging, but send a generic message to the client
  console.error("Unhandled error:", err); // It's good practice to log unhandled errors
  return res.status(500).json({ msg: 'An unexpected error occurred on the server. Please try again later.' });
};

module.exports = errorHandlerMiddleware;

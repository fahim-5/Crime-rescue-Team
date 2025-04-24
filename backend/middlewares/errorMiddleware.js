const errorMiddleware = (err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  console.error("Stack trace:", err.stack); // Log full stack trace for debugging

  // Handle different error types
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // JSON parsing error
    return res.status(400).json({ 
      success: false,
      message: "Invalid JSON format",
      error: err.message 
    });
  }

  if (err.name === 'MulterError') {
    // File upload errors
    return res.status(400).json({
      success: false,
      message: "File upload error",
      error: err.message,
      code: err.code
    });
  }

  if (err.name === 'ValidationError') {
    // Database validation errors
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: err.message,
      details: err.errors
    });
  }

  // Database errors
  if (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_FIELD_ERROR') {
    return res.status(500).json({
      success: false,
      message: "Database configuration error",
      error: err.message
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorMiddleware;
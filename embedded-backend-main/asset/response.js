// Success response template
function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message: message,
    data: data,
  });
}

// Error response template
function errorResponse(res, message = 'An error occurred', statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message: message,
    data: null,
  });
}

module.exports = {successResponse, errorResponse};
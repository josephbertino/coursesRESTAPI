// Handler function to wrap each route.
exports.asyncHandler = (cb) => {
  return async (req, res, next) => {
    try {
      // Run the asynchronous function
      await cb(req, res, next);
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        // Sequelize validation error likely means that the user request was bad 
        // (e.g. missing field or not authorized to make the request)
        res.status(400).json({ errors });
      } else {
        next(error);
      }
    }
  }
}
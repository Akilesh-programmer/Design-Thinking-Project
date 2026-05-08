import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  };
};

export const authValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
];

export const attendanceValidation = [
  body('eventId').isMongoId().withMessage('Invalid event ID'),
  body('blobUrl').isURL().withMessage('Invalid blob URL'),
  body('geo.latitude').isDecimal().withMessage('Invalid latitude'),
  body('geo.longitude').isDecimal().withMessage('Invalid longitude'),
];

export const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('startTime').isISO8601().withMessage('Invalid start time'),
  body('endTime').isISO8601().withMessage('Invalid end time'),
  body('location.latitude').isDecimal().withMessage('Invalid latitude'),
  body('location.longitude').isDecimal().withMessage('Invalid longitude'),
];

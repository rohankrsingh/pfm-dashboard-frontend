import { body, validationResult } from 'express-validator';

export const validateSignUp = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const validateLogIn = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const validateTransaction = [
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').notEmpty().withMessage('Category is required'),
  body('accountId').notEmpty().withMessage('Account ID is required')
];

export const validateAccount = [
  body('name').trim().notEmpty().withMessage('Account name is required'),
  body('type').isIn(['checking', 'savings', 'investment', 'credit_card']).withMessage('Invalid account type'),
  body('balance').isFloat({ gte: 0 }).withMessage('Balance must be >= 0')
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

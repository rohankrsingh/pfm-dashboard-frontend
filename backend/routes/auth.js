import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateSignUp, validateLogIn, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

router.post('/signup', validateSignUp, handleValidationErrors, authController.signUp);
router.post('/login', validateLogIn, handleValidationErrors, authController.logIn);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.put('/password', protect, authController.updatePassword);
router.delete('/account', protect, authController.deleteAccount);

export default router;

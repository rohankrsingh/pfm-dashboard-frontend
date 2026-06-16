import express from 'express';
import * as accountController from '../controllers/accountController.js';
import { protect } from '../middleware/auth.js';
import { validateAccount, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

router.use(protect);

router.post('/', validateAccount, handleValidationErrors, accountController.createAccount);
router.get('/', accountController.getAccounts);
router.get('/:id', accountController.getAccount);
router.put('/:id', validateAccount, handleValidationErrors, accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

export default router;

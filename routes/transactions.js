import express from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';
import { validateTransaction, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

router.use(protect);

router.post('/', validateTransaction, handleValidationErrors, transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/account/:accountId', transactionController.getTransactionsByAccount);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;

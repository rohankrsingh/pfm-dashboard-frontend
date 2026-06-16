import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';

export const createTransaction = async (req, res) => {
  try {
    const { description, amount, type, category, accountId, date, notes } = req.body;

    // Update account balance
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (type === 'income') {
      account.balance += amount;
    } else {
      account.balance -= amount;
    }

    await account.save();

    const transaction = await Transaction.create({
      userId: req.user.id,
      accountId,
      description,
      amount,
      type,
      category,
      date: date || new Date(),
      notes
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate('accountId')
      .sort({ date: -1 });

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransactionsByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const transactions = await Transaction.find({
      userId: req.user.id,
      accountId
    }).sort({ date: -1 });

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update account balance
    const account = await Account.findById(transaction.accountId);
    if (transaction.type === 'income') {
      account.balance -= transaction.amount;
    } else {
      account.balance += transaction.amount;
    }
    await account.save();

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

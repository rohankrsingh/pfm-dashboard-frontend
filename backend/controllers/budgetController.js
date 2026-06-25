import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

export const getBudgets = async (req, res) => {
  try {
    const { month } = req.query; // e.g. "2026-06"
    if (!month) {
      return res.status(400).json({ success: false, message: 'Month query param is required' });
    }

    const budgets = await Budget.find({ userId: req.user.id, month });

    // Calculate spent dynamically from transactions
    const startOfMonth = new Date(`${month}-01T00:00:00Z`);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const transactions = await Transaction.find({
      userId: req.user.id,
      type: 'expense',
      date: { $gte: startOfMonth, $lt: endOfMonth }
    });

    const categorySpending = {};
    transactions.forEach(tx => {
      const cat = tx.category.toLowerCase();
      categorySpending[cat] = (categorySpending[cat] || 0) + tx.amount;
    });

    // Merge calculated spent into budgets array
    const budgetsWithSpent = budgets.map(b => ({
      ...b.toObject(),
      spent: categorySpending[b.category] || 0
    }));

    res.status(200).json({ success: true, budgets: budgetsWithSpent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBudget = async (req, res) => {
  try {
    const { category, amount, month } = req.body;

    // Check if budget already exists for this category and month
    const existingBudget = await Budget.findOne({ userId: req.user.id, category, month });
    if (existingBudget) {
      return res.status(400).json({ success: false, message: 'Budget already exists for this category in the specified month' });
    }

    const budget = await Budget.create({
      userId: req.user.id,
      category,
      amount,
      month
    });

    res.status(201).json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    let budget = await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (budget.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    budget = await Budget.findByIdAndUpdate(id, { amount }, { new: true, runValidators: true });

    res.status(200).json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (budget.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Budget.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

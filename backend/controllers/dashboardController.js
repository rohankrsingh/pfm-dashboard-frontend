import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';

export const getDashboardSummary = async (req, res) => {
  try {
    // Get all accounts and their total balance
    const accounts = await Account.find({ userId: req.user.id });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Get transactions for current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyTransactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: firstDay, $lte: lastDay }
    });

    // Calculate income and expenses for the month
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Get expense breakdown by category
    const expenseByCategory = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      });

    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId: req.user.id })
      .populate('accountId')
      .sort({ date: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      summary: {
        totalBalance,
        accountCount: accounts.length,
        monthlyIncome,
        monthlyExpenses,
        monthlyNet: monthlyIncome - monthlyExpenses,
        expenseByCategory,
        recentTransactions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMonthlyStats = async (req, res) => {
  try {
    const { month } = req.params; // Format: YYYY-MM

    const [year, monthNum] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: firstDay, $lte: lastDay }
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = {};
    transactions.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        byCategory[t.category].income += t.amount;
      } else {
        byCategory[t.category].expense += t.amount;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        month,
        income,
        expenses,
        net: income - expenses,
        byCategory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

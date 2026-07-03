import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import mongoose from 'mongoose';

export const getDashboardSummary = async (req, res) => {
  try {
    // Get all accounts and their total balance
    const accounts = await Account.find({ userId: req.user.id });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Get transactions for current month
    let now = new Date();

    // If current calendar month has no transactions, fall back to the month of the most recent transaction
    const hasTransactionsThisMonth = await Transaction.exists({
      userId: req.user.id,
      date: {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      }
    });

    if (!hasTransactionsThisMonth) {
      const mostRecentTx = await Transaction.findOne({ userId: req.user.id }).sort({ date: -1 });
      if (mostRecentTx) {
        now = new Date(mostRecentTx.date);
      }
    }

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

export const getCashFlowHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Calculate range for last 6 months
    const now = new Date();
    const startOfRange = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const stats = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startOfRange }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Format output as array of last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const history = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mNum = d.getMonth() + 1;
      const yNum = d.getFullYear();

      const incomeStat = stats.find(s => s._id.year === yNum && s._id.month === mNum && s._id.type === 'income');
      const expenseStat = stats.find(s => s._id.year === yNum && s._id.month === mNum && s._id.type === 'expense');

      history.push({
        month: months[d.getMonth()],
        income: incomeStat ? incomeStat.total : 0,
        expenses: expenseStat ? expenseStat.total : 0
      });
    }

    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

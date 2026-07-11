import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import Budget from '../models/Budget.js';
import mongoose from 'mongoose';

export const getDashboardSummary = async (req, res) => {
  try {
    // Get all accounts and their total balance
    const accounts = await Account.find({ userId: req.user.id });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Get transactions for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const monthlyTransactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: thirtyDaysAgo, $lte: now }
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

export const getAdvancedAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // 1. Fetch Budget vs Actuals for Current Month
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const budgets = await Budget.find({ userId, month: currentMonthStr });
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthlyExpenses = await Transaction.find({
      userId,
      type: 'expense',
      date: { $gte: startOfMonth, $lt: endOfMonth }
    });
    
    const categorySpending = {};
    monthlyExpenses.forEach(tx => {
      const cat = tx.category.toLowerCase();
      categorySpending[cat] = (categorySpending[cat] || 0) + tx.amount;
    });
    
    const budgetVsActual = budgets.map(b => ({
      category: b.category,
      budgeted: b.amount,
      spent: categorySpending[b.category.toLowerCase()] || 0
    }));

    // 2. Fetch Historical Net Worth (last 6 months)
    const accounts = await Account.find({ userId });
    let currentNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    // Calculate range for last 6 months cash flow
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
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const monthsStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const netWorthTrend = [];
    
    // Work backwards from current net worth using monthly net flows
    let runningNetWorth = currentNetWorth;
    
    for (let i = 0; i <= 5; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mNum = d.getMonth() + 1;
      const yNum = d.getFullYear();
      
      const incomeStat = stats.find(s => s._id.year === yNum && s._id.month === mNum && s._id.type === 'income');
      const expenseStat = stats.find(s => s._id.year === yNum && s._id.month === mNum && s._id.type === 'expense');
      
      const monthlyIncome = incomeStat ? incomeStat.total : 0;
      const monthlyExpense = expenseStat ? expenseStat.total : 0;
      const netFlow = monthlyIncome - monthlyExpense;
      
      // Store the net worth for this month
      netWorthTrend.unshift({
        month: monthsStr[d.getMonth()],
        netWorth: runningNetWorth
      });
      
      // Subtract this month's net flow to get the previous month's ending net worth
      runningNetWorth -= netFlow;
    }

    res.status(200).json({
      success: true,
      budgetVsActual,
      netWorthTrend
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

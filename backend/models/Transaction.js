import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    },
    description: {
      type: String,
      required: [true, 'Please provide transaction description'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide transaction amount']
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true
    },
    category: {
      type: String,
      enum: ['salary', 'food', 'utilities', 'transportation', 'entertainment', 'healthcare', 'shopping', 'other'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);

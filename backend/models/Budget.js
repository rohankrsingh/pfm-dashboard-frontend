import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['salary', 'food', 'utilities', 'transportation', 'entertainment', 'healthcare', 'shopping', 'other'],
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide budget amount']
    },
    month: {
      type: String,
      required: true // Format: YYYY-MM
    },
    spent: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model('Budget', budgetSchema);

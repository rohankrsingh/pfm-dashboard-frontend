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
      required: true
    },
    // Plaid personal_finance_category.detailed
    subcategory: {
      type: String,
      default: null
    },
    date: {
      type: Date,
      default: Date.now
    },
    // How the transaction was made: online, in store, other
    paymentChannel: {
      type: String,
      default: null
    },
    notes: String,
    // Plaid fields
    plaidTransactionId: {
      type: String,
      sparse: true,
      unique: true
    },
    itemId: String,
    pending: {
      type: Boolean,
      default: false
    },
    merchantName: String
  },
  { timestamps: true }
);

// Index for efficient date-range queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ accountId: 1, date: -1 });

export default mongoose.model('Transaction', transactionSchema);

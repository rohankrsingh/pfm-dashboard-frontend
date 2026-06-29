import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please provide account name'],
      trim: true
    },
    type: {
      type: String,
      enum: ['checking', 'savings', 'investment', 'credit_card'],
      required: true
    },
    balance: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    color: {
      type: String,
      default: '#3B82F6'
    },
    plaidAccountId: {
      type: String,
      sparse: true,
      unique: true
    },
    itemId: {
      type: String
    },
    mask: {
      type: String
    },
    subtype: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model('Account', accountSchema);

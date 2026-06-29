import mongoose from 'mongoose';

const plaidItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    itemId: {
      type: String,
      required: true,
      unique: true
    },
    accessToken: {
      type: String,
      required: true
    },
    transactionsCursor: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ERROR', 'PENDING_DISCONNECT', 'REVOKED'],
      default: 'ACTIVE'
    },
    errorCode: {
      type: String,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model('PlaidItem', plaidItemSchema);

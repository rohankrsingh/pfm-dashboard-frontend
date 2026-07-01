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
    // accessToken is stored ENCRYPTED — never store plaintext
    accessToken: {
      type: String,
      required: true
    },
    institutionId: {
      type: String,
      default: null
    },
    institutionName: {
      type: String,
      default: null
    },
    // Cursor for incremental /transactions/sync
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
    },
    // Track last successful sync
    lastSyncedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model('PlaidItem', plaidItemSchema);

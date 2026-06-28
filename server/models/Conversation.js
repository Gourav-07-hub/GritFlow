import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      required: true,
      validate: [
        {
          validator: function (val) {
            return val.length === 2;
          },
          message: 'A conversation must have exactly 2 participants',
        },
      ],
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Compound unique index on participants array to prevent duplicate conversations between same two users
conversationSchema.index({ participants: 1 }, { unique: true });

// Pre-save hook to sort participants to guarantee uniqueness regardless of query order
conversationSchema.pre('save', function () {
  if (this.participants && this.participants.length === 2) {
    this.participants.sort();
  }
});

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

export default Conversation;

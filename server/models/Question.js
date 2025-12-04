const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);

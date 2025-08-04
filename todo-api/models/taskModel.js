// models/taskModel.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  customId: { 
    type: Number, 
    unique: true } 
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

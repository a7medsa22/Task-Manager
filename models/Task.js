const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'must provide name'],
    trim: true,
    maxlength: [20, 'name can not be more than 20 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [100, 'description can not be more than 100 characters'],
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  completed: {
    type: Boolean,
    default: false,
  },
})

module.exports = mongoose.model('Task', TaskSchema)

const Task = require('../models/Task')
const asyncWrapper = require('../middleware/async')
const { createCustomError } = require('../errors/custom-error')

const getAllTasks = asyncWrapper(async (req, res) => {
  const { completed, priority, sortBy, order = 'asc' } = req.query
  const queryObject = {}

  if (completed !== undefined) {
    queryObject.completed = completed === 'true'
  }

  if (priority) {
    queryObject.priority = priority
  }

  let query = Task.find(queryObject) // Changed 'result' to 'query' for clarity

  // Apply sorting
  if (sortBy === 'priority') {
    // Manual sorting for priority after fetching
    const tasks = await query.exec(); // Execute query to get all tasks matching filters
    const priorityOrder = { low: 1, medium: 2, high: 3 };
    tasks.sort((a, b) => {
      const orderA = priorityOrder[a.priority] || 0; // Default for unexpected values
      const orderB = priorityOrder[b.priority] || 0;
      return order === 'desc' ? orderB - orderA : orderA - orderB;
    });
    return res.status(200).json({ tasks, count: tasks.length });
  } else if (sortBy) {
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    query = query.sort(sortOptions);
  } else {
    // Default sort by createdAt if no sortBy is specified
    query = query.sort({ createdAt: -1 });
  }

  const tasks = await query.exec(); // Execute the query after sorting options are set
  res.status(200).json({ tasks, count: tasks.length });
})

const createTask = asyncWrapper(async (req, res, next) => {
  try {
    const { name, description, priority, dueDate, completed } = req.body
    const task = await Task.create({ name, description, priority, dueDate, completed })
    res.status(201).json({ task })
  } catch (error) {
    // Forward validation errors to the centralized error handler
    if (error.name === 'ValidationError') {
      return next(error);
    }
    // Forward other errors as well
    next(error)
  }
})

const getTask = asyncWrapper(async (req, res, next) => {
  const { id: taskID } = req.params
  const task = await Task.findOne({ _id: taskID })
  if (!task) {
    return next(createCustomError(`No task with id : ${taskID}`, 404))
  }
  res.status(200).json({ task })
})

const deleteTask = asyncWrapper(async (req, res, next) => {
  const { id: taskID } = req.params
  const task = await Task.findOneAndDelete({ _id: taskID })
  if (!task) {
    return next(createCustomError(`No task with id : ${taskID}`, 404))
  }
  res.status(200).json({ task })
})

const updateTask = asyncWrapper(async (req, res, next) => {
  const { id: taskID } = req.params
  const { name, description, priority, dueDate, completed } = req.body

  try {
    const task = await Task.findOneAndUpdate(
      { _id: taskID },
      { name, description, priority, dueDate, completed },
      {
        new: true,
        runValidators: true, // Crucial for Mongoose to run model validations on update
      }
    )

    if (!task) {
      return next(createCustomError(`No task with id : ${taskID}`, 404))
    }
    res.status(200).json({ task })
  } catch (error) {
    // Forward validation errors to the centralized error handler
    if (error.name === 'ValidationError') {
      return next(error);
    }
    // Forward other errors as well
    next(error);
  }
})

module.exports = {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
}

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

// Protect all task routes using the JWT authentication middleware
router.use(authMiddleware);

// POST /api/tasks - Create a new task
router.post('/', createTask);

// GET /api/tasks - Retrieve all tasks for the logged-in user
router.get('/', getAllTasks);

// GET /api/tasks/:id - Retrieve a specific task by ID
router.get('/:id', getTaskById);

// PUT /api/tasks/:id - Update an existing task by ID
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete a task by ID
router.delete('/:id', deleteTask);

module.exports = router;

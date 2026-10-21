const { dbRun, dbGet, dbAll } = require('../database/database');

/**
 * Helper function to format task output.
 * Converts SQLite integer boolean (0 or 1) to a true JavaScript boolean.
 */
const formatTask = (task) => {
  if (!task) return null;
  return {
    id: task.id,
    user_id: task.user_id,
    title: task.title,
    description: task.description,
    completed: Boolean(task.completed),
    created_at: task.created_at,
    updated_at: task.updated_at,
  };
};

/**
 * Helper to validate positive integer IDs.
 */
const isValidId = (id) => {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0;
};

/**
 * POST /api/tasks
 * Create a new task for the authenticated user.
 */
const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, completed } = req.body;

    // 1. Validate required field: title
    if (title === undefined || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: 'Title is required and cannot be empty.',
      });
    }

    // 2. Validate required field: description
    if (description === undefined || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({
        error: 'Description is required and cannot be empty.',
      });
    }

    // 3. Validate completed field if supplied
    let completedValue = 0; // Default: false
    if (completed !== undefined) {
      if (typeof completed !== 'boolean' && completed !== 0 && completed !== 1) {
        return res.status(400).json({
          error: 'Completed must be a boolean value (true or false).',
        });
      }
      completedValue = completed ? 1 : 0;
    }

    // 4. Insert task into database
    const insertResult = await dbRun(
      `INSERT INTO tasks (user_id, title, description, completed)
       VALUES (?, ?, ?, ?)`,
      [userId, title.trim(), description.trim(), completedValue]
    );

    // 5. Fetch the newly created task
    const newTask = await dbGet('SELECT * FROM tasks WHERE id = ?', [insertResult.id]);

    return res.status(201).json({
      message: 'Task created successfully',
      task: formatTask(newTask),
    });
  } catch (error) {
    console.error('Error creating task:', error.message);
    return res.status(500).json({
      error: 'An error occurred while creating the task.',
    });
  }
};

/**
 * GET /api/tasks
 * Retrieve all tasks belonging to the authenticated user.
 */
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch only tasks belonging to the authenticated user
    const tasks = await dbAll(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json({
      count: tasks.length,
      tasks: tasks.map(formatTask),
    });
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    return res.status(500).json({
      error: 'An error occurred while fetching tasks.',
    });
  }
};

/**
 * GET /api/tasks/:id
 * Retrieve a single task by ID (must belong to authenticated user).
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate ID parameter
    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Invalid task ID. ID must be a positive integer.',
      });
    }

    // Fetch task ensuring it belongs to the authenticated user
    const task = await dbGet(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [parseInt(id, 10), userId]
    );

    // If task does not exist or does not belong to the user, return 404
    if (!task) {
      return res.status(404).json({
        error: 'Task not found.',
      });
    }

    return res.status(200).json({
      task: formatTask(task),
    });
  } catch (error) {
    console.error('Error fetching task by ID:', error.message);
    return res.status(500).json({
      error: 'An error occurred while fetching the task.',
    });
  }
};

/**
 * PUT /api/tasks/:id
 * Update an existing task (must belong to authenticated user).
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, completed } = req.body;

    // 1. Validate ID parameter
    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Invalid task ID. ID must be a positive integer.',
      });
    }

    const taskId = parseInt(id, 10);

    // 2. Check if the task exists and belongs to the user
    const existingTask = await dbGet(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (!existingTask) {
      return res.status(404).json({
        error: 'Task not found.',
      });
    }

    // 3. Ensure at least one updatable field is provided
    if (title === undefined && description === undefined && completed === undefined) {
      return res.status(400).json({
        error: 'At least one field (title, description, or completed) must be provided to update.',
      });
    }

    // 4. Validate title if provided
    let updatedTitle = existingTask.title;
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          error: 'Title cannot be empty.',
        });
      }
      updatedTitle = title.trim();
    }

    // 5. Validate description if provided
    let updatedDescription = existingTask.description;
    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({
          error: 'Description cannot be empty.',
        });
      }
      updatedDescription = description.trim();
    }

    // 6. Validate completed if provided
    let updatedCompleted = existingTask.completed;
    if (completed !== undefined) {
      if (typeof completed !== 'boolean' && completed !== 0 && completed !== 1) {
        return res.status(400).json({
          error: 'Completed must be a boolean value (true or false).',
        });
      }
      updatedCompleted = completed ? 1 : 0;
    }

    // 7. Update task in database and update updated_at timestamp
    await dbRun(
      `UPDATE tasks
       SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [updatedTitle, updatedDescription, updatedCompleted, taskId, userId]
    );

    // 8. Fetch the updated task record
    const updatedTask = await dbGet(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    return res.status(200).json({
      message: 'Task updated successfully',
      task: formatTask(updatedTask),
    });
  } catch (error) {
    console.error('Error updating task:', error.message);
    return res.status(500).json({
      error: 'An error occurred while updating the task.',
    });
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task (must belong to authenticated user).
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Validate ID parameter
    if (!isValidId(id)) {
      return res.status(400).json({
        error: 'Invalid task ID. ID must be a positive integer.',
      });
    }

    const taskId = parseInt(id, 10);

    // 2. Check if the task exists and belongs to the user
    const existingTask = await dbGet(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (!existingTask) {
      return res.status(404).json({
        error: 'Task not found.',
      });
    }

    // 3. Delete the task
    await dbRun('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);

    return res.status(200).json({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error.message);
    return res.status(500).json({
      error: 'An error occurred while deleting the task.',
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};

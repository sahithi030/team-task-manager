const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect, isProjectMember, isProjectAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const status = req.query.status || '';
    const priority = req.query.priority || '';
    const project = req.query.project || '';

    // Get user's projects
    const userProjects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ],
      isActive: true
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    // Build query
    const query = { project: { $in: projectIds } };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (project) {
      query.project = project;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'username firstName lastName email avatar')
      .populate('createdBy', 'username firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private (project members only)
router.post('/', protect, [
  body('title').notEmpty().withMessage('Task title is required'),
  body('project').notEmpty().withMessage('Project is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assigned user ID'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, description, project, assignedTo, priority, dueDate, estimatedHours, tags } = req.body;

    // Check if user is a member of the project
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!projectDoc.isMember(req.user._id)) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    // Check if assigned user is a project member
    if (assignedTo) {
      if (!projectDoc.isMember(assignedTo)) {
        return res.status(400).json({ 
          message: 'Assigned user must be a member of the project.' 
        });
      }
    }

    const task = new Task({
      title,
      description,
      project,
      assignedTo,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours,
      tags: tags || []
    });

    await task.save();

    // Populate for response
    await task.populate([
      { path: 'project', select: 'name' },
      { path: 'assignedTo', select: 'username firstName lastName email avatar' },
      { path: 'createdBy', select: 'username firstName lastName email avatar' }
    ]);

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private (project members only)
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'username firstName lastName email avatar')
      .populate('createdBy', 'username firstName lastName email avatar')
      .populate('comments.user', 'username firstName lastName email avatar')
      .populate('dependencies', 'title status');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is a member of the project
    const project = await Project.findById(task.project._id);
    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error fetching task' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private (project members only)
router.put('/:id', protect, [
  body('title').optional().notEmpty().withMessage('Task title cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assigned user ID'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number'),
  body('actualHours').optional().isNumeric().withMessage('Actual hours must be a number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is a member of the project
    const project = await Project.findById(task.project);
    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    const { title, description, status, priority, assignedTo, dueDate, estimatedHours, actualHours, tags } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (actualHours !== undefined) updateData.actualHours = actualHours;
    if (tags !== undefined) updateData.tags = tags;

    // Check if assigned user is a project member
    if (assignedTo) {
      if (!project.isMember(assignedTo)) {
        return res.status(400).json({ 
          message: 'Assigned user must be a member of the project.' 
        });
      }
      updateData.assignedTo = assignedTo;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('project', 'name')
    .populate('assignedTo', 'username firstName lastName email avatar')
    .populate('createdBy', 'username firstName lastName email avatar');

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (project admins or task creator)
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is a member of the project
    const project = await Project.findById(task.project);
    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    // Check if user is project admin or task creator
    if (!project.isAdmin(req.user._id) && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. Only project admins or task creator can delete tasks.' 
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private (project members only)
router.post('/:id/comments', protect, [
  body('text').notEmpty().trim().withMessage('Comment text is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is a member of the project
    const project = await Project.findById(task.project);
    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    const { text } = req.body;

    await task.addComment(req.user._id, text);

    const updatedTask = await Task.findById(req.params.id)
      .populate('comments.user', 'username firstName lastName email avatar');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: updatedTask.comments[updatedTask.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// @route   PUT /api/tasks/:id/status
// @desc    Update task status
// @access  Private (project members only)
router.put('/:id/status', protect, [
  body('status').isIn(['todo', 'in-progress', 'review', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is a member of the project
    const project = await Project.findById(task.project);
    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    const { status } = req.body;

    await task.updateStatus(status);

    const updatedTask = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'username firstName lastName email avatar')
      .populate('createdBy', 'username firstName lastName email avatar');

    res.json({
      message: 'Task status updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating task status' });
  }
});

// @route   GET /api/tasks/dashboard/stats
// @desc    Get task statistics for dashboard
// @access  Private
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    // Get user's projects
    const userProjects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ],
      isActive: true
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    // Get overall statistics
    const stats = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      todo: 0,
      'in-progress': 0,
      review: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    // Get overdue tasks
    const overdueCount = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });

    result.overdue = overdueCount;

    // Get user's assigned tasks
    const myTasksStats = await Task.aggregate([
      { $match: { project: { $in: projectIds }, assignedTo: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const myTasks = {
      total: 0,
      todo: 0,
      'in-progress': 0,
      review: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0
    };

    myTasksStats.forEach(stat => {
      myTasks[stat._id] = stat.count;
      myTasks.total += stat.count;
    });

    // Get my overdue tasks
    const myOverdueCount = await Task.countDocuments({
      project: { $in: projectIds },
      assignedTo: req.user._id,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });

    myTasks.overdue = myOverdueCount;

    res.json({
      overall: result,
      myTasks
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard statistics' });
  }
});

// @route   GET /api/tasks/dashboard/recent
// @desc    Get recent tasks for dashboard
// @access  Private
router.get('/dashboard/recent', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get user's projects
    const userProjects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ],
      isActive: true
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name')
      .populate('assignedTo', 'username firstName lastName email avatar')
      .populate('createdBy', 'username firstName lastName email avatar')
      .sort({ updatedAt: -1 })
      .limit(limit);

    res.json({ tasks });
  } catch (error) {
    console.error('Get recent tasks error:', error);
    res.status(500).json({ message: 'Server error fetching recent tasks' });
  }
});

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, isProjectMember, isProjectAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects for the authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const status = req.query.status || '';
    const priority = req.query.priority || '';

    // Build query for projects where user is owner or member
    const query = {
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ],
      isActive: true
    };

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const projects = await Project.find(query)
      .populate('owner', 'username firstName lastName email avatar')
      .populate('members.user', 'username firstName lastName email avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', protect, [
  body('name').notEmpty().withMessage('Project name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date')
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

    const { name, description, priority, startDate, endDate, tags } = req.body;

    const project = new Project({
      name,
      description,
      owner: req.user._id,
      priority: priority || 'medium',
      startDate: startDate || new Date(),
      endDate,
      tags: tags || []
    });

    await project.save();

    // Populate owner and members for response
    await project.populate('owner', 'username firstName lastName email avatar');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private (project members only)
router.get('/:id', protect, isProjectMember, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username firstName lastName email avatar')
      .populate('members.user', 'username firstName lastName email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get project statistics
    const taskStats = await Task.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: 0,
      todo: 0,
      'in-progress': 0,
      review: 0,
      completed: 0,
      cancelled: 0
    };

    taskStats.forEach(stat => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
    });

    res.json({
      project,
      stats
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (project admins only)
router.put('/:id', protect, isProjectAdmin, [
  body('name').optional().notEmpty().withMessage('Project name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('status').optional().isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
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

    const { name, description, status, priority, startDate, endDate, tags } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (tags !== undefined) updateData.tags = tags;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('owner', 'username firstName lastName email avatar')
    .populate('members.user', 'username firstName lastName email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (project owner only)
router.delete('/:id', protect, isProjectAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Only project owner can delete the project' 
      });
    }

    // Soft delete by setting isActive to false
    project.isActive = false;
    await project.save();

    // Optionally, you could also delete associated tasks
    await Task.updateMany(
      { project: project._id },
      { isActive: false }
    );

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private (project admins only)
router.post('/:id/members', protect, isProjectAdmin, [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member')
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

    const { userId, role } = req.body;
    const User = require('../models/User');

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = req.project;

    // Check if user is already a member
    if (project.isMember(userId)) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    // Add member
    await project.addMember(userId, role || 'member');

    await project.populate('members.user', 'username firstName lastName email avatar');

    res.json({
      message: 'Member added successfully',
      project
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error adding member' });
  }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
// @access  Private (project admins only)
router.delete('/:id/members/:userId', protect, isProjectAdmin, async (req, res) => {
  try {
    const project = req.project;
    const userId = req.params.userId;

    // Cannot remove project owner
    if (project.owner.toString() === userId) {
      return res.status(400).json({ 
        message: 'Cannot remove project owner from members' 
      });
    }

    // Check if user is a member
    if (!project.isMember(userId)) {
      return res.status(404).json({ message: 'User is not a member of this project' });
    }

    // Remove member
    await project.removeMember(userId);

    // Reassign tasks from removed member to project owner
    await Task.updateMany(
      { project: project._id, assignedTo: userId },
      { assignedTo: project.owner }
    );

    await project.populate('members.user', 'username firstName lastName email avatar');

    res.json({
      message: 'Member removed successfully',
      project
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error removing member' });
  }
});

// @route   GET /api/projects/:id/tasks
// @desc    Get all tasks for a project
// @access  Private (project members only)
router.get('/:id/tasks', protect, isProjectMember, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const status = req.query.status || '';
    const priority = req.query.priority || '';
    const assignedTo = req.query.assignedTo || '';

    // Build query
    const query = { project: req.params.id };

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

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
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
    console.error('Get project tasks error:', error);
    res.status(500).json({ message: 'Server error fetching project tasks' });
  }
});

module.exports = router;

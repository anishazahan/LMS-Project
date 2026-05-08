import express from 'express';
import { authorize, protect } from '../middlewares/auth.js';
import Course from '../models/Course.js';

const router = express.Router();

// Get all published courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate('instructor', 'name email profileImage bio')
      .populate('modules');

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email profileImage bio')
      .populate('modules');

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create course (instructor only)
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { title, description, price, category, level, thumbnail } = req.body;

    const course = await Course.create({
      title,
      description,
      price,
      category,
      level,
      thumbnail,
      instructor: req.user.id
    });

    res.status(201).json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course
router.put('/:id', protect, async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course
router.delete('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Publish/Unpublish course
router.patch('/:id/publish', protect, async (req, res) => {
  try {
    const { isPublished } = req.body;

    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    course.isPublished = isPublished;
    await course.save();

    res.json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

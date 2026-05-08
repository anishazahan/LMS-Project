import express from 'express';
import { protect } from '../middlewares/auth.js';
import Course from '../models/Course.js';
import Module from '../models/Module.js';

const router = express.Router();

// Get modules for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const modules = await Module.find({ course: req.params.courseId })
      .sort('order');

    res.json({
      success: true,
      modules
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create module
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, courseId, videoUrl, videoType, duration, content, order } = req.body;

    // Verify course exists and user is instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to add modules to this course' });
    }

    const module = await Module.create({
      title,
      description,
      course: courseId,
      videoUrl,
      videoType: videoType || 'youtube',
      duration: duration || 0,
      content,
      order: order || 0
    });

    // Add module to course
    course.modules.push(module._id);
    await course.save();

    res.status(201).json({
      success: true,
      module
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update module
router.put('/:id', protect, async (req, res) => {
  try {
    let module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const course = await Course.findById(module.course);
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    module = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      module
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete module
router.delete('/:id', protect, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const course = await Course.findById(module.course);
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Remove module from course
    course.modules = course.modules.filter(m => m.toString() !== req.params.id);
    await course.save();

    await Module.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Module deleted'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Publish/Unpublish module
router.patch('/:id/publish', protect, async (req, res) => {
  try {
    const { isPublished } = req.body;

    let module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const course = await Course.findById(module.course);
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    module.isPublished = isPublished;
    await module.save();

    res.json({
      success: true,
      module
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

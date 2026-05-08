import express from 'express';
import { protect } from '../middlewares/auth.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';

const router = express.Router();

// Get enrolled courses for a student
router.get('/student/courses', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ 
      student: req.user.id,
      paymentStatus: 'completed'
    })
      .populate('course')
      .populate('completedModules');

    res.json({
      success: true,
      enrollments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single enrollment details
router.get('/:enrollmentId', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId)
      .populate('course')
      .populate('completedModules');

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Verify user is the student
    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      success: true,
      enrollment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create enrollment (after payment)
router.post('/', protect, async (req, res) => {
  try {
    const { courseId, paymentId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      paymentId,
      paymentStatus: 'completed'
    });

    // Add to user's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: courseId }
    });

    // Add to course's enrolled students
    await Course.findByIdAndUpdate(courseId, {
      $push: { enrolledStudents: req.user.id }
    });

    res.status(201).json({
      success: true,
      enrollment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark module as completed
router.post('/:enrollmentId/complete-module', protect, async (req, res) => {
  try {
    const { moduleId } = req.body;

    let enrollment = await Enrollment.findById(req.params.enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!enrollment.completedModules.includes(moduleId)) {
      enrollment.completedModules.push(moduleId);
      
      // Calculate progress
      const course = await Course.findById(enrollment.course);
      enrollment.progress = Math.round((enrollment.completedModules.length / course.modules.length) * 100);
      
      await enrollment.save();
    }

    res.json({
      success: true,
      enrollment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

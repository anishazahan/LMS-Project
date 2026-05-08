import express from 'express';
import { protect } from '../middlewares/auth.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Send welcome email (triggered on user registration)
router.post('/welcome', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    await sendEmail(user.email, 'welcomeEmail', user.name, user.email);
    
    res.json({
      success: true,
      message: 'Welcome email sent'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send purchase confirmation (triggered after enrollment)
router.post('/purchase-confirmation', protect, async (req, res) => {
  try {
    const { courseId, enrollmentId } = req.body;
    
    const user = await User.findById(req.user.id);
    const course = await Course.findById(courseId);
    
    if (!user || !course) {
      return res.status(404).json({ error: 'User or course not found' });
    }

    await sendEmail(
      user.email,
      'purchaseConfirmation',
      user.name,
      course.title,
      course.price
    );

    // Notify instructor
    const instructor = await User.findById(course.instructor);
    if (instructor) {
      await sendEmail(
        instructor.email,
        'instructorNotification',
        instructor.name,
        user.name,
        course.title
      );
    }

    res.json({
      success: true,
      message: 'Purchase confirmation email sent'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send module release notification
router.post('/module-release', protect, async (req, res) => {
  try {
    const { courseId, moduleName } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Send email to all enrolled students
    const enrollments = await Enrollment.find({ course: courseId, paymentStatus: 'completed' })
      .populate('student');

    const emailPromises = enrollments.map((enrollment) =>
      sendEmail(
        enrollment.student.email,
        'moduleReleaseNotification',
        enrollment.student.name,
        course.title,
        moduleName
      )
    );

    await Promise.all(emailPromises);

    res.json({
      success: true,
      message: `Module release notification sent to ${enrollments.length} students`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

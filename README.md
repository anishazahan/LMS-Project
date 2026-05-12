# E-Study – Advanced Learning Management System (LMS)

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-blue)

## 🚀 Live Demo

🌐 Live Website: https://lms-anisha.vercel.app/

---

# 📚 E-Study – Advanced LMS Platform

E-Study is a production-ready modern Learning Management System (LMS) built using the MERN stack with Next.js App Router.  
The platform supports secure authentication, instructor course management, student enrollments, Stripe payment integration, Cloudinary media uploads, role-based dashboards, and responsive modern UI/UX.

---

# ✨ Core Features

## 🔐 Authentication & Security

- JWT Authentication
- Secure Login & Registration
- Role-based Authentication
  - Student
  - Instructor
- Protected Routes
- Public Routes
- Password Hashing
- Persistent Authentication
- Axios Interceptors
- Yup Validation
- Form Validation with React Hook Form
- Secure Token Handling
- Logout System

---

# 👨‍🏫 Instructor Features

## 📊 Instructor Dashboard

- Instructor Profile Management
- Upload Instructor Profile Image
- Update Personal Information
- Create Courses
- Edit Courses
- Delete Courses
- Publish / Unpublish Courses
- Create Course Modules
- Edit Modules
- Delete Modules
- Publish / Unpublish Modules
- Upload Course Thumbnail using Cloudinary
- View Enrolled Students
- View Course Engagement
- Show Payment History,Enroll Students
- Dynamic Module Release System
- Email Notifications to Students

---

# 👨‍🎓 Student Features

## 🎓 Student Dashboard

- Student Profile Management
- Upload Profile Photo
- Update User Information
- Browse Public Courses
- View Course Details
- Purchase Premium Courses
- View Enrolled Courses
- Access Published Modules
- Track Purchased Courses
- Payment History and Download PDF Receipt
- View Instructor Information
- Enable To share review when Student Purchase course
- Responsive Learning Experience

---

# 💳 Stripe Payment Integration

## Secure Checkout Flow

- Stripe Checkout Integration
- Secure Payment Verification
- Course Purchase Flow
- Automatic Enrollment After Payment
- Transaction History Storage
- Payment Success & Cancel Handling
- Restricted Access Until Payment Success

---

# ☁️ Cloudinary Integration

## Media Upload System

- Profile Image Upload
- Course Thumbnail Upload
- Cloudinary Secure URL Storage
- Optimized Media Delivery
- Live Image Rendering

---

# 📧 Email Notification System

The system automatically sends emails for:

- User Registration
- Login Verification
- Course Purchase Confirmation
- New Module Release
- Enrollment Notifications

---

# 🎨 UI/UX Features

- Modern Responsive Design
- Mobile-First Layout
- Dark Mode Support
- Reusable Components
- Centralized Theme System
- Maroon-based Custom Design System
- Skeleton Loading States
- Toast Notifications
- Empty State Handling
- Search & Filter Features
- Pagination Support

---

# ⚙️ Tech Stack

## Frontend

- Next.js App Router
- React.js
- TypeScript
- Tailwind CSS v3
- Shadcn UI
- Redux Toolkit
- Axios
- React Hook Form
- Yup Validation
- Framer Motion

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Stripe API
- Cloudinary
- Nodemailer

---

# 📁 Project Structure

```bash
E-Study/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── redux/
│   ├── services/
│   ├── schemas/
│   ├── styles/
│   ├── types/
│   └── utils/
│
├── backend/
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validators/
│
└── README.md
```

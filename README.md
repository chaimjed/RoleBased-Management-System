# 🚀 Full-Stack Management Platform

> A full-stack web application built from scratch with NestJS and React, featuring role-based access control, real-time notifications, background jobs, and user management.

## 🎯 About The Project

This project is a personal full-stack development challenge for 2026.

The goal is to build a complete application independently, covering both Client and Admin interfaces, while implementing real-world backend architecture, authentication, authorization, background processing, and real-time communication.

**Built from scratch, without AI assistance.** Every feature, implementation, debugging process, and technical decision is part of the learning challenge.

## ✨ Features

### 🔐 Authentication & Security
- User registration and login.
- Secure authentication and authorization.
- Forgot password functionality.
- Password reset through email.
- Email verification.
- Protected routes and endpoints.
- Role-Based Access Control (RBAC).

### 👥 User & Role Management
- Separate Client and Admin interfaces.
- User management and administration.
- Dynamic role management.
- Permission-based authorization.
- Database seeding for initial roles and permissions.
- Assigning permissions to roles.

### 🔔 Real-Time Notifications
- Real-time notifications using Socket.IO.
- Instant communication between the server and connected clients.
- User-specific notification handling.

### ⚙️ Background Processing
- BullMQ for asynchronous job processing.
- Background user export functionality.
- Redis-powered job queues.
- Processing tasks outside the main request-response cycle.

### 👤 Profile Management
- User profile management.
- Profile avatar upload and management.
- Cloudinary integration for image storage.

### 📊 Client & Admin Interfaces
- Dedicated dashboards.
- User account management.
- Protected pages based on roles and permissions.
- Data fetching and server-state management using React Query.

### 🛠️ Backend Architecture & Logging
- Modular NestJS architecture.
- Centralized error handling.
- Custom error management.
- Winston logging.
- Organized error and log directories.
- Structured application logging.

## 🧰 Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript |
| Backend | NestJS, TypeScript |
| Real-time communication | Socket.IO |
| Background jobs | BullMQ |
| Queue storage | Redis |
| Server state management | React Query |
| Authentication | JWT |
| Media storage | Cloudinary |
| Logging | Winston |
| Database | MySQL |
| Authorization | RBAC, Permissions |
| Version control | Git & GitHub |

## 🏗️ Architecture

The application is organized into two main parts:

- **Client:** React application for user-facing features.
- **Server:** NestJS application responsible for authentication, business logic, authorization, notifications, and background jobs.

The backend also integrates Socket.IO for real-time communication and BullMQ for asynchronous processing.

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- Redis
- A configured database
- Cloudinary account

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

### Environment Variables

Configure your environment variables in the backend and frontend `.env` files.

Required configurations include:

- Database connection
- JWT secrets
- Email service credentials
- Redis connection
- Cloudinary credentials
- Frontend API URL

### Run the Application

Start the backend:

```bash
npm run start:dev
```

Start the frontend:

```bash
npm run dev
```

Make sure Redis and your database are running before starting the application.

## 🧠 The 2026 Challenge

This is more than just another CRUD application.

My objective is to challenge myself as a Full-Stack Software Engineer by building a complete application independently.

**No AI-generated code. No shortcuts. Just learning, problem-solving, debugging, and building.**

The challenge focuses on:

- Understanding how frontend and backend communicate.
- Designing scalable backend architecture.
- Implementing authentication and authorization correctly.
- Managing asynchronous operations.
- Working with real-time communication.
- Handling errors and application logs.
- Building features from both Client and Admin perspectives.
- Improving problem-solving and independent development skills.

## 📌 Project Status

🚧 Under Development

More features, improvements, and technical challenges will be added throughout the project.

---

**Built with curiosity, persistence, and code.** 💻
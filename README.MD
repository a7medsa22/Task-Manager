# 🗂️ Task Manager API

A robust and scalable RESTful API for task management, built with **Node.js**, **Express**, and **MongoDB**. Designed for performance, security, and easy integration.

---

## 🚀 Features

- Follows RESTful API best practices
- MongoDB integration with Mongoose
- Request rate limiting (to prevent abuse)
- Centralized and global error handling
- Interactive API documentation with Swagger UI
- Request logging with Morgan
- Security headers with Helmet
- Cross-Origin Resource Sharing (CORS) enabled
- Configurable via environment variables

---

## 📌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/api/v1/tasks`         | Get all tasks |
| `POST`   | `/api/v1/tasks`         | Create a new task |
| `GET`    | `/api/v1/tasks/:id`     | Get a specific task by ID |
| `PATCH`  | `/api/v1/tasks/:id`     | Update a task |
| `DELETE` | `/api/v1/tasks/:id`     | Delete a task |

---

## 🧰 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**

---

## ⚙️ Configuration

Create a `.env` or `config.env` file in the root directory with the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development

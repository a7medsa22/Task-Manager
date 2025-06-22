# Task Manager API

A robust RESTful API for task management, built with Node.js, Express, and MongoDB.

## Features

- RESTful API design following best practices
- MongoDB database integration
- Request rate limiting for security
- Comprehensive error handling
- API documentation with Swagger
- Request logging
- Security headers with Helmet
- CORS enabled
- Environment variable configuration

## API Endpoints


| GET | `/api/v1/tasks` | Get all tasks |
| POST | `/api/v1/tasks` | Create a new task |
| GET | `/api/v1/tasks/:id` | Get a specific task |
| PATCH | `/api/v1/tasks/:id` | Update a task |
| DELETE | `/api/v1/tasks/:id` | Delete a task |

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

3. Create a `config.env` file in the root directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development    
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running. This documentation is powered by Swagger UI and provides detailed information about all available endpoints, request/response formats, and example requests.

## Security

- Rate limiting: 100 requests per 15 minutes per IP
- Security headers with Helmet
- CORS configuration
- Environment variable protection

## License

ISC

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { setup, teardown, clearDatabase } = require('./setup');
const tasksRouter = require('../routes/tasks');
const Task = require('../models/Task');
const errorHandlerMiddleware = require('../middleware/error-handler');
const notFound = require('../middleware/not-found');

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/tasks', tasksRouter);
app.use(notFound);
app.use(errorHandlerMiddleware);

beforeAll(async () => {
  await setup();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await teardown();
});

describe('Task API', () => {
  describe('POST /api/v1/tasks', () => {
    it('should create a new task with all fields', async () => {
      const newTask = {
        name: 'Test Task Full',
        description: 'Test Description',
        priority: 'high',
        dueDate: '2024-12-31T00:00:00.000Z',
        completed: false,
      };
      const res = await request(app).post('/api/v1/tasks').send(newTask);
      expect(res.statusCode).toEqual(201);
      expect(res.body.task).toHaveProperty('_id');
      expect(res.body.task.name).toBe(newTask.name);
      expect(res.body.task.description).toBe(newTask.description);
      expect(res.body.task.priority).toBe(newTask.priority);
      expect(new Date(res.body.task.dueDate).toISOString()).toBe(newTask.dueDate);
      expect(res.body.task.completed).toBe(newTask.completed);
    });

    it('should create a new task with only required name field', async () => {
      const newTask = { name: 'Test Task Minimal' };
      const res = await request(app).post('/api/v1/tasks').send(newTask);
      expect(res.statusCode).toEqual(201);
      expect(res.body.task.name).toBe(newTask.name);
      expect(res.body.task.completed).toBe(false); // Default value
      expect(res.body.task.priority).toBe('medium'); // Default value
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app).post('/api/v1/tasks').send({ description: 'Missing name' });
      expect(res.statusCode).toEqual(400); // Or whatever error status your validator returns
    });
     it('should return 400 if name is too long', async () => {
      const res = await request(app).post('/api/v1/tasks').send({ name: 'This name is definitely way too long to be accepted' });
      expect(res.statusCode).toEqual(400);
    });
     it('should return 400 if description is too long', async () => {
      const res = await request(app).post('/api/v1/tasks').send({ name: 'Test', description: 'This description is definitely way too long to be accepted by the validator as it exceeds the maximum length of one hundred characters' });
      expect(res.statusCode).toEqual(400);
    });
    it('should return 400 if priority is invalid', async () => {
      const res = await request(app).post('/api/v1/tasks').send({ name: 'Test', priority: 'urgent' });
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/v1/tasks', () => {
    beforeEach(async () => {
      const tasks = [
        { name: 'Task 1', completed: true, priority: 'low', dueDate: new Date('2024-01-01') },
        { name: 'Task 2', completed: false, priority: 'high', dueDate: new Date('2024-01-03') },
        { name: 'Task 3', completed: true, priority: 'medium', dueDate: new Date('2024-01-02') },
      ];
      await Task.insertMany(tasks);
    });

    it('should return all tasks', async () => {
      const res = await request(app).get('/api/v1/tasks');
      expect(res.statusCode).toEqual(200);
      expect(res.body.tasks.length).toBe(3);
      expect(res.body.count).toBe(3);
    });

    it('should filter tasks by completed=true', async () => {
      const res = await request(app).get('/api/v1/tasks?completed=true');
      expect(res.statusCode).toEqual(200);
      expect(res.body.tasks.length).toBe(2);
      res.body.tasks.forEach(task => expect(task.completed).toBe(true));
    });

    it('should filter tasks by completed=false', async () => {
      const res = await request(app).get('/api/v1/tasks?completed=false');
      expect(res.statusCode).toEqual(200);
      expect(res.body.tasks.length).toBe(1);
      res.body.tasks.forEach(task => expect(task.completed).toBe(false));
    });

    it('should filter tasks by priority=high', async () => {
      const res = await request(app).get('/api/v1/tasks?priority=high');
      expect(res.statusCode).toEqual(200);
      expect(res.body.tasks.length).toBe(1);
      expect(res.body.tasks[0].priority).toBe('high');
    });

    it('should sort tasks by dueDate ascending', async () => {
      const res = await request(app).get('/api/v1/tasks?sortBy=dueDate&order=asc');
      expect(res.statusCode).toEqual(200);
      expect(res.body.tasks.length).toBe(3);
      expect(new Date(res.body.tasks[0].dueDate).getTime()).toBeLessThanOrEqual(new Date(res.body.tasks[1].dueDate).getTime());
      expect(new Date(res.body.tasks[1].dueDate).getTime()).toBeLessThanOrEqual(new Date(res.body.tasks[2].dueDate).getTime());
    });

    it('should sort tasks by dueDate descending', async () => {
        const res = await request(app).get('/api/v1/tasks?sortBy=dueDate&order=desc');
        expect(res.statusCode).toEqual(200);
        expect(res.body.tasks.length).toBe(3);
        expect(new Date(res.body.tasks[0].dueDate).getTime()).toBeGreaterThanOrEqual(new Date(res.body.tasks[1].dueDate).getTime());
        expect(new Date(res.body.tasks[1].dueDate).getTime()).toBeGreaterThanOrEqual(new Date(res.body.tasks[2].dueDate).getTime());
    });

    it('should sort tasks by priority (default asc - low, medium, high)', async () => {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        const res = await request(app).get('/api/v1/tasks?sortBy=priority'); // asc is default
        expect(res.statusCode).toEqual(200);
        expect(res.body.tasks.length).toBe(3);
        expect(priorityOrder[res.body.tasks[0].priority]).toBeLessThanOrEqual(priorityOrder[res.body.tasks[1].priority]);
        expect(priorityOrder[res.body.tasks[1].priority]).toBeLessThanOrEqual(priorityOrder[res.body.tasks[2].priority]);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should return a specific task', async () => {
      const task = await Task.create({ name: 'Specific Task', description: 'Details' });
      const res = await request(app).get(`/api/v1/tasks/${task._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.task.name).toBe('Specific Task');
      expect(res.body.task.description).toBe('Details');
    });

    it('should return 404 if task not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/tasks/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PATCH /api/v1/tasks/:id', () => {
    it('should update a task successfully', async () => {
      const task = await Task.create({ name: 'Old Name', priority: 'low' });
      const updates = { name: 'New Name', priority: 'high', completed: true, description: "Updated Desc" };
      const res = await request(app).patch(`/api/v1/tasks/${task._id}`).send(updates);
      expect(res.statusCode).toEqual(200);
      expect(res.body.task.name).toBe(updates.name);
      expect(res.body.task.priority).toBe(updates.priority);
      expect(res.body.task.completed).toBe(updates.completed);
      expect(res.body.task.description).toBe(updates.description);
    });

    it('should return 404 if task to update not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).patch(`/api/v1/tasks/${nonExistentId}`).send({ name: 'Update Fail' });
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for invalid update data (e.g. name too long)', async () => {
      const task = await Task.create({ name: 'Valid Task' });
      const res = await request(app).patch(`/api/v1/tasks/${task._id}`).send({ name: 'This name is far too long for the validation rules' });
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete a task successfully', async () => {
      const task = await Task.create({ name: 'To Be Deleted' });
      const res = await request(app).delete(`/api/v1/tasks/${task._id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.task._id).toBe(task._id.toString());

      const findRes = await request(app).get(`/api/v1/tasks/${task._id}`);
      expect(findRes.statusCode).toEqual(404);
    });

    it('should return 404 if task to delete not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/v1/tasks/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
    });
  });
});

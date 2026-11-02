import { Router } from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
} from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema
} from '../validators/task.validator.js';

const router = Router();

// Protect all task endpoints with authentication middleware
router.use(authenticate);

router.post('/', validateBody(createTaskSchema), createTask);
router.get('/', getAllTasks);
router.get('/:id', validateParams(taskIdParamSchema), getTaskById);
router.put('/:id', validateParams(taskIdParamSchema), validateBody(updateTaskSchema), updateTask);
router.delete('/:id', validateParams(taskIdParamSchema), deleteTask);

export default router;

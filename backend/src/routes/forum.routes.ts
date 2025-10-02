import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as forumController from '../controllers/forum.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.get('/categories', forumController.getCategories);

router.get(
  '/categories/:categorySlug/threads',
  [
    param('categorySlug').trim().notEmpty().withMessage('Category slug is required'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sortBy')
      .optional()
      .isIn(['latest', 'mostViewed', 'newest', 'mostReplies'])
      .withMessage('Invalid sort option'),
  ],
  validate,
  forumController.getThreadsByCategory
);

router.get(
  '/threads/:threadSlug',
  [
    param('threadSlug').trim().notEmpty().withMessage('Thread slug is required'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validate,
  forumController.getThreadBySlug
);

router.post(
  '/threads',
  authenticate,
  [
    body('categorySlug').trim().notEmpty().withMessage('Category slug is required'),
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    body('content')
      .trim()
      .isLength({ min: 20 })
      .withMessage('Content must be at least 20 characters'),
  ],
  validate,
  forumController.createThread
);

router.patch(
  '/threads/:threadId',
  authenticate,
  [
    param('threadId').isUUID().withMessage('Invalid thread ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 20 })
      .withMessage('Content must be at least 20 characters'),
  ],
  validate,
  forumController.updateThread
);

router.delete(
  '/threads/:threadId',
  authenticate,
  [param('threadId').isUUID().withMessage('Invalid thread ID')],
  validate,
  forumController.deleteThread
);

router.post(
  '/threads/:threadId/posts',
  authenticate,
  [
    param('threadId').isUUID().withMessage('Invalid thread ID'),
    body('content')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Content is required'),
  ],
  validate,
  forumController.createPost
);

router.patch(
  '/posts/:postId',
  authenticate,
  [
    param('postId').isUUID().withMessage('Invalid post ID'),
    body('content')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Content is required'),
  ],
  validate,
  forumController.updatePost
);

router.delete(
  '/posts/:postId',
  authenticate,
  [param('postId').isUUID().withMessage('Invalid post ID')],
  validate,
  forumController.deletePost
);

router.patch(
  '/threads/:threadId/pin',
  authenticate,
  requireAdmin,
  [param('threadId').isUUID().withMessage('Invalid thread ID')],
  validate,
  forumController.togglePinThread
);

router.patch(
  '/threads/:threadId/lock',
  authenticate,
  requireAdmin,
  [param('threadId').isUUID().withMessage('Invalid thread ID')],
  validate,
  forumController.toggleLockThread
);

export default router;
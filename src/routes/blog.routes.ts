
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    getAllBlogs,
    getBlogById,
    getBlogBySlug,
    createBlog,
    updateBlog,
    deleteBlog,
    uploadBlogImage
} from '../controllers/blog.controller.js';

import { protect, restrictTo } from '../middleware/rbac.middleware.js';

const router = express.Router();
router.use(protect);

// Multer configuration for blog images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isVercel = !!process.env.VERCEL;
        const dir = isVercel ? path.join('/tmp', 'uploads', 'blogs') : 'uploads/blogs';

        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir, { recursive: true });
            } catch (err) {
                console.error('Error creating directory:', err);
                return cb(null, '/tmp');
            }
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/', getAllBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);

// Protected routes
router.post('/', restrictTo('Super Admin', 'Manager'), createBlog);
router.put('/:id', restrictTo('Super Admin', 'Manager'), updateBlog);
router.delete('/:id', restrictTo('Super Admin', 'Manager'), deleteBlog);
router.post('/blog-image', restrictTo('Super Admin', 'Manager'), upload.single('image'), uploadBlogImage);

export default router;

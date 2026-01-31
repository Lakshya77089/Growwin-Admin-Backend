
import type { Request, Response } from 'express';
import BlogModel from '../models/blog.model.js';
import { createAuditLog } from '../utils/auditLogger.js';

export const getAllBlogs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;
        const status = req.query.status as string;
        const category = req.query.category as string;
        const tag = req.query.tag as string;

        let query: any = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        } else if (req.query.client) {
            // Default for non-admin requests
            query.status = 'published';
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        if (tag) {
            query.tags = tag;
        }

        const total = await BlogModel.countDocuments(query);
        const blogs = await BlogModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            count: blogs.length,
            total,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            data: blogs
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getBlogBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({ success: false, error: 'Slug is required' });
        }
        const blog = await BlogModel.findOne({ slug: slug as string }).lean();

        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog post not found' });
        }

        res.status(200).json({ success: true, data: blog });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getBlogById = async (req: Request, res: Response) => {
    try {
        const blog = await BlogModel.findById(req.params.id).lean();
        if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
        res.status(200).json({ success: true, data: blog });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createBlog = async (req: any, res: Response) => {
    try {
        const blogData = req.body;

        if (!blogData.slug && blogData.title) {
            blogData.slug = blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }

        const blog = await BlogModel.create(blogData);
        await createAuditLog(req, 'CREATE', 'Blog', `Created blog post: ${blog.title}`, blog._id.toString(), null, undefined, null, blog);
        res.status(201).json({ success: true, data: blog });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'Slug already exists' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateBlog = async (req: any, res: Response) => {
    try {
        const oldData = await BlogModel.findById(req.params.id).lean();
        const blog = await BlogModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
        await createAuditLog(req, 'UPDATE', 'Blog', `Updated blog post: ${blog.title}`, blog._id.toString(), null, undefined, oldData, blog);
        res.status(200).json({ success: true, data: blog });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteBlog = async (req: any, res: Response) => {
    try {
        const oldData = await BlogModel.findById(req.params.id).lean();
        const blog = await BlogModel.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
        await createAuditLog(req, 'DELETE', 'Blog', `Deleted blog post: ${blog.title}`, blog._id.toString(), null, undefined, oldData, null);
        res.status(200).json({ success: true, data: {} });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const uploadBlogImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image uploaded' });
        }

        const protocol = req.protocol;
        const host = req.get('host');
        const imageUrl = `${protocol}://${host}/uploads/blogs/${req.file.filename}`;

        res.status(200).json({
            success: true,
            data: {
                filename: req.file.filename,
                url: imageUrl
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

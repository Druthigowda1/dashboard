const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid token" });
    }
};

router.post('/', authenticate, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Admin only" });

    const { title, description, assignedToId, taskDate } = req.body;
    try {
        const task = await prisma.task.create({
            data: {
                title,
                description,
                assignedToId: Number(assignedToId),
                taskDate: taskDate ? new Date(taskDate) : new Date()
            }
        });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const { date } = req.query;
        let whereClause = {};

        // Date filtering logic
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            whereClause.taskDate = {
                gte: startOfDay,
                lte: endOfDay
            };
        }

        if (req.user.role === 'ADMIN') {
            const tasks = await prisma.task.findMany({
                where: whereClause,
                include: { assignedTo: true }
            });
            res.json(tasks);
        } else {
            whereClause.assignedToId = req.user.id;
            const tasks = await prisma.task.findMany({ where: whereClause });
            res.json(tasks);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { status, submission } = req.body;
    try {
        const task = await prisma.task.findUnique({ where: { id: Number(id) } });
        if (!task) return res.status(404).json({ error: "Task not found" });

        if (req.user.role !== 'ADMIN' && task.assignedToId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const updated = await prisma.task.update({
            where: { id: Number(id) },
            data: { status, submission }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/users', authenticate, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Admin only" });
    try {
        const users = await prisma.user.findMany({ where: { role: 'EMPLOYEE' } });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

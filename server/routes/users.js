const express = require('express');
const router = express.Router();
const prisma = require('../db');
const jwt = require('jsonwebtoken');

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

// Delete user (and their tasks)
router.delete('/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Admin only" });
    const { id } = req.params;

    try {
        // Delete tasks assigned to this user first (optional if using Cascade in DB, but good for safety)
        await prisma.task.deleteMany({ where: { assignedToId: Number(id) } });

        // Delete user
        await prisma.user.delete({ where: { id: Number(id) } });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user
router.patch('/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Admin only" });
    const { id } = req.params;
    const { username, password } = req.body;

    try {
        const updateData = {};
        if (username) updateData.username = username;
        if (password) {
            const bcrypt = require('bcryptjs');
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: updateData
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

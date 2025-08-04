// routes/taskRoutes.js
const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController');

// สร้าง task ใหม่
router.post('/', taskController.createTask);

// ดู task ทั้งหมด
router.get('/', taskController.getAllTasks);

// แก้ไข task ตาม id
router.put('/:id', taskController.updateTask);

// ลบ task ตาม id
router.delete('/:id', taskController.deleteTask);

// toggle completed ตาม id
router.patch('/:id/toggle' , taskController.patchTask)

module.exports = router;

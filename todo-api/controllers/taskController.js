const Task = require('../models/taskModel');

// ✅ GET: ดู tasks ทั้งหมด
exports.getAllTasks = async (req, res) => {
  try {
    //const tasks = await Task.find().sort({ customId: 1 }); // เรียงตาม customId
     const { completed, search, sortBy, order } = req.query;

    // สร้าง filter object
    const filter = {};

    // ✅ Filter: completed (true/false)
    if (completed === 'true') filter.completed = true;
    if (completed === 'false') filter.completed = false;

    // ✅ Filter: search by title
    if (search) {
      filter.title = { $regex: search, $options: 'i' }; // case-insensitive
    }

    // ✅ Sort
    const sortField = sortBy || 'customId';     // default = customId
    const sortOrder = order === 'desc' ? -1 : 1; // default = asc

    const tasks = await Task.find(filter).sort({ [sortField]: sortOrder });

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ POST: สร้าง task ใหม่
exports.createTask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // ตรวจสอบ customId ล่าสุด
    const lastTask = await Task.findOne().sort({ customId: -1 });

    const lastCustomId = lastTask?.customId;

    // ป้องกัน NaN
    const newId = typeof lastCustomId === 'number' && !isNaN(lastCustomId)
      ? lastCustomId + 1
      : 1;

    const newTask = await Task.create({ title, customId: newId });

    res.status(201).json(newTask);
  } catch (err) {
    console.log("req.body", req.body);
    res.status(400).json({ error: err.message });
  }
};


// ✅ PUT: แก้ไข task (ใช้ customId)
exports.updateTask = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'customId ต้องเป็นตัวเลข' });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { customId: id },
      req.body,
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ DELETE: ลบ task (ใช้ customId)
exports.deleteTask = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'customId ต้องเป็นตัวเลข' });
    }

    const deletedTask = await Task.findOneAndDelete({ customId: id });

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.patchTask = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'customId ต้องเป็นตัวเลข' });
    }

    const task = await Task.findOne({ customId: id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // toggle completed
    task.completed = !task.completed;
    await task.save();

    res.status(200).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

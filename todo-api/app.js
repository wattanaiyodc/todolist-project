// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// โหลดค่าจากไฟล์ .env
dotenv.config();

const app = express();
const cors = require('cors');
app.use(cors());

// ให้ Express รับข้อมูล JSON จาก body ได้
app.use(express.json());
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);


// เชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // เริ่ม server ที่ port 3000
    app.listen(3000, () => {
      console.log('🚀 Server running on http://localhost:3000');
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// หน้าแรก
app.get('/', (req, res) => {
  res.send('🎉 To-do API is running!');
});

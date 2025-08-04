"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

// TypeScript interfaces
interface Task {
  id: string;
  customId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface NewTaskInput {
  title: string;
  customId?: string;
}

interface UpdateTaskInput {
  title?: string;
  completed?: boolean;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// API Functions
const api = {
  // 1. Get all tasks
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // 2. Post new task
  postTask: async (task: NewTaskInput): Promise<Task> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // 3. Put (update) task by customId
  putTaskByCustomId: async (customId: string, updatedTask: UpdateTaskInput): Promise<Task> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${customId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // 4. Delete task by customId
  deleteTaskByCustomId: async (customId: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${customId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // 5. Toggle completed by customId (แก้ไขแล้ว)
  toggleCompletedByCustomId: async (customId: string): Promise<Task> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${customId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  }
};

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      const tasksData = await api.getTasks();
      setTasks(tasksData);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (): Promise<void> => {
    if (!newTaskTitle.trim()) return;

    try {
      setLoading(true);
      const newTask = await api.postTask({
        title: newTaskTitle,
        customId: `task-${Date.now()}`
      });
      setTasks(prev => [...prev, newTask]);
      setNewTaskTitle('');
      setError('');
    } catch (err) {
      setError('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (customId: string, updatedData: UpdateTaskInput): Promise<void> => {
    try {
      setLoading(true);
      const updatedTask = await api.putTaskByCustomId(customId, updatedData);
      setTasks(prev => prev.map((task: Task) => 
        task.customId === customId ? updatedTask : task
      ));
      setEditingTask(null);
      setError('');
    } catch (err) {
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (customId: string): Promise<void> => {
    try {
      setLoading(true);
      await api.deleteTaskByCustomId(customId);
      setTasks(prev => prev.filter((task: Task) => task.customId !== customId));
      setError('');
    } catch (err) {
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  // แก้ไขฟังก์ชัน handleToggleComplete ให้ใช้ customId
  const handleToggleComplete = async (customId: string): Promise<void> => {
    try {
      const updatedTask = await api.toggleCompletedByCustomId(customId);
      setTasks(prev => prev.map((task: Task) => 
        task.customId === customId ? updatedTask : task
      ));
      setError('');
    } catch (err) {
      setError('Failed to toggle task completion');
    }
  };

  const startEditing = (task: Task): void => {
    setEditingTask(task.customId);
    setEditTitle(task.title);
  };

  const cancelEditing = (): void => {
    setEditingTask(null);
    setEditTitle('');
  };

  const saveEdit = async (customId: string): Promise<void> => {
    if (!editTitle.trim()) return;
    await handleUpdateTask(customId, { title: editTitle });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
        <h1 className="text-3xl font-bold mb-2">Todo List</h1>
        <p className="opacity-90">จัดการงานของคุณอย่างมีประสิทธิภาพ</p>
      </div>

      {/* Add New Task */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="เพิ่มงานใหม่..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newTaskTitle.trim()) {
                handleAddTask();
              }
            }}
          />
          <button
            onClick={handleAddTask}
            disabled={loading || !newTaskTitle.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            เพิ่ม
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            <p>ยังไม่มีงานในรายการ</p>
            <p className="text-sm">เพิ่มงานใหม่เพื่อเริ่มต้น</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 border rounded-lg transition-all ${
                task.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Complete Toggle - แก้ไขให้ใช้ customId */}
                <button
                  onClick={() => handleToggleComplete(task.customId)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {task.completed && <Check size={14} />}
                </button>

                {/* Task Content */}
                <div className="flex-1">
                  {editingTask === task.customId ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            saveEdit(task.customId);
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(task.customId)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className={`font-medium ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}>
                        {task.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        ID: {task.customId} | Created: {new Date(task.createdAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {editingTask !== task.customId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(task)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="แก้ไข"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.customId)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="ลบ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {tasks.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm text-gray-600">
            <span>งานทั้งหมด: {tasks.length}</span>
            <span>เสร็จแล้ว: {tasks.filter(task => task.completed).length}</span>
            <span>เหลือ: {tasks.filter(task => !task.completed).length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
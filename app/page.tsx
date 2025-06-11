"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Filter, CheckCircle2, Clock, AlertCircle, Target } from "lucide-react"

// Types
interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "todo" | "progress" | "done"
  createdAt: string
  updatedAt: string
}

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9)

const saveTasksToLocalStorage = (tasks: Task[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }
}

const getTasksFromLocalStorage = (): Task[] => {
  if (typeof window !== "undefined") {
    const tasks = localStorage.getItem("tasks")
    return tasks ? JSON.parse(tasks) : []
  }
  return []
}

// Components
const StatsCard = ({ icon: Icon, title, count, color }: { icon: any; title: string; count: number; color: string }) => {
  return (
    <Card className={`relative overflow-hidden border shadow-sm ${color}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{count}</p>
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  )
}

const TaskForm = ({
  addTask,
  editingTask,
  updateTask,
  cancelEdit,
}: {
  addTask: (task: Task) => void
  editingTask: Task | null
  updateTask: (task: Task) => void
  cancelEdit: () => void
}) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [status, setStatus] = useState<"todo" | "progress" | "done">("todo")

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description)
      setPriority(editingTask.priority)
      setStatus(editingTask.status)
    } else {
      resetForm()
    }
  }, [editingTask])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setPriority("medium")
    setStatus("todo")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const task: Task = {
      title,
      description,
      priority,
      status,
      id: editingTask ? editingTask.id : generateId(),
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingTask) {
      updateTask(task)
    } else {
      addTask(task)
    }

    resetForm()
  }

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
          {editingTask ? <Edit className="h-5 w-5 text-gray-600" /> : <Plus className="h-5 w-5 text-gray-600" />}
          {editingTask ? "Edit Task" : "Create New Task"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
              Task Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
              className="border focus:border-gray-500 transition-colors duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your task..."
              rows={4}
              className="border focus:border-gray-500 transition-colors duration-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">
                Priority Level
              </Label>
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                <SelectTrigger className="border focus:border-gray-500">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                Current Status
              </Label>
              <Select value={status} onValueChange={(value: "todo" | "progress" | "done") => setStatus(value)}>
                <SelectTrigger className="border focus:border-gray-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            {editingTask && (
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                className="border hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className={`${editingTask ? "" : "ml-auto"} bg-black hover:bg-gray-800 text-white font-semibold px-8 py-2 rounded-md transition-all duration-200`}
            >
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

const TaskItem = ({
  task,
  deleteTask,
  startEdit,
}: {
  task: Task
  deleteTask: (id: string) => void
  startEdit: (task: Task) => void
}) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          color: "bg-red-500",
          textColor: "text-red-600",
          border: "border-l-red-500",
        }
      case "medium":
        return {
          color: "bg-orange-500",
          textColor: "text-orange-600",
          border: "border-l-orange-500",
        }
      case "low":
        return {
          color: "bg-green-500",
          textColor: "text-green-600",
          border: "border-l-green-500",
        }
      default:
        return {
          color: "bg-gray-500",
          textColor: "text-gray-600",
          border: "border-l-gray-500",
        }
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "done":
        return {
          color: "bg-green-500",
          textColor: "text-green-600",
          text: "Done",
        }
      case "progress":
        return {
          color: "bg-blue-500",
          textColor: "text-blue-600",
          text: "In Progress",
        }
      case "todo":
        return {
          color: "bg-gray-500",
          textColor: "text-gray-600",
          text: "To Do",
        }
      default:
        return {
          color: "bg-gray-500",
          textColor: "text-gray-600",
          text: status,
        }
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const priorityConfig = getPriorityConfig(task.priority)
  const statusConfig = getStatusConfig(task.status)

  return (
    <Card
      className={`w-full border-l-4 ${priorityConfig.border} shadow-sm hover:shadow transition-shadow duration-300`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">{task.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${priorityConfig.color} text-white`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
              <Badge className={`${statusConfig.color} text-white`}>{statusConfig.text}</Badge>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => startEdit(task)}
              className="h-9 w-9 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              <Edit className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTask(task.id)}
              className="h-9 w-9 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>

        <p className="text-gray-600 mb-4 leading-relaxed text-sm">{task.description || "No description provided."}</p>

        <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <span className="font-medium">Created:</span> {formatDate(task.createdAt)}
          </div>
          {task.updatedAt !== task.createdAt && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Updated:</span> {formatDate(task.updatedAt)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const TaskList = ({
  tasks,
  deleteTask,
  startEdit,
  filterStatus,
  filterPriority,
  setFilterStatus,
  setFilterPriority,
}: {
  tasks: Task[]
  deleteTask: (id: string) => void
  startEdit: (task: Task) => void
  filterStatus: string
  filterPriority: string
  setFilterStatus: (status: string) => void
  setFilterPriority: (priority: string) => void
}) => {
  // Apply filters
  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority
    return statusMatch && priorityMatch
  })

  // Sort tasks: first by status (todo -> progress -> done), then by priority (high -> medium -> low)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const statusOrder = { todo: 0, progress: 1, done: 2 }
    const priorityOrder = { high: 0, medium: 1, low: 2 }

    if (a.status !== b.status) {
      return statusOrder[a.status] - statusOrder[b.status]
    }

    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Calculate stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    progress: tasks.filter((t) => t.status === "progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Target} title="Total Tasks" count={stats.total} color="border-gray-200" />
        <StatsCard icon={Clock} title="To Do" count={stats.todo} color="border-gray-200" />
        <StatsCard icon={AlertCircle} title="In Progress" count={stats.progress} color="border-gray-200" />
        <StatsCard icon={CheckCircle2} title="Done" count={stats.done} color="border-gray-200" />
      </div>

      {/* Filters */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <Filter className="h-5 w-5 text-gray-600" />
            Filter Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Status Filter:</Label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "all", label: "All Tasks" },
                  { value: "todo", label: "To Do" },
                  { value: "progress", label: "In Progress" },
                  { value: "done", label: "Done" },
                ].map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={filterStatus === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(value)}
                    className={`transition-all duration-200 ${
                      filterStatus === value ? "bg-black text-white" : "hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Priority Filter:</Label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "all", label: "All Priorities", color: "bg-gray-500" },
                  { value: "high", label: "High", color: "bg-red-500" },
                  { value: "medium", label: "Medium", color: "bg-orange-500" },
                  { value: "low", label: "Low", color: "bg-green-500" },
                ].map(({ value, label, color }) => (
                  <Button
                    key={value}
                    variant={filterPriority === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterPriority(value)}
                    className={`transition-all duration-200 ${
                      filterPriority === value ? "bg-black text-white" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${color}`}></span>
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">
          Showing {filteredTasks.length} of {tasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
        </p>
      </div>

      {/* Task list */}
      {sortedTasks.length > 0 ? (
        <div className="grid gap-4">
          {sortedTasks.map((task) => (
            <TaskItem key={task.id} task={task} deleteTask={deleteTask} startEdit={startEdit} />
          ))}
        </div>
      ) : (
        <Card className="border shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Target className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">No tasks found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {tasks.length === 0
                ? "Start by creating your first task to get organized!"
                : "Try adjusting your filters to see more tasks."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Main App Component
export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")

  // Load tasks from localStorage on initial render
  useEffect(() => {
    setTasks(getTasksFromLocalStorage())
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    saveTasksToLocalStorage(tasks)
  }, [tasks])

  const addTask = (task: Task) => {
    setTasks([...tasks, task])
  }

  const deleteTask = (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter((task) => task.id !== id))
    }
  }

  const startEdit = (task: Task) => {
    setEditingTask(task)
  }

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setEditingTask(null)
  }

  const cancelEdit = () => {
    setEditingTask(null)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Task Manager</h1>
            <p className="text-gray-600 text-lg">Organize your tasks efficiently</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Task Form */}
          <div className="xl:col-span-1">
            <TaskForm addTask={addTask} editingTask={editingTask} updateTask={updateTask} cancelEdit={cancelEdit} />
          </div>

          {/* Task List */}
          <div className="xl:col-span-2">
            <TaskList
              tasks={tasks}
              deleteTask={deleteTask}
              startEdit={startEdit}
              filterStatus={filterStatus}
              filterPriority={filterPriority}
              setFilterStatus={setFilterStatus}
              setFilterPriority={setFilterPriority}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

"use client"

import React from "react"

// Task Manager App
const { useState, useEffect } = React
const ReactDOM = window.ReactDOM // Declare the ReactDOM variable

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9)

const saveTasksToLocalStorage = (tasks) => {
  localStorage.setItem("tasks", JSON.stringify(tasks))
}

const getTasksFromLocalStorage = () => {
  const tasks = localStorage.getItem("tasks")
  return tasks ? JSON.parse(tasks) : []
}

const saveThemeToLocalStorage = (theme) => {
  localStorage.setItem("theme", theme)
}

const getThemeFromLocalStorage = () => {
  return localStorage.getItem("theme") || "light"
}

// Components
const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    ></button>
  )
}

const TaskForm = ({ addTask, editingTask, updateTask, cancelEdit }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [status, setStatus] = useState("todo")

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

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title.trim()) return

    const task = {
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
    <div className="task-form">
      <h2 className="form-title">{editingTask ? "Edit Task" : "Add New Task"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows="4"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            className="form-control select-control"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            className="form-control select-control"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="todo">To Do</option>
            <option value="progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="form-footer">
          {editingTask && (
            <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" style={{ marginLeft: editingTask ? "8px" : "auto" }}>
            {editingTask ? "Update Task" : "Add Task"}
          </button>
        </div>
      </form>
    </div>
  )
}

const TaskItem = ({ task, deleteTask, startEdit }) => {
  const priorityClass = `priority-${task.priority}`
  const statusClass = `status-${task.status}`

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="task-item">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button className="task-btn" onClick={() => startEdit(task)} aria-label="Edit task">
            ✏️
          </button>
          <button className="task-btn" onClick={() => deleteTask(task.id)} aria-label="Delete task">
            🗑️
          </button>
        </div>
      </div>

      <p className="task-description">{task.description || "No description provided."}</p>

      <div className="task-meta">
        <span className={`task-badge ${priorityClass}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <span className={`task-badge ${statusClass}`}>
          {task.status === "todo" ? "To Do" : task.status === "progress" ? "In Progress" : "Done"}
        </span>
      </div>

      <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
        <div>Created: {formatDate(task.createdAt)}</div>
        {task.updatedAt !== task.createdAt && <div>Updated: {formatDate(task.updatedAt)}</div>}
      </div>
    </div>
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

  return (
    <div>
      <div className="filters">
        <div>
          <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>Status:</p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterStatus === "todo" ? "active" : ""}`}
              onClick={() => setFilterStatus("todo")}
            >
              To Do
            </button>
            <button
              className={`filter-btn ${filterStatus === "progress" ? "active" : ""}`}
              onClick={() => setFilterStatus("progress")}
            >
              In Progress
            </button>
            <button
              className={`filter-btn ${filterStatus === "done" ? "active" : ""}`}
              onClick={() => setFilterStatus("done")}
            >
              Done
            </button>
          </div>
        </div>

        <div>
          <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>Priority:</p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className={`filter-btn ${filterPriority === "all" ? "active" : ""}`}
              onClick={() => setFilterPriority("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterPriority === "high" ? "active" : ""}`}
              onClick={() => setFilterPriority("high")}
            >
              High
            </button>
            <button
              className={`filter-btn ${filterPriority === "medium" ? "active" : ""}`}
              onClick={() => setFilterPriority("medium")}
            >
              Medium
            </button>
            <button
              className={`filter-btn ${filterPriority === "low" ? "active" : ""}`}
              onClick={() => setFilterPriority("low")}
            >
              Low
            </button>
          </div>
        </div>
      </div>

      <p className="task-count">
        {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"} found
      </p>

      {sortedTasks.length > 0 ? (
        <div className="task-list">
          {sortedTasks.map((task) => (
            <TaskItem key={task.id} task={task} deleteTask={deleteTask} startEdit={startEdit} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p>Add a new task or change your filters to see tasks here.</p>
        </div>
      )}
    </div>
  )
}

const App = () => {
  const [tasks, setTasks] = useState([])
  const [editingTask, setEditingTask] = useState(null)
  const [theme, setTheme] = useState("light")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")

  // Load tasks and theme from localStorage on initial render
  useEffect(() => {
    setTasks(getTasksFromLocalStorage())
    const savedTheme = getThemeFromLocalStorage()
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    saveTasksToLocalStorage(tasks)
  }, [tasks])

  const addTask = (task) => {
    setTasks([...tasks, task])
  }

  const deleteTask = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter((task) => task.id !== id))
    }
  }

  const startEdit = (task) => {
    setEditingTask(task)
    // On mobile, scroll to the form
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const updateTask = (updatedTask) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setEditingTask(null)
  }

  const cancelEdit = () => {
    setEditingTask(null)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
    saveThemeToLocalStorage(newTheme)
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Task Manager</h1>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>

      <main className="main">
        <TaskForm addTask={addTask} editingTask={editingTask} updateTask={updateTask} cancelEdit={cancelEdit} />

        <TaskList
          tasks={tasks}
          deleteTask={deleteTask}
          startEdit={startEdit}
          filterStatus={filterStatus}
          filterPriority={filterPriority}
          setFilterStatus={setFilterStatus}
          setFilterPriority={setFilterPriority}
        />
      </main>
    </div>
  )
}

// Render the App
ReactDOM.render(<App />, document.getElementById("root"))

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use(express.json());

// Serve static files
app.use('/icons', express.static(path.join(__dirname, 'icons')));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/todoDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB!--> http://localhost:3000");
}).catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
});

// Set up EJS as the templating engine
app.set("view engine", "ejs");

// Define schema directly in app.js
const taskSchema = new mongoose.Schema({
  todo: String,
  notes: String,
  focus: String,
  isDone: { type: Boolean, default: false }  // Add isDone field to track completion status
});

// Create model directly in app.js
const Task = mongoose.model("Task", taskSchema);

// Route to toggle task status
app.put('/tasks/:id/toggleStatus', async (req, res) => {
  try {
    const taskId = req.params.id;
    const newStatus = req.body.isDone;

    // Update the task's isDone status in the database
    await Task.findByIdAndUpdate(taskId, { isDone: newStatus });

    res.sendStatus(200); // Success response
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Error response
  }
});

// **New Route for Deleting a Task**
app.delete('/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    await Task.findByIdAndDelete(taskId); // Delete task from database
    res.sendStatus(200); // Success response
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Error response
  }
});

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// Route for Home Page
app.get("/", (req, res) => {
  res.render("home");
});

// Route to display Add To-Do page
app.get("/add", (req, res) => {
  res.render("add");
});

// Route to handle form submission on Add To-Do page
app.post("/add", (req, res) => {
  const newTask = new Task({
    todo: req.body.todo,
    notes: req.body.notes,
    focus: req.body.focus
  });
  newTask.save()
    .then(() => res.redirect("/"))
    .catch((error) => console.error(error));
});

// Route to display all To-Do items
app.get("/view", async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.render("view", { tasks: tasks });
  } catch (error) {
    console.error(error);
    res.send("Error retrieving tasks");
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

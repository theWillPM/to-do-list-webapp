const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:52331',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept'
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let connection; // make connection a global variable
async function setupConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '01251999',
      database: 'todo_list'
    });
    console.log('Connected to database!');
    return connection;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

async function getUniqueTaskName(name, connection) {
  let baseName = name;
  let counter = 1;
  let unique = false;

  while (!unique) {
    unique = true;
    const [rows] = await connection.query('SELECT * FROM tasks WHERE task = ?', [name]);

    if (rows.length > 0) {
      unique = false;
      name = baseName + " (" + counter + ")";
      counter++;
    }
  }

  return name;
}


app.get('/tasks', async (req, res) => {
  try {
    const [rows, fields] = await connection.query('SELECT * FROM tasks');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting tasks from database!' });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const task = req.body.task;
    const status = req.body.status;

    const uniqueTaskName = await getUniqueTaskName(task, connection);
    
    await connection.query('INSERT INTO tasks (task, status) VALUES (?, ?)', [uniqueTaskName, status]);
    res.status(200).json({ message: 'Task added to database!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding task to database!' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const status = req.body.status;

    console.log('Received taskId:', taskId);
    console.log('Received status:', status);

    await connection.query(
      'UPDATE tasks SET status = ? WHERE task_id = ?',
      [status, taskId]
    );
    res.status(200).json({ message: 'Task status updated in database!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating task status in database!' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    await connection.query('DELETE FROM tasks WHERE task_id = ?', [taskId]);
    res.status(200).json({ message: 'Task removed from database!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error removing task from database!' });
  }
});

(async () => {
  connection = await setupConnection();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})();



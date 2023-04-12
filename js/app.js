/** 
* @name: Project - Phase 2 
* @Course Code: SODV1201 
* @class: Software Development Diploma program. 
* @author: Group 2: Adam Workie, Ely Cuaton, Jeni R Villavicencio, Joefel Cepeda, Willian P Munhoz. 
*/

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;              // this is the port the server is running on
const cors = require('cors');
const localhost = 52330;        // localhost port you used to 'go live' (client-side)

// Allow http requests connection on localhost
app.use(cors({
  origin: `http://localhost:${localhost}`, 
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept'
}));

// Body-parser functions to properly parse http response data.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Setting up our connection and executing essential queries:
let connection;
async function setupConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '01251999',
      database: 'todo_list',
      multipleStatements: true
    });
    // Queries to create the database and the tables lists and tasks:
    connection.query('CREATE DATABASE IF NOT EXISTS todo_list;');
    connection.query('USE todo_list;');
    connection.query('CREATE TABLE IF NOT EXISTS `tasks` (`task_id` int NOT NULL AUTO_INCREMENT, `task` varchar(45) DEFAULT NULL, `status` varchar(45) DEFAULT NULL, `list_id` int DEFAULT NULL, PRIMARY KEY (`task_id`))');
    connection.query('CREATE TABLE IF NOT EXISTS `lists` (`list_id` int NOT NULL AUTO_INCREMENT, `list` varchar(45) DEFAULT NULL, PRIMARY KEY (`list_id`))');
    console.log('Connected to database!');
    return connection;
  } // If a connection error occurs:
  catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

// One of our ready-to-be-implemented list functions
async function fetchSavedLists(connection) {
  const [savedLists] = await connection.query(`
    SELECT lists.list_id, lists.list, tasks.task_id, tasks.task, tasks.status
    FROM lists
    LEFT JOIN tasks ON tasks.list_id = lists.list_id
    ORDER BY lists.list_id, tasks.task_id;
  `);

  const groupedLists = savedLists.reduce((result, row) => {
    if (!result[row.list_id]) {
      result[row.list_id] = {
        list_id: row.list_id,
        list: row.list,
        tasks: [],
      };
    }

    if (row.task_id) {
      result[row.list_id].tasks.push({
        task_id: row.task_id,
        task: row.task,
        status: row.status,
      });
    }

    return result;
  }, {});

  return Object.values(groupedLists);
}

// This function prevents saving tasks with the same name, appending a counter (n) to its name.
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

// This function prevents saving lists with the same name, appending a counter (n) to its name.
async function getUniqueListName(name, connection) {
  let baseName = name;
  let counter = 1;
  let unique = false;

  while (!unique) {
    unique = true;
    const [rows] = await connection.query('SELECT * FROM lists WHERE list = ?', [name]);

    if (rows.length > 0) {
      unique = false;
      name = baseName + " (" + counter + ")";
      counter++;
    }
  }
  return name;
}

/* SELECT queries */
  // select tasks and list
  app.get('/saved-lists', async (req, res) => {
    try {
      const savedLists = await fetchSavedLists(connection);
      res.status(200).json(savedLists);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching saved lists and tasks' });
    }
  });

  // Select all tasks
  app.get('/tasks', async (req, res) => {
    try {
      const [rows, fields] = await connection.query('SELECT * FROM tasks');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error getting tasks from database!' });
    }
  });
  
  //Select task by list id
app.get('/tasksbylist/:id', async (req, res) => {
  try {
    const listId = req.params.id;
    const [rows, fields] = await connection.query('SELECT * FROM tasks WHERE list_id = ?', [listId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting tasks from database!' });
  }
});

  // Select all list
  app.get('/lists', async (req, res) => {
    try {
      const [rows, fields] = await connection.query('SELECT * FROM lists');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error getting lists from database!' });
    }
  });

  // Select list name by ID
app.get('/lists/:id', async (req, res) => {
  try {
    const listId = req.params.id;
    const [rows, fields] = await connection.query('SELECT list FROM lists WHERE list_id = ?', [listId]);
    res.json(rows[0].list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting list name from database!' });
  }
});
  

/* INSERT queries */
  // Insert task
  app.post('/tasks', async (req, res) => {
    try {
      const task = req.body.task;
      const status = req.body.status;
      const id = req.body.list_id;
      const uniqueTaskName = await getUniqueTaskName(task, connection);
  
      if(id === -1)
        await connection.query('INSERT INTO tasks (task, status) VALUES (?, ?)', [uniqueTaskName, status]);
      else
        await connection.query('INSERT INTO tasks (task, status, list_id) VALUES (?, ?, ?)', [uniqueTaskName, status, id]);
  
      const savedLists = await fetchSavedLists(connection);
      res.status(200).json({ message: 'Task added to database!', savedLists });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error adding task to database!' });
    }
  });

  // Saving a new list
  app.post('/lists', async (req, res) => {
    try {
      const list = req.body.list;
      const uniqueListName = await getUniqueListName(list, connection);
  
      const [insertResult] = await connection.query(`INSERT INTO lists(list) VALUES (?); SELECT LAST_INSERT_ID() AS list_id;`, [list]);
      const list_id = insertResult[1][0].list_id;
  
      await connection.query(`UPDATE todo_list.tasks SET list_id = ? WHERE list_id IS NULL`, [list_id]);
  
      const savedLists = await fetchSavedLists(connection);
      res.status(200).json({ message: 'List added to database!', savedLists });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error adding list to database!' });
    }
  });

  
  

/* UPDATE queries */
  // Change task status
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
  
      const savedLists = await fetchSavedLists(connection);
      res.status(200).json({ message: 'Task status updated in database!', savedLists });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating task status in database!' });
    }
  });

/* DELETE queries */
  // Delete task
  app.delete('/tasks/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      await connection.query('DELETE FROM tasks WHERE task_id = ?', [taskId]);
      await fetchSavedLists(connection);
      res.status(200).json({ message: 'Task removed from database!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error removing task from database!' });
    }
  });
  

  // Delete list
  app.delete('/lists/:id', async (req, res) => {
    try {
      const listId = req.params.id;
      if (typeof listId === 'undefined') {
        return res.status(400).json({ error: 'Missing list_id parameter' });
      }
      await connection.query(`DELETE FROM lists WHERE list_id = ?`, [listId]);
      await fetchSavedLists(connection);
      res.status(200).json({ message: 'List removed from database!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error removing List from database!' });
    }
  });
  
/* Server Status */  
(async () => {
  connection = await setupConnection();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})();


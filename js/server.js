/** 
* @name: Project - Phase 2 
* @Course Code: SODV1201 
* @class: Software Development Diploma program. 
* @author: Group 2: Adam Workie, Ely Cuaton, Jeni R Villavicencio, Joefel Cepeda, Willian P Munhoz. 
*/

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3000;              // the server will be listening on this port
const localhost = 52330;        // localhost port you used to 'go live' (client-side)

// Allow http requests connection on localhost
app.use(cors({
  origin: `http://localhost:${localhost}`, 
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept'
}));

// Body-parser functions to properly parse http response data.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Defining the sett-up our connection and executing essential queries:
let connection;
async function setupConnection() {
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '01251999',
      multipleStatements: true
    });

    // Queries to create the database and the tables lists and tasks:
    await connection.query('CREATE DATABASE IF NOT EXISTS todo_list;');
    await connection.query('USE todo_list;');
    await connection.query('CREATE TABLE IF NOT EXISTS `tasks` (`task_id` int NOT NULL AUTO_INCREMENT, `task` varchar(45) DEFAULT NULL, `status` varchar(45) DEFAULT NULL, `list_id` int DEFAULT NULL, PRIMARY KEY (`task_id`));');
    await connection.query('CREATE TABLE IF NOT EXISTS `lists` (`list_id` int NOT NULL AUTO_INCREMENT, `list` varchar(45) DEFAULT NULL, PRIMARY KEY (`list_id`));');

    console.log('Connected to database and tables created!');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

// Call setupConnection to initialize the connection and set up the tables
setupConnection();

// Obtain a list of objects with the properties {list_id, list, task_id, task, status}
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

/* DEPRECATED - leaving here for future reference.
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
} */

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
    if (listId != "null") {
      [rows, fields] = await connection.query('SELECT * FROM lists WHERE list_id = ?', [listId]);
      res.json(rows[0].list);
    }
    else {
      [rows, fields] = await connection.query('SELECT * FROM tasks WHERE list_id IS NULL');
      res.json(rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting list name from database ! /lists/:id' });
  }
});

// Select tasks by list ID
app.get('/lists/:id/tasks', async (req, res) => {
  try {
    const listId = req.params.id;
    if (listId != "null") {
      [rows, fields] = await connection.query('SELECT * FROM tasks WHERE list_id = ?', [listId]);
    }
    else {
      [rows, fields] = await connection.query('SELECT * FROM tasks WHERE list_id IS NULL', [listId]);
    }

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting tasks for the specified list from the database!' });
  }
});

app.get('/null/tasks', async (req, res) => {
  try {
    [rows, fields] = await connection.query('SELECT * FROM tasks WHERE list_id IS NULL', [listId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting tasks for the specified list from the database!' });
  }
});

/* INSERT queries */
  // Insert task
  app.post('/tasks', async (req, res) => {
    try {
      const task = req.body.task;
      const status = req.body.status;
      const list = req.body.list_id;
      // const uniqueTaskName = await getUniqueTaskName(task, connection);
  
      const [insertResult] = await connection.query('INSERT INTO tasks (task, status, list_id) VALUES (?, ?, ?); SELECT LAST_INSERT_ID() as task_id', [task, status, list]);
      const task_id = insertResult[1][0].task_id;
      const savedLists = await fetchSavedLists(connection);

      res.status(200).json({ message: 'Task added to database!', savedLists, task_id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error adding task to database!' });
    }
  });

  app.post('/lists', async (req, res) => {
    try {
      const list = req.body.list;

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

  app.post('/lists/overwrite', async (req, res) => {
    try {
      const list = req.body.list;
      const list_id = req.body.list_id;

      const updated = await connection.query(`UPDATE todo_list.lists SET list = ? WHERE list_id = ?;`, [list, list_id]);
  
      const savedLists = await fetchSavedLists(connection);
      res.status(200).json({ message: 'List updated!', updated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating list on database!' });
    }
  });

  

/* UPDATE queries */
  // Change task status
  app.put('/tasks/:taskId', async (req, res) => {
    const taskId = req.params.taskId;
    const status = req.body.status;
  
    if (!taskId || !status) {
      return res.status(400).json({ error: 'taskId and status are required' });
    }
  
    try {
      const [result] = await connection.execute(
        'UPDATE tasks SET status = ? WHERE task_id = ?',
        [status, taskId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      res.json({ message: 'Task updated successfully.' });
    } catch (error) {
      console.error(`Error updating task: ${error.message}`);
      res.status(500).json({ error: 'An error occurred while updating the task.' });
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
      let listId = req.params.id;
      if (typeof listId === 'undefined') {
        return res.status(400).json({ error: 'Missing list_id parameter' });
      }
      if (listId == "null") {
      await connection.query(`DELETE FROM tasks WHERE list_id IS NULL`);
      }
      else {
      await connection.query(`DELETE FROM lists WHERE list_id = ?`, [listId]);
      await connection.query(`DELETE FROM tasks WHERE list_id = ?`, [listId]);
      }
      await fetchSavedLists(connection);
      res.status(200).json({ message: 'List removed from database!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error removing List from database!' });
    }
  });
  
/* Server Status */  
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


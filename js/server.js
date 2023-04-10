const mysql = require('mysql2/promise');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '01251999',
  database: 'todo_list'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});

module.exports = connection;

const connection = require('mysql2/promise');

connection.query(
  'CREATE TABLE IF NOT EXISTS tasks (task_id INT AUTO_INCREMENT PRIMARY KEY, task VARCHAR(255) NOT NULL, status BOOLEAN NOT NULL DEFAULT false);',
  (err) => {
    if (err) throw err;
    console.log('Tasks table created!');
  }
);

connection.query(
    'INSERT INTO tasks (task, status) VALUES (?, ?);',
    ['New Task', false],
    (err) => {
      if (err) throw err;
      console.log('New task added!');
    }
  );

connection.query(
  'UPDATE tasks SET status = ? WHERE task_id = ?;',
  [true, 1],
  (err) => {
    if (err) throw err;
    console.log('Task status updated!');
  }
);

connection.query(
    'DELETE FROM tasks WHERE task_id = ?;',
    [1],
    (err) => {
      if (err) throw err;
      console.log('Task removed!');
    }
  );

  connection.query('SELECT * FROM tasks;', (err, results) => {
    if (err) throw err;

    console.log('Tasks:');
    results.forEach((task) => {
      console.log(`- ${task.task} (${task.status ? 'Completed' : 'Not completed'})`);
    });
  });
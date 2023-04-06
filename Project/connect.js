/** 
* @name: Project - Phase 2 
* @Course Code: SODV1201 
* @class: Software Development Diploma program. 
* @author: Group 2: Adam Workie, Ely Cuaton, Jeni R Villavicencio, Joefel Cepeda, Willian P Munhoz. 
*/ 
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5500;

// Using template from Alura academy:
app.use(
    express.json(),
    bodyParser.urlencoded({ extended: true }),
    express.static('public', { 'Content-Type': 'application/javascript' })
    );
app.set("view engine", "ejs");
    
app.get("/", function(req, res) {
    res.render("index")
});

// Our database connection config:
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "to-do"
});

// Connection request:
con.connect((err) => {
    if (err) throw err;
    else console.log("connected")
});

app.use(express.json());


// GETALL
app.get('/', (req, res) => {
    con.query('SELECT * FROM tasks where list_ID IS NULL', (err, results) => {
        if (err) throw err;
        res.json(results)
      })
})

// POST
app.post('/task', (req, res) => {
    const task = "no body cares";
    con.query('INSERT INTO tasks(task) VALUES(?)', [task], (err, result) => {
        if (err) throw err;
            console.log('Task inserted successfully');
    })
    res.redirect("/");
})

// start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
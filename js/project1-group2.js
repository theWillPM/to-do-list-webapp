/** 
* @name: Project - Phase 1 
* @Course Code: SODV1201 
* @class: Software Development Diploma program. 
* @author: Group 2: Adam Workie, Ely Cuaton, Jeni R Villavicencio, Joefel Cepeda, Willian P Munhoz. 
*/ 

$(document).ready(function() {
    let tasks = [];
    let savedLists = [];
    let openedListIndex = -1;
    let savedTasks = [];

  
    // Add task
    function addTask(taskName) {
      const uniqueName = getUniqueTaskName(taskName, tasks);
      tasks.push({ task: uniqueName, status: "ongoing" });
      displayTasks();
    }
  
    function getUniqueTaskName(name, tasks) {
      let baseName = name;
      let counter = 1;
      let unique = false;
      while (!unique) {
        unique = true;
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i].task === name) {
            unique = false;
            name = baseName + " (" + counter + ")";
            counter++;
            break;
          }
        }
      }
      return name;
    }

    $(".add-button").click(function() {
      let task = $("#item-to-add").val().trim();
      if (task.length > 0) {
        const uniqueTaskName = getUniqueTaskName(task, tasks);
        addTask(uniqueTaskName);
        $("#item-to-add").val("");
        $.ajax({
          url: 'http://localhost:3000/tasks',
          type: 'POST',
          data: JSON.stringify({ task: uniqueTaskName, status: 'ongoing' }),
          contentType: 'application/json',
          success: function(response) {
            if (response.message) { // Check if there's a message in the response
              getTasks();
              $("#item-to-add").val("");
            } else {
              console.error(response.message);
            }
          },
          error: function(error) {
            console.error('Error:', error);
          },
        });
      }
    });

    function getTasks() {
      $("#current-list").empty();
  
      $.ajax({
        url: 'http://localhost:3000/tasks',
        type: 'GET',
        success: function(response) {
          console.log('Fetched tasks:', response); 
          if (response.length > 0) { // Check if there are tasks in the response
            tasks = response;
            displayTasks();
          } else {
            console.error("No tasks found");
          }
        },
        error: function(error) {
          console.error('Error:', error);
        },
      });
    }
    // Remove task
function removeTask(index) {
  const taskId = tasks[index].task_id;
  $.ajax({
    url: `http://localhost:3000/tasks/${taskId}`,
    type: 'DELETE',
    success: function(response) {
      if (response.message) { // Check if there's a message in the response
        getTasks();
      } else {
        console.error(response.message);
      }
    },
    error: function(error) {
      console.error('Error:', error);
    },
  });
}
  
    // Update status
    function updateStatus(index) {
      const taskId = tasks[index].task_id;
      const newStatus = tasks[index].status === 'ongoing' ? 'complete' : 'ongoing';
    
      $.ajax({
        url: `http://localhost:3000/tasks/${taskId}`,
        type: 'PUT',
        data: JSON.stringify({ status: newStatus }),
        contentType: 'application/json',
        success: function (response) {
          if (response.success) {
            getTasks();
          } else {
            console.error(response.message);
          }
        },
        error: function (error) {
          console.error('Error:', error);
        },
      }).done(function () {
        getTasks();
      });
    }
    
    // Call getTasks() when the page is loaded
      getTasks();
    
  
    // Display tasks
    function displayTasks() {
      $("#current-list").empty();
    
      tasks.forEach(function (task, index) {
        let taskElement = $("<li>")
          .addClass("list-item")
          .text(task.task)
          .on("click", function () { // Change this line
            updateStatus(index);
          });
        if (task.status === "complete") {
          taskElement.css("text-decoration", "line-through");
          taskElement.css("text-decoration-color", "green");
          taskElement.css("color", "#888");
        }
        let removeButton = $("<img class=\"remove-icon\" src=\"./img/red-dash.png\">")
          .on("click", function (event) { // Change this line
            event.stopPropagation();
            removeTask(index);
          });
        taskElement.append(removeButton);
        $("#current-list").append(taskElement);
      });
    } 
  });
    
// Detect if user is in Dark Mode and automatically apply it:
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    DarkTheme();
}

// Functions to allow using ENTER in input fields to complete the action:
    //Item
    var itemName = document.getElementById("item-to-add");
    itemName.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            $(".add-button").click();
        }
    });
//

function DarkTheme() {
    console.log("Changed theme to Dark");
    $("#css-link").attr("href", "./css/dark_theme.css");
    $("#dark-theme-icon").attr("src", "./img/dark-icon-white.png");
    $("#light-theme-icon").attr("src", "./img/light-icon-white.png");
}

function LightTheme() {
    console.log("Changed theme to Light");
    $("#css-link").attr("href", "./css/light_theme.css");
    $("#dark-theme-icon").attr("src", "./img/dark-icon.png");
    $("#light-theme-icon").attr("src", "./img/light-icon.png");
}







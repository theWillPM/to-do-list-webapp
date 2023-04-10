/** 
* @name: Project - Phase 1 
* @Course Code: SODV1201 
* @class: Software Development Diploma program. 
* @author: Group 2: Adam Workie, Ely Cuaton, Jeni R Villavicencio, Joefel Cepeda, Willian P Munhoz. 
*/

$(document).ready(function () {
  savedLists = [];
  openedListIndex = -1;
  savedTasks = [];
  tasks = [];
  let currentListId =-1;
  
  // Adds task to array tasks and refreshes display
  function addTask(taskName) {
    const uniqueName = getUniqueTaskName(taskName, tasks);
    tasks.push({ task: uniqueName, status: "ongoing" });
    displayTasks();
  }

  // This function prevents saving tasks with the same 'name' (same tasks). Adds counter (n) to the repeated tasks.
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

  // JQuery to control what happens when we click the add-button
  $(".add-button").click(function () {
    // reads what is in the text input field:
    let task = $("#task-to-add").val().trim();
    // if there is text on the input field,
    if (task.length > 0) {
      // check for duplicates
      const uniqueTaskName = getUniqueTaskName(task, tasks);
      // add task
      addTask(uniqueTaskName);
      // clears input
      $("#task-to-add").val("");

      //asynchronous function to send a POST request - new task to database
      $.ajax({
        url: 'http://localhost:3000/tasks',
        type: 'POST',
        data: JSON.stringify({ task: uniqueTaskName, status: 'ongoing', list_id: currentListId }),
        contentType: 'application/json;  charset=utf-8',
        success: function (response) {
          if (response.message) { // Check if there's a message in the response
            if(currentListId === -1)
              getTasks();
            else
              getTasksByList(currentListId);
            $("#task-to-add").val("");
          } else {
            console.error(response.message);
          }
        },
        error: function (error) {
          console.error('Error:', error);
        },
      });
    }
  });

  // Retrieves the JSON with all tasks
  function getTasks() {
    $("#current-list").empty();

    $.ajax({
      url: 'http://localhost:3000/tasks',
      type: 'GET',
      success: function (response) {
        console.log('Fetched tasks:', response);
        if (response.length > 0) { // Check if there are tasks in the response
          tasks = response;
          displayTasks();
        } else {
          console.error("No tasks found");
        }
      },
      error: function (error) {
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
      success: function (response) {
        if (response.message) { // Check if there's a message in the response
          if(currentListId === -1)
            getTasks();
          else
            getTasksByList(currentListId);
        } else {
          console.error(response.message);
        }
      },
      error: function (error) {
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
          if(currentListId === -1)
            getTasks();
          else
            getTasksByList(currentListId);
        } else {
          console.error(response.message);
        }
      },
      error: function (error) {
        console.error('Error:', error);
      },
    }).done(function () {
      if(currentListId === -1)
        getTasks();
      else
        getTasksByList(currentListId);
    });
  }

  // Call getTasks() when the page is loaded
  getTasks();

  function saveList() {
    const listName = $("#current-list-name").val();
    if (listName.trim() === "") {
      alert("Please enter a name for the list.");
      return;
    }
    const data = { list: listName, tasks: tasks };
    $.ajax({
      url: "http://localhost:3000/lists",
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (response) {
        console.log(response);
        savedLists.push({ name: listName, list_id: response.insertId, tasks: [] }); // Create a new tasks array for the new list
        currentListId = -1;
        tasks = []; // Clear all the tasks
        displayTasks();
      },
      error: function (error) {
        console.error("Error:", error);
      },
    });
  } 
 
// Display tasks
function displayTasks() {
  $("#current-list").empty(); // Clear the tasks displayed on the page

  tasks.forEach(function (task, index) {
    // Displays tasks that don't belong to any list:
    if (currentListId == -1 && task.list_id == null || task.list_id == currentListId)
    {
    let taskElement = $("<li>")
      .addClass("list-task")
      .text(task.task)
      .on("click", function () { 
        updateStatus(index);
      });
    if (task.status === "complete") {
      taskElement.css("text-decoration", "line-through");
      taskElement.css("text-decoration-color", "green");
      taskElement.css("color", "#888");
    }
    let removeButton = $("<img class=\"remove-icon\" src=\"./img/red-dash.png\">")
      .on("click", function (event) { 
        event.stopPropagation();
        removeTask(index);
      });
    taskElement.append(removeButton);
    $("#current-list").append(taskElement);
  }
  });

  // Enable or disable the "Delete All tasks" button based on tasks length
  if (tasks.length > 0) {
    $("#delete-all-tasks-button").prop("disabled", false);
  } else {
    $("#delete-all-tasks-button").prop("disabled", true);
  }
}
  

function clearTasks() {
  return $.ajax({
    url: 'http://localhost:3000/tasks',
    type: 'DELETE',
    contentType: 'application/json; charset=utf-8',
  });
}

$("#save-list-button").click(function () {
  clearTasks().done(function () {
    // The rest of the save list logic
  });
});

  // Save list
  $("#save-list-button").click(function () {
    let listName = $("#current-list-name").val().trim();
    if (listName.length === 0) {
      listName = "Unnamed List";
    }
    if (openedListIndex === -1) {
      // Save a new list
      listName = getUniqueListName(listName);
      savedLists.push({ name: listName, tasks: tasks.slice() });
    } else {
      // Update the opened list
      listName = getUniqueListName(listName, openedListIndex);
      savedLists[openedListIndex] = { name: listName, tasks: tasks.slice() };
    }
    saveList(listName);
    
    // Clear the tasks array and update the display
    tasks = [];
    displayTasks();
    
    $("#current-list-name").val("");
    openedListIndex = -1;
    fetchAndDisplaySavedLists(); // Call this function to fetch and display the latest saved lists
  });


function fetchAndDisplaySavedLists() {
  $.ajax({
    url: 'http://localhost:3000/lists',
    type: 'GET',
    success: function (response) {
      console.log('Fetched saved lists:', response);
      if (response.length > 0) {
        savedLists = response;
        displaySavedLists();
      } else {
        console.error("No saved lists found");
      }
    },
    error: function (error) {
      console.error('Error:', error);
    },
  });
}

  // Get unique list name
  function getUniqueListName(name, excludeIndex) {
    let baseName = name;
    let counter = 1;
    let unique = false;
    while (!unique) {
      unique = true;
      for (let i = 0; i < savedLists.length; i++) {
        if (i === excludeIndex) {
          continue;
        }
        if (savedLists[i].name === name) {
          unique = false;
          name = baseName + " (" + counter + ")";
          counter++;
          break;
        }
      }
    }
    return name;
  }

  function getSavedLists() {
    $.ajax({
      url: 'http://localhost:3000/lists',
      type: 'GET',
      success: function (response) {
        console.log('Fetched saved lists:', response);
        if (response.length > 0) {
          savedLists = response;
          displaySavedLists();
        } else {
          console.error("No saved lists found");
        }
      },
      error: function (error) {
        console.error('Error:', error);
      },
    });
  }
  

  /* LISTS */
  // Remove saved list
  function removeSavedList(list) {
    const index = savedLists.findIndex(x => x.name === list);
    if (index === -1) {
      console.error(`List '${list}' not found in savedLists`);
      return;
    }
    const listId = savedLists[index].list_id;
  
    $.ajax({
      url: `http://localhost:3000/lists/${listId}`,
      type: 'DELETE',
      success: function (response) {
        if (response.message) {
          displaySavedLists();
        } else {
          console.error(response.message);
        }
      },
      error: function (xhr, status, error) {
        console.error(`Error removing list '${savedLists[index].name}':`, error);
      },
    });
  
    savedLists.splice(index, 1);
    displaySavedLists();
  }
  
  // Delete all tasks in the current list
  $("#delete-all-lists-button").click(function () {
    if (confirm("Are you sure you want to delete all saved lists?")) {
      $.ajax({
        url: 'http://localhost:3000/lists',
        type: 'DELETE',
        success: function (response) {
          if (response.message) {
            displaySavedLists();
          } else {
            console.error(response.message);
          }
        },
        error: function (xhr, status, error) {
          console.error(`Error removing all lists:`, error);
        },
      });
    }
  });

  function getTasksByList(id) {
    $("#current-list").empty();
    $.ajax({
      url: `http://localhost:3000/tasksbylist/${id}`,
      type: 'GET',
      success: function (response) {
        console.log('Fetched tasks:', response);
      
        if (response.length > 0) { // Check if there are tasks in the response
          tasks = response;
          displayTasks();
        } else {
          console.error("No tasks found");
        }
      },
      error: function (error) {
        console.error('Error:', error);
      },
    });
  }

function displaySavedLists() {
  $.ajax({
    url: 'http://localhost:3000/lists',
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    success: function (response) {
      // Update the savedLists array with the fetched lists
      savedLists = response;

      // Clear the existing list tasks
      $('#list-of-saved-lists').empty();

      // Iterate through the response and display the lists
      response.forEach(function (list, index) {
        let listElement = $("<li>")
          .addClass("saved-list-title")
          .text(list.list)
          .click(function () {
            currentListId = list.list_id;
            getTasksByList(currentListId);
            displayTasks();
            openedListIndex = index;
            $("#current-list-name").val(list.list);
            $("#delete-all-tasks-button").prop("disabled", false);
          });
        let removeButton = $("<input>")
          .attr("type", "button")
          .addClass("remove-button")
          .val("-")
          .click(function (event) {
            event.stopPropagation();
            removeSavedList(savedLists[index].name);
          });
        listElement.append(removeButton);
        $("#list-of-saved-lists").append(listElement);
      });
    },
    error: function (error) {
      console.error('Error:', error);
    },
  });
}

  displaySavedLists();
});

// Detect if user is in Dark Mode and automatically apply it:
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  DarkTheme();
}

// Functions to allow using ENTER in input fields to complete the action:
//task
var taskName = document.getElementById("task-to-add");
taskName.addEventListener("keypress", function (e) {
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







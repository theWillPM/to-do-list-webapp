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
  
  
    $(".add-button").click(function () {
      let task = $("#task-to-add").val().trim();
      if (task.length > 0) {
        const uniqueTaskName = getUniqueTaskName(task, tasks);
        addTask(uniqueTaskName);
        $("#task-to-add").val("");
        $.ajax({
          url: 'http://localhost:3000/tasks',
          type: 'POST',
          data: JSON.stringify({ task: uniqueTaskName, status: 'ongoing' }),
          contentType: 'application/json;  charset=utf-8',
          success: function (response) {
            if (response.message) { 
              if (openedListIndex !== -1) { 
                getTasks();
              }
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
    
    function getTasks() {
      if (openedListIndex !== -1) {
        $("#current-list").empty();
    
        $.ajax({
          url: `http://localhost:3000/lists/${savedLists[openedListIndex].list_id}/tasks`,
          type: 'GET',
          success: function (response) {
            console.log('Fetched tasks:', response);
            if (response.length > 0) { 
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
    }
    
    // Remove task
    function removeTask(index) {
      const taskId = tasks[index].task_id;
      $.ajax({
        url: `http://localhost:3000/tasks/${taskId}`,
        type: 'DELETE',
        success: function (response) {
          if (response.message) { 
            getTasks();
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
          tasks = []; // Clear all the tasks
          displayTasks();
          fetchAndDisplaySavedLists(); // Fetch and display saved lists after saving the new list
        },
        error: function (error) {
          console.error("Error:", error);
        },
      });
    }
    
    
  
  // Display tasks
  function displayTasks() {
    const taskListElement = document.getElementById("current-list");
    taskListElement.innerHTML = ''; // Clear the existing tasks
  
    tasks.forEach((task, index) => {
      let taskElement = $("<li>")
        .addClass("list-item")
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
    });
  }
  
  
  
  
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
  
      // Clear the tasks array and update the display for the new list
      tasks = [];
      displayTasks();
    } else {
      // Update the opened list
      listName = getUniqueListName(listName, openedListIndex);
      savedLists[openedListIndex] = { name: listName, tasks: tasks.slice() };
    }
  
    saveList(listName);
  
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
    
  
  
    function displaySavedLists() {
      $.ajax({
        url: 'http://localhost:3000/lists',
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        success: function (response) {
          // Update the savedLists array with the fetched lists
          savedLists = response;
    
          // Clear the existing list items
          $('#list-of-saved-lists').empty();
    
          // Iterate through the response and display the lists
          response.forEach(function (list, index) {
            let listElement = $("<li>")
              .addClass("saved-list-title")
              .text(list.list)
              //.click(function () {
                listElement.click(function () {
                  $.ajax({
                      url: `http://localhost:3000/lists/${list.list_id}/tasks`,
                      type: 'GET',
                      success: function (tasksResponse) {
                        tasks = tasksResponse;
                        displayTasks(); // Display the fetched tasks
                      },
                      error: function (error) {
                        console.error('Error fetching tasks for list:', error);
                      }
                  });
              
                  openedListIndex = index;
                  $("#current-list-name").val(list.list);
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
  //Item
  var itemName = document.getElementById("task-to-add");
  itemName.addEventListener("keypress", function (e) {
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
  
  
  
  
  
  
  
/** 
* @name: Project - Phase 1 
* @Course Code: SODV1201 
* @class: Software Development Diploma program. 
* @author: Group 2: Adam Workie, Ely Cuaton, Jeni R Villavicencio, Joefel Cepeda, Willian P Munhoz. 
*/ 

// JQuery:
$(document).ready(function () {
    let tasks = [];
    let savedLists = [];
    let openedListIndex = -1;

    // Add task
    $(".add-button").click(function () {
        let task = $("#item-to-add").val().trim();
        if (task.length > 0) {
            tasks.push({ task: task, status: "ongoing" });
            displayTasks();
            $("#item-to-add").val("");
        }
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
        displaySavedLists();
        tasks = [];
        displayTasks();
        $("#current-list-name").val("");
        openedListIndex = -1;
    });
    
    // Display tasks
    function displayTasks() {
        $("#current-list").empty();

        tasks.forEach(function (task, index) {
            let taskElement = $("<li>")
                .addClass("list-item")
                .text(task.task)
                .click(function () {
                    updateStatus(index);
                });
            if (task.status === "complete") {
                taskElement.css("text-decoration", "line-through");
                taskElement.css("text-decoration-color", "green");
                taskElement.css("color", "#888");
                
            }
            let removeButton = $("<img class=\"remove-icon\" src=\"./img/red-dash.png\">")
            
                .click(function () {
                    removeTask(index);
                });
            taskElement.append(removeButton);
            $("#current-list").append(taskElement);
        });
    }


    // Remove task
    function removeTask(index) {
        tasks.splice(index, 1);
        displayTasks();
    }


    // Update status
    function updateStatus(index) {
        tasks[index].status = tasks[index].status === "ongoing" ? "complete" : "ongoing";
        displayTasks();
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
    
    // Display saved lists
    function displaySavedLists() {
        $("#list-of-saved-lists").empty();
        savedLists.forEach(function (list, index) {
            let listElement = $("<li>")
                .addClass("saved-list-title")
                .text(list.name)
                .click(function () {
                    tasks = list.tasks.slice();
                    displayTasks();
                    openedListIndex = index;
                    $("#current-list-name").val(list.name);
                });
            let removeButton = $("<input>")
                .attr("type", "button")
                .addClass("remove-button")
                .val("-")
                .click(function (event) {
                    event.stopPropagation();
                    removeSavedList(index);
                });
            listElement.append(removeButton);
            $("#list-of-saved-lists").append(listElement);
        });
    }

    // Remove saved list
    function removeSavedList(index) {
        savedLists.splice(index, 1);
        displaySavedLists();
    }
    
    // Delete all items in the current list
    $("#delete-all-items-button").click(function () {
    if (confirm("Are you sure you want to delete all items in the current list?")) {
        deleteAllItems();
        displayTasks();
    }
    });

    // Delete all saved lists
    $("#delete-all-lists-button").click(function() {
    if (confirm("Are you sure you want to delete all saved lists?")) {
        deleteAllLists();
        displaySavedLists();
    }
    });


    function deleteAllItems() {
    tasks.length = 0;
    }

    function deleteAllLists() {
    savedLists.length = 0;
    }

// Detect if user is in Dark Mode and automatically apply it:
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    DarkTheme();
}
    
});

// Functions to allow using ENTER in input fields to complete the action:
    //List Name
    var listNameInput = document.getElementById("current-list-name");
    listNameInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            $("#save-list-button").click();
        }
    });

    //Item
    var itemName = document.getElementById("item-to-add");
    itemName.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            $("#item-add-button").click();
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



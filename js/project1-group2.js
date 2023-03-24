$(document).ready(function () {
    let tasks = [];
    let savedLists = [];


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
        savedLists.push({ name: listName, tasks: tasks.slice() });
        displaySavedLists();
        tasks = [];
        displayTasks();
        $("#current-list-name").val("");
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
    
});

// Function to allow using ENTER in input fields to complete the action:
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



document.addEventListener("DOMContentLoaded", () => {
    const taskListsContainer = document.getElementById("task-lists");
    const taskForm = document.getElementById("new-task-form");
    const taskInput = document.getElementById("new-task-input");
    const taskListElement = document.getElementById("tasks");
    const listTitleElement = document.getElementById("list-title");
    const newListForm = document.getElementById("new-list-form");
    const newListInput = document.getElementById("new-list-input");

    const contextMenu = document.getElementById("context-menu");
    const editListButton = document.getElementById("edit-list");
    const deleteListButton = document.getElementById("delete-list");

    let taskLists = [];
    let selectedListId = null;
    let contextListId = null;

    newListForm.addEventListener("submit", e => {
        e.preventDefault();
        const listName = newListInput.value.trim();
        if (listName === "") return;
        const list = createList(listName);
        newListInput.value = "";
        taskLists.push(list);
        saveAndRender();
    });

    taskListsContainer.addEventListener("click", e => {
        if (e.target.tagName.toLowerCase() === 'li') {
            selectedListId = e.target.dataset.listId;
            saveAndRender();
        }
    });

    taskListsContainer.addEventListener("contextmenu", e => {
        e.preventDefault();
        const listElement = e.target.closest('li');
        if (listElement) {
            contextListId = listElement.dataset.listId;
            contextMenu.style.display = "block";
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.left = `${e.clientX}px`;
        }
    });

    document.addEventListener("click", e => {
        if (e.target !== contextMenu && !contextMenu.contains(e.target)) {
            contextMenu.style.display = "none";
        }
    });

    editListButton.addEventListener("click", () => {
        const list = taskLists.find(list => list.id === contextListId);
        const listName = prompt("Yeni liste ismi girin:", list.name);
        if (listName == null || listName.trim() === "") return;
        list.name = listName.trim();
        saveAndRender();
    });

    deleteListButton.addEventListener("click", () => {
        taskLists = taskLists.filter(list => list.id !== contextListId);
        if (contextListId === selectedListId) {
            selectedListId = null;
        }
        saveAndRender();
    });

    taskForm.addEventListener("submit", e => {
        e.preventDefault();
        const taskName = taskInput.value.trim();
        if (taskName === "") return;
        const task = createTask(taskName);
        taskInput.value = "";
        const selectedList = taskLists.find(list => list.id === selectedListId);
        selectedList.tasks.push(task);
        saveAndRender();
    });

    function createList(name) {
        return { id: Date.now().toString(), name: name, tasks: [] };
    }

    function createTask(name) {
        return { id: Date.now().toString(), name: name, complete: false };
    }

    function saveAndRender() {
        save();
        render();
    }

    function save() {
        localStorage.setItem('task.lists', JSON.stringify(taskLists));
        localStorage.setItem('task.selectedListId', selectedListId);
    }

    function render() {
        clearElement(taskListsContainer);
        renderTaskLists();

        const selectedList = taskLists.find(list => list.id === selectedListId);
        if (selectedListId == null) {
            listTitleElement.innerText = "Görevler";
            clearElement(taskListElement);
        } else {
            listTitleElement.innerText = selectedList.name;
            clearElement(taskListElement);
            renderTasks(selectedList);
        }
    }

    function renderTaskLists() {
        taskLists.forEach(list => {
            const listElement = document.createElement("li");
            listElement.dataset.listId = list.id;
            listElement.classList.add("task-list-name");
            listElement.innerText = list.name;

            if (list.id === selectedListId) {
                listElement.classList.add("active");
            }

            taskListsContainer.appendChild(listElement);
        });
    }

    function renderTasks(selectedList) {
        selectedList.tasks.forEach(task => {
            const taskElement = document.createElement("div");
            taskElement.classList.add("task");

            const contentElement = document.createElement("div");
            contentElement.classList.add("content");

            const inputElement = document.createElement("input");
            inputElement.type = "text";
            inputElement.classList.add("text");
            inputElement.value = task.name;
            inputElement.readOnly = true;

            contentElement.appendChild(inputElement);

            const actionsElement = document.createElement("div");
            actionsElement.classList.add("actions");

            const editElement = document.createElement("button");
            editElement.classList.add("edit");
            editElement.innerText = "Edit";

            const deleteElement = document.createElement("button");
            deleteElement.classList.add("delete");
            deleteElement.innerText = "Delete";

            actionsElement.appendChild(editElement);
            actionsElement.appendChild(deleteElement);

            taskElement.appendChild(contentElement);
            taskElement.appendChild(actionsElement);

            taskListElement.appendChild(taskElement);

            editElement.addEventListener("click", () => {
                inputElement.readOnly = !inputElement.readOnly;
                inputElement.focus();
                if (!inputElement.readOnly) {
                    editElement.innerText = "Save";
                } else {
                    editElement.innerText = "Edit";
                    task.name = inputElement.value;
                    saveAndRender();
                }
            });

            deleteElement.addEventListener("click", () => {
                selectedList.tasks = selectedList.tasks.filter(t => t.id !== task.id);
                saveAndRender();
            });
        });
    }

    function clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    (function load() {
        taskLists = JSON.parse(localStorage.getItem('task.lists')) || [];
        selectedListId = localStorage.getItem('task.selectedListId');
        render();
    })();
});

"use strict";
console.log("TODO App");
class TaskManager {
    constructor(listAreaElement) {
        this.listAreaElemet = listAreaElement;
        this.taskArray = [];
        this.currentTask = null;
    }
    lenght() {
        return this.taskArray.length;
    }
    loadTasksFromLoclStorage() {
        if (!localStorage.todoList)
            return null;
        for (const [i, task] of JSON.parse(localStorage.todoList).reverse().entries())
            this.addNewTask(task.content, i, task.isDone);
        return this.taskArray;
    }
    addNewTask(content, id, mode = false) {
        const task = {
            content: content,
            isDone: mode
        };
        this.taskArray.unshift(task); // add to array
        const newTaskElement = document.createElement('div');
        newTaskElement.draggable = true;
        newTaskElement.id = String(id);
        newTaskElement.addEventListener('dragstart', (e) => { this.dragStartHandler(e); });
        newTaskElement.addEventListener('dragover', (e) => { e.preventDefault(); });
        newTaskElement.addEventListener('drop', (e) => { this.dropHandler(e); });
        newTaskElement.addEventListener('dragleave', () => { });
        const checkBox = document.createElement('input');
        const deletIcon = document.createElement('i');
        const editIcon = document.createElement('i');
        const textContainer = document.createElement('span');
        textContainer.innerHTML = task.content;
        deletIcon.classList.add("material-icons", "delete-icon");
        deletIcon.innerHTML = "delete";
        editIcon.classList.add("material-icons", "edit-icon");
        editIcon.innerHTML = "edit";
        newTaskElement.classList.add('task');
        checkBox.type = 'checkbox';
        if (task.isDone) { // 
            textContainer.classList.add('done');
            checkBox.checked = true;
        }
        // insert all child elements
        newTaskElement.append(checkBox);
        newTaskElement.append(textContainer);
        newTaskElement.append(editIcon);
        newTaskElement.append(deletIcon);
        this.listAreaElemet.insertBefore(newTaskElement, this.listAreaElemet.firstChild); // to insert from top
        // event listeners
        deletIcon.addEventListener('click', () => { this.deleteTask(task, newTaskElement); });
        editIcon.addEventListener('click', () => { this.editTask(task, textContainer, editIcon); });
        checkBox.addEventListener('change', () => { this.checked(task, textContainer); });
    }
    checked(task, textElement) {
        task.isDone = !task.isDone;
        if (task.isDone)
            textElement.classList.add('done');
        else
            textElement.classList.remove('done');
        this.saveIntoLocalStorage();
    }
    deleteTask(task, taskElement) {
        this.taskArray.splice(this.taskArray.indexOf(task), 1);
        taskElement.remove();
        this.saveIntoLocalStorage();
    }
    editTask(task, textContainer, editIcon) {
        textContainer.innerHTML = "";
        const inputElement = document.createElement('input');
        inputElement.value = task.content;
        textContainer.append(inputElement);
        const saveIcon = document.createElement('i');
        saveIcon.classList.add('material-icons', "save-icon");
        saveIcon.innerHTML = "save";
        editIcon.style.display = 'none';
        editIcon.parentNode?.append(saveIcon);
        saveIcon.addEventListener('click', () => { this.saveChanges(task, inputElement, saveIcon, editIcon); });
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter')
                saveIcon.click();
        });
    }
    saveChanges(task, inputElement, saveIcon, editIcon) {
        task.content = inputElement.value;
        inputElement.parentNode.innerHTML = inputElement.value;
        saveIcon.remove();
        editIcon.style.display = 'inline';
        this.saveIntoLocalStorage();
    }
    saveIntoLocalStorage() {
        localStorage.setItem('todoList', JSON.stringify(this.taskArray));
    }
    dragStartHandler(e) {
        this.currentTask = e.target;
        let draggableElementIndex = Array.from(this.listAreaElemet.children).indexOf(e.target);
        e.dataTransfer.setData('index', String(draggableElementIndex));
        setTimeout(() => {
            e.target.style.display = "none";
            // e.target.remove();
        }, 0);
    }
    dropHandler(e) {
        e.stopPropagation();
        e.preventDefault();
        const draggableElementIndex = Number(e.dataTransfer?.getData('index'));
        this.currentTask.style.display = 'flex';
        let newIndex = Array.from(this.listAreaElemet.children).indexOf(e.target);
        this.listAreaElemet.insertBefore(this.currentTask, e.target);
        const task = this.taskArray[draggableElementIndex];
        this.taskArray.splice(draggableElementIndex, 1);
        let k = (draggableElementIndex > newIndex) ? 0 : -1;
        this.taskArray.splice(newIndex + k, 0, task);
        this.saveIntoLocalStorage();
    }
}
window.addEventListener('load', () => {
    const addBtn = document.getElementById('add-btn');
    const input = document.getElementById('input');
    const listArea = document.getElementById('list-area');
    const dragZone = document.getElementById('dragZone');
    const taskManager = new TaskManager(listArea);
    taskManager.loadTasksFromLoclStorage();
    addBtn.addEventListener('click', () => {
        if (!input.value.trim().length)
            return;
        taskManager.addNewTask(input.value, taskManager.taskArray.length);
        taskManager.saveIntoLocalStorage();
        input.value = "";
    });
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter')
            addBtn.click();
    });
    listArea.addEventListener('drop', (e) => {
        taskManager.currentTask.style.display = 'flex';
    });
    listArea.addEventListener('dragleave', () => { });
    // dragZone.addEventListener('dragleave', (e) => {
    //     console.log("11");
    //     (taskManager.currentTask as HTMLElement).style.display = 'flex';
    // })
    listArea.addEventListener('dragover', (e) => { e.preventDefault(); });
});
// 185

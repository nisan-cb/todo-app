console.log("TODO App");

interface Task {
    content: string,
    isDone: boolean
}

class TaskManager {
    taskArray: Task[];  // array of tasks
    listAreaElemet: HTMLElement;
    currentTask: HTMLElement | null | EventTarget;
    constructor(listAreaElement: HTMLElement) {
        this.listAreaElemet = listAreaElement;
        this.taskArray = [];
        this.currentTask = null;
    }

    lenght(): Number {
        return this.taskArray.length;
    }

    loadTasksFromLoclStorage(): Task[] | null {    // load tasks from local storege
        if (!localStorage.todoList) return null;
        for (const [i, task] of JSON.parse(localStorage.todoList).reverse().entries())
            this.addNewTask(task.content, i, task.isDone)
        return this.taskArray;
    }

    addNewTask(content: string, id: number, mode: boolean = false) {
        const task: Task = {
            content: content,
            isDone: mode
        };

        this.taskArray.unshift(task);  // add to array
        const newTaskElement = document.createElement('div');
        newTaskElement.draggable = true;
        newTaskElement.id = String(id);

        newTaskElement.addEventListener('dragstart', (e) => { this.dragStartHandler(e) });
        newTaskElement.addEventListener('dragover', (e) => { e.preventDefault() })


        newTaskElement.addEventListener('drop', (e) => { this.dropHandler(e) });
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
        newTaskElement.classList.add('task')
        checkBox.type = 'checkbox';

        if (task.isDone) {  // 
            textContainer.classList.add('done');
            checkBox.checked = true;
        }

        // insert all child elements
        newTaskElement.append(checkBox);
        newTaskElement.append(textContainer);
        newTaskElement.append(editIcon);
        newTaskElement.append(deletIcon);
        this.listAreaElemet.insertBefore(newTaskElement, this.listAreaElemet.firstChild)    // to insert from top


        // event listeners
        deletIcon.addEventListener('click', () => { this.deleteTask(task, newTaskElement) });
        editIcon.addEventListener('click', () => { this.editTask(task, textContainer, editIcon) });
        checkBox.addEventListener('change', () => { this.checked(task, textContainer) });



    }
    checked(task: Task, textElement: HTMLElement) {
        task.isDone = !task.isDone;
        if (task.isDone)
            textElement.classList.add('done');
        else
            textElement.classList.remove('done');

        this.saveIntoLocalStorage();
    }

    deleteTask(task: Task, taskElement: HTMLElement) {
        this.taskArray.splice(this.taskArray.indexOf(task), 1);
        taskElement.remove();
        this.saveIntoLocalStorage();
    }
    editTask(task: Task, textContainer: HTMLElement, editIcon: HTMLElement) {
        textContainer.innerHTML = "";
        const inputElement = document.createElement('input');
        inputElement.value = task.content;
        textContainer.append(inputElement);

        const saveIcon = document.createElement('i');
        saveIcon.classList.add('material-icons', "save-icon");
        saveIcon.innerHTML = "save";
        editIcon.style.display = 'none';
        editIcon.parentNode?.append(saveIcon)

        saveIcon.addEventListener('click', () => { this.saveChanges(task, inputElement, saveIcon, editIcon) })
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter')
                saveIcon.click();
        })
    }

    saveChanges(task: Task, inputElement: HTMLInputElement, saveIcon: HTMLElement, editIcon: HTMLElement) {
        task.content = inputElement.value;
        (inputElement.parentNode as HTMLElement).innerHTML = inputElement.value;
        saveIcon.remove();
        editIcon.style.display = 'inline'
        this.saveIntoLocalStorage();
    }

    saveIntoLocalStorage() {    // save taskArray into local storage
        localStorage.setItem('todoList', JSON.stringify(this.taskArray));
    }

    dragStartHandler(e: any) {
        this.currentTask = e.target;

        let draggableElementIndex = Array.from(this.listAreaElemet.children).indexOf(e.target as HTMLElement);
        e.dataTransfer.setData('index', String(draggableElementIndex));
        setTimeout(() => {
            (e.target as HTMLElement).style.display = "none";
            // e.target.remove();
        }, 0);
    }
    dropHandler(e: any) {
        e.stopPropagation();
        e.preventDefault();

        const draggableElementIndex = Number(e.dataTransfer?.getData('index'));
        (this.currentTask as HTMLElement).style.display = 'flex';

        let newIndex = Array.from(this.listAreaElemet.children).indexOf(e.target as HTMLElement);
        this.listAreaElemet.insertBefore(this.currentTask as HTMLElement, e.target as HTMLElement);

        const task = this.taskArray[draggableElementIndex]
        this.taskArray.splice(draggableElementIndex, 1);
        let k = (draggableElementIndex > newIndex) ? 0 : -1
        this.taskArray.splice(newIndex + k, 0, task);
        this.saveIntoLocalStorage();
    }
}







window.addEventListener('load', () => {
    const addBtn: HTMLElement = document.getElementById('add-btn') as HTMLElement;
    const input: HTMLInputElement = document.getElementById('input') as HTMLInputElement;
    const listArea = document.getElementById('list-area') as HTMLElement;
    const dragZone = document.getElementById('dragZone') as HTMLElement;

    const taskManager: TaskManager = new TaskManager(listArea);
    taskManager.loadTasksFromLoclStorage();

    addBtn.addEventListener('click', () => {
        if (!input.value.trim().length) return;
        taskManager.addNewTask(input.value, taskManager.taskArray.length)
        taskManager.saveIntoLocalStorage();
        input.value = "";
    });

    input.addEventListener('keypress', (e) => { // trigger add function by Enter
        if (e.key === 'Enter')
            addBtn.click();
    })

    listArea.addEventListener('drop', (e) => {
        (taskManager.currentTask as HTMLElement).style.display = 'flex';
    })
    listArea.addEventListener('dragleave', () => { })

    // dragZone.addEventListener('dragleave', (e) => {
    //     console.log("11");
    //     (taskManager.currentTask as HTMLElement).style.display = 'flex';
    // })

    listArea.addEventListener('dragover', (e) => { e.preventDefault() })
})
// 185
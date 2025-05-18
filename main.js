let taskIdCounter = 1;
let taskListData = [];

function saveToLocalStorage() {
  localStorage.setItem('taskListData', JSON.stringify(taskListData));
  localStorage.setItem('taskIdCounter', taskIdCounter);
}

function loadFromLocalStorage() {
  const data = localStorage.getItem('taskListData');
  const counter = localStorage.getItem('taskIdCounter');
  if (data) taskListData = JSON.parse(data);
  if (counter) taskIdCounter = parseInt(counter);
}

function loadTemplateOptions() {
  const select = document.getElementById('templateSelect');
  taskTemplates.forEach((template, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = `📋 ${template.name}`;
    select.appendChild(option);
  });

  select.onchange = () => {
    const idx = select.value;
    if (idx !== '') {
      addTaskFromTemplate(taskTemplates[idx]);
      select.value = '';
    }
  };
}

function addTaskFromTemplate(template, parentId = null) {
    const task = {
        id: taskIdCounter++,
        name: template.name,
        memo: template.memo,
        deadline: template.deadline,
        completed: false,
        parentId: parentId,
        subtasks: []
    };
    if (template.subtasks) {
        task.subtasks = template.subtasks.map(st => ({
            id: taskIdCounter++,
            name: st.name,
            memo: st.memo,
            deadline: st.deadline,
            completed: false,
            parentId: task.id,
            subtasks: []
        }));
    }

    if (parentId) {
        const parent = findTaskById(taskListData, parentId);
        if (parent) parent.subtasks.unshift(task);
    } else {
        taskListData.unshift(task);
    }

    saveToLocalStorage();
    renderTasks();
}

function addTask(parentId = null) {
    const task = {
        id: taskIdCounter++,
        name: '',
        memo: '',
        deadline: '',
        completed: false,
        parentId: parentId,
        subtasks: []
    };
    if (parentId) {
        const parent = findTaskById(taskListData, parentId);
        if (parent) parent.subtasks.unshift(task);
    } else {
        taskListData.unshift(task);
    }
    saveToLocalStorage();
    renderTasks();
}

function findTaskById(tasks, id) {
    for (const task of tasks) {
        if (task.id === id) return task;
        const found = findTaskById(task.subtasks, id);
        if (found) return found;
    }
    return null;
}

function deleteTaskById(id, tasks) {
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
            tasks.splice(i, 1);
            return true;
        }
        if (deleteTaskById(id, tasks[i].subtasks)) return true;
    }
    return false;
}

function moveTask(id, direction, tasks = taskListData) {
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
            if (direction === 'up' && i > 0) {
                [tasks[i], tasks[i - 1]] = [tasks[i - 1], tasks[i]];
            } else if (direction === 'down' && i < tasks.length - 1) {
                [tasks[i], tasks[i + 1]] = [tasks[i + 1], tasks[i]];
            }
            return true;
        }
        if (moveTask(id, direction, tasks[i].subtasks)) return true;
    }
    return false;
}

function toggleTask(task) {
    task.completed = !task.completed;
    saveToLocalStorage();
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('taskList');
    const showCompleted = document.getElementById('showCompleted').checked;
    list.innerHTML = '';

    function createTaskElement(task, level = 0) {
        if (!showCompleted && task.completed) return document.createDocumentFragment();

        const li = document.createElement('li');
        li.className = 'task';
        if (task.completed) li.classList.add('completed');
        li.style.marginLeft = `${level * 20}px`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.onchange = () => toggleTask(task);

        const nameSpan = document.createElement('span');
        nameSpan.className = 'task-name';
        nameSpan.textContent = task.name || '（新規タスク）';
        nameSpan.ondblclick = () => {
            nameSpan.contentEditable = true;
            nameSpan.focus();
        };
        nameSpan.onblur = () => {
            nameSpan.contentEditable = false;
            task.name = nameSpan.textContent;
            saveToLocalStorage();
        };

        const memoInput = document.createElement('input');
        memoInput.className = 'memo';
        memoInput.placeholder = 'メモ';
        memoInput.value = task.memo;
        memoInput.onchange = () => {
            task.memo = memoInput.value;
            saveToLocalStorage();
        };

        const deadlineInput = document.createElement('input');
        deadlineInput.type = 'date';
        deadlineInput.className = 'deadline';
        deadlineInput.value = task.deadline;
        deadlineInput.onchange = () => {
            task.deadline = deadlineInput.value;
            saveToLocalStorage();
        };

        const controls = document.createElement('div');
        controls.className = 'controls';

        const upBtn = document.createElement('button');
        upBtn.textContent = '▲';
        upBtn.title = '上に移動';
        upBtn.onclick = () => {
            moveTask(task.id, 'up');
            saveToLocalStorage();
            renderTasks();
        };

        const downBtn = document.createElement('button');
        downBtn.textContent = '▼';
        downBtn.title = '下に移動';
        downBtn.onclick = () => {
            moveTask(task.id, 'down');
            saveToLocalStorage();
            renderTasks();
        };

        const addSubBtn = document.createElement('button');
        addSubBtn.textContent = '＋';
        addSubBtn.title = 'サブタスク追加';
        addSubBtn.onclick = () => addTask(task.id);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑';
        deleteBtn.title = '削除';
        deleteBtn.onclick = () => {
            deleteTaskById(task.id, taskListData);
            saveToLocalStorage();
            renderTasks();
        };

        controls.append(upBtn, downBtn, addSubBtn, deleteBtn);

        li.append(checkbox, nameSpan, memoInput, deadlineInput, controls);

        const frag = document.createDocumentFragment();
        frag.appendChild(li);

        task.subtasks.forEach(st => {
            const subFrag = createTaskElement(st, level + 1);
            frag.appendChild(subFrag);
        });

        return frag;
    }

    taskListData.forEach(t => list.appendChild(createTaskElement(t)));
}

// 初期化
loadFromLocalStorage();
loadTemplateOptions();
renderTasks();

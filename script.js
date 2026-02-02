// ==================== STATE MANAGEMENT ====================
let tasks = {
    todo: [],
    inprogress: [],
    done: []
};

let draggedElement = null;
let currentEditingTask = null;
let currentColumn = null;
let taskIdCounter = 1;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    initializeEventListeners();
    renderAllTasks();
    // addSampleTasks(); // Commented out to start with empty board
});

// ==================== SAMPLE TASKS ====================
function addSampleTasks() {
    // Only add sample tasks if storage is empty
    if (tasks.todo.length === 0 && tasks.inprogress.length === 0 && tasks.done.length === 0) {
        tasks.todo = [
            {
                id: taskIdCounter++,
                title: 'Design new landing page',
                description: 'Create wireframes and mockups for the new landing page redesign',
                priority: 'high',
                column: 'todo'
            },
            {
                id: taskIdCounter++,
                title: 'Update documentation',
                description: 'Add API documentation for new endpoints',
                priority: 'medium',
                column: 'todo'
            }
        ];

        tasks.inprogress = [
            {
                id: taskIdCounter++,
                title: 'Implement user authentication',
                description: 'Build JWT-based authentication system with refresh tokens',
                priority: 'high',
                column: 'inprogress'
            }
        ];

        tasks.done = [
            {
                id: taskIdCounter++,
                title: 'Set up development environment',
                description: 'Configure development tools and dependencies',
                priority: 'low',
                column: 'done'
            }
        ];

        saveTasksToStorage();
        renderAllTasks();
    }
}

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    // Add task buttons
    const addTaskButtons = document.querySelectorAll('.add-task-btn');
    addTaskButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const column = e.currentTarget.dataset.column;
            openTaskModal(column);
        });
    });

    // Modal controls
    const modal = document.getElementById('taskModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveTaskBtn = document.getElementById('saveTaskBtn');

    closeModalBtn.addEventListener('click', closeTaskModal);
    cancelBtn.addEventListener('click', closeTaskModal);
    saveTaskBtn.addEventListener('click', saveTask);

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeTaskModal();
        }
    });

    // Enter key to save task
    document.getElementById('taskTitle').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveTask();
        }
    });

    // Initialize drag and drop for containers
    const containers = document.querySelectorAll('.tasks-container');
    containers.forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragleave', handleDragLeave);
    });
}

// ==================== MODAL FUNCTIONS ====================
function openTaskModal(column, task = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const taskTitle = document.getElementById('taskTitle');
    const taskDescription = document.getElementById('taskDescription');
    const taskPriority = document.getElementById('taskPriority');
    const saveBtn = document.getElementById('saveTaskBtn');

    currentColumn = column;
    currentEditingTask = task;

    if (task) {
        modalTitle.textContent = 'Edit Task';
        taskTitle.value = task.title;
        taskDescription.value = task.description || '';
        taskPriority.value = task.priority;
        saveBtn.textContent = 'Update Task';
    } else {
        modalTitle.textContent = 'Add New Task';
        taskTitle.value = '';
        taskDescription.value = '';
        taskPriority.value = 'medium';
        saveBtn.textContent = 'Add Task';
    }

    modal.classList.add('show');
    taskTitle.focus();
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.remove('show');
    currentEditingTask = null;
    currentColumn = null;
}

function saveTask() {
    const taskTitle = document.getElementById('taskTitle').value.trim();
    const taskDescription = document.getElementById('taskDescription').value.trim();
    const taskPriority = document.getElementById('taskPriority').value;

    if (!taskTitle) {
        alert('Please enter a task title');
        return;
    }

    if (currentEditingTask) {
        // Update existing task
        currentEditingTask.title = taskTitle;
        currentEditingTask.description = taskDescription;
        currentEditingTask.priority = taskPriority;
    } else {
        // Create new task
        const newTask = {
            id: taskIdCounter++,
            title: taskTitle,
            description: taskDescription,
            priority: taskPriority,
            column: currentColumn
        };
        tasks[currentColumn].push(newTask);
    }

    saveTasksToStorage();
    renderAllTasks();
    closeTaskModal();
}

// ==================== RENDERING ====================
function renderAllTasks() {
    renderTasks('todo');
    renderTasks('inprogress');
    renderTasks('done');
    updateTaskCounts();
}

function renderTasks(column) {
    const container = document.getElementById(`${column}-tasks`);
    container.innerHTML = '';

    tasks[column].forEach(task => {
        const taskCard = createTaskCard(task);
        container.appendChild(taskCard);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.taskId = task.id;
    card.dataset.priority = task.priority;

    card.innerHTML = `
        <div class="task-header">
            <h4 class="task-title">${escapeHtml(task.title)}</h4>
            <div class="task-actions">
                <button class="task-action-btn edit" title="Edit task">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.333 2.00004C11.5084 1.82463 11.7163 1.68648 11.9451 1.5933C12.1738 1.50013 12.4191 1.45337 12.6663 1.45337C12.9136 1.45337 13.1588 1.50013 13.3876 1.5933C13.6164 1.68648 13.8242 1.82463 13.9997 2.00004C14.1751 2.17545 14.3132 2.38334 14.4064 2.6121C14.4996 2.84087 14.5463 3.08615 14.5463 3.33337C14.5463 3.5806 14.4996 3.82588 14.4064 4.05464C14.3132 4.28341 14.1751 4.4913 13.9997 4.66671L5.33301 13.3334L1.33301 14.6667L2.66634 10.6667L11.333 2.00004Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="task-action-btn delete" title="Delete task">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
        ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
        <div class="task-footer">
            <span class="task-priority ${task.priority}">
                ${getPriorityIcon(task.priority)} ${task.priority}
            </span>
            <span class="task-id">#${task.id}</span>
        </div>
    `;

    // Add drag event listeners
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    // Add edit and delete event listeners
    const editBtn = card.querySelector('.edit');
    const deleteBtn = card.querySelector('.delete');

    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTaskModal(task.column, task);
    });

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id, task.column);
    });

    return card;
}

function getPriorityIcon(priority) {
    const icons = {
        low: '🟢',
        medium: '🟡',
        high: '🔴'
    };
    return icons[priority] || '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateTaskCounts() {
    document.getElementById('todo-count').textContent = tasks.todo.length;
    document.getElementById('inprogress-count').textContent = tasks.inprogress.length;
    document.getElementById('done-count').textContent = tasks.done.length;
}

// ==================== DRAG AND DROP ====================
function handleDragStart(e) {
    draggedElement = e.currentTarget;
    draggedElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedElement.innerHTML);
}

function handleDragEnd(e) {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
    }

    // Remove drag-over class from all containers
    const containers = document.querySelectorAll('.tasks-container');
    containers.forEach(container => {
        container.classList.remove('drag-over');
    });

    draggedElement = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';

    const container = e.currentTarget;
    container.classList.add('drag-over');

    return false;
}

function handleDragLeave(e) {
    const container = e.currentTarget;
    container.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    e.preventDefault();

    if (!draggedElement) return;

    const container = e.currentTarget;
    const newColumn = container.dataset.column;
    const taskId = parseInt(draggedElement.dataset.taskId);

    // Find the task in all columns
    let task = null;
    let oldColumn = null;

    for (const column in tasks) {
        const index = tasks[column].findIndex(t => t.id === taskId);
        if (index !== -1) {
            task = tasks[column][index];
            oldColumn = column;
            break;
        }
    }

    if (task && oldColumn !== newColumn) {
        // Remove from old column
        tasks[oldColumn] = tasks[oldColumn].filter(t => t.id !== taskId);

        // Add to new column
        task.column = newColumn;
        tasks[newColumn].push(task);

        saveTasksToStorage();
        renderAllTasks();
    }

    container.classList.remove('drag-over');

    return false;
}

// ==================== TASK MANAGEMENT ====================
function deleteTask(taskId, column) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks[column] = tasks[column].filter(task => task.id !== taskId);
        saveTasksToStorage();
        renderAllTasks();
    }
}

// ==================== LOCAL STORAGE ====================
function saveTasksToStorage() {
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
    localStorage.setItem('kanbanTaskIdCounter', taskIdCounter.toString());
}

function loadTasksFromStorage() {
    const savedTasks = localStorage.getItem('kanbanTasks');
    const savedCounter = localStorage.getItem('kanbanTaskIdCounter');

    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (e) {
            console.error('Error loading tasks from storage:', e);
            tasks = { todo: [], inprogress: [], done: [] };
        }
    }

    if (savedCounter) {
        taskIdCounter = parseInt(savedCounter);
    }
}

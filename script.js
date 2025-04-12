// Constructor Pro - Construction Project Management App
// Main Application Script

// App State
const state = {
    projects: JSON.parse(localStorage.getItem('projects')) || [],
    workers: JSON.parse(localStorage.getItem('workers')) || [],
    attendance: JSON.parse(localStorage.getItem('attendance')) || [],
    expenses: JSON.parse(localStorage.getItem('expenses')) || [],
    salaries: JSON.parse(localStorage.getItem('salaries')) || []
};

// DOM Elements
const elements = {
    splashScreen: document.getElementById('splash-screen'),
    appContainer: document.getElementById('app-container'),
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    pageTitle: document.getElementById('page-title'),
    pages: {
        dashboard: document.getElementById('dashboard-page'),
        projects: document.getElementById('projects-page'),
        workers: document.getElementById('workers-page'),
        attendance: document.getElementById('attendance-page'),
        salary: document.getElementById('salary-page'),
        expenses: document.getElementById('expenses-page'),
        budget: document.getElementById('budget-page')
    },
    sidebarMenuItems: document.querySelectorAll('.sidebar-menu li'),
    // Dashboard elements
    totalWorkers: document.getElementById('total-workers'),
    ongoingProjects: document.getElementById('ongoing-projects'),
    currentBudget: document.getElementById('current-budget'),
    totalExpenses: document.getElementById('total-expenses'),
    projectsChart: document.getElementById('projects-chart'),
    budgetChart: document.getElementById('budget-chart'),
    // Projects elements
    projectsTable: document.getElementById('projects-table').querySelector('tbody'),
    addProjectBtn: document.getElementById('add-project-btn'),
    projectSearch: document.getElementById('project-search'),
    projectStatusFilter: document.getElementById('project-status-filter'),
    // Workers elements
    workersTable: document.getElementById('workers-table').querySelector('tbody'),
    addWorkerBtn: document.getElementById('add-worker-btn'),
    workerSearch: document.getElementById('worker-search'),
    workerTypeFilter: document.getElementById('worker-type-filter'),
    // Attendance elements
    attendanceTable: document.getElementById('attendance-table').querySelector('tbody'),
    markAttendanceBtn: document.getElementById('mark-attendance-btn'),
    attendanceMonth: document.getElementById('attendance-month'),
    attendanceProjectFilter: document.getElementById('attendance-project-filter'),
    // Salary elements
    salaryTable: document.getElementById('salary-table').querySelector('tbody'),
    calculateSalariesBtn: document.getElementById('calculate-salaries-btn'),
    salaryMonth: document.getElementById('salary-month'),
    totalPayable: document.getElementById('total-payable'),
    workersCount: document.getElementById('workers-count'),
    overtimeAmount: document.getElementById('overtime-amount'),
    // Expenses elements
    expensesTable: document.getElementById('expenses-table').querySelector('tbody'),
    addExpenseBtn: document.getElementById('add-expense-btn'),
    expenseProjectFilter: document.getElementById('expense-project-filter'),
    expenseCategoryFilter: document.getElementById('expense-category-filter'),
    expenseMonthFilter: document.getElementById('expense-month-filter'),
    // Budget elements
    budgetProjectSelector: document.getElementById('budget-project-selector'),
    budgetDetails: document.getElementById('budget-details'),
    projectBudget: document.getElementById('project-budget'),
    projectExpenses: document.getElementById('project-expenses'),
    remainingBudget: document.getElementById('remaining-budget'),
    budgetUtilization: document.getElementById('budget-utilization'),
    projectBudgetChart: document.getElementById('project-budget-chart'),
    expenseCategoriesChart: document.getElementById('expense-categories-chart'),
    // Modals
    modals: {
        project: document.getElementById('project-modal'),
        worker: document.getElementById('worker-modal'),
        attendance: document.getElementById('attendance-modal'),
        expense: document.getElementById('expense-modal')
    },
    // Forms
    projectForm: document.getElementById('project-form'),
    workerForm: document.getElementById('worker-form'),
    expenseForm: document.getElementById('expense-form'),
    // Notification
    notification: document.getElementById('success-notification'),
    notificationMessage: document.getElementById('notification-message')
};

// Chart instances
let charts = {
    projectsChart: null,
    budgetChart: null,
    projectBudgetChart: null,
    expenseCategoriesChart: null
};

// Initialize the application
function initApp() {
    // Set current month for attendance and salary
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    elements.attendanceMonth.value = currentMonth;
    elements.salaryMonth.value = currentMonth;
    
    // Set current date for expense form
    document.getElementById('expense-date').valueAsDate = currentDate;
    
    // Load initial data
    loadDashboard();
    loadProjects();
    loadWorkers();
    loadAttendance();
    loadExpenses();
    
    // Initialize event listeners
    setupEventListeners();
    
    // Hide splash screen after delay
    setTimeout(() => {
        elements.appContainer.classList.remove('hidden');
    }, 2000);
}

// Set up all event listeners
function setupEventListeners() {
    // Sidebar navigation
    elements.sidebarMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            navigateTo(page);
        });
    });
    
    // Sidebar toggle for mobile
    elements.sidebarToggle.addEventListener('click', toggleSidebar);
    
    // Project management
    elements.addProjectBtn.addEventListener('click', () => openProjectModal());
    elements.projectSearch.addEventListener('input', filterProjects);
    elements.projectStatusFilter.addEventListener('change', filterProjects);
    
    // Worker management
    elements.addWorkerBtn.addEventListener('click', () => openWorkerModal());
    elements.workerSearch.addEventListener('input', filterWorkers);
    elements.workerTypeFilter.addEventListener('change', filterWorkers);
    
    // Attendance
    elements.markAttendanceBtn.addEventListener('click', openAttendanceModal);
    elements.attendanceMonth.addEventListener('change', loadAttendance);
    elements.attendanceProjectFilter.addEventListener('change', loadAttendance);
    
    // Salary
    elements.calculateSalariesBtn.addEventListener('click', calculateSalaries);
    elements.salaryMonth.addEventListener('change', loadSalaries);
    
    // Expenses
    elements.addExpenseBtn.addEventListener('click', () => openExpenseModal());
    elements.expenseProjectFilter.addEventListener('change', filterExpenses);
    elements.expenseCategoryFilter.addEventListener('change', filterExpenses);
    elements.expenseMonthFilter.addEventListener('change', filterExpenses);
    
    // Budget
    elements.budgetProjectSelector.addEventListener('change', loadBudgetDetails);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Form submissions
    elements.projectForm.addEventListener('submit', handleProjectFormSubmit);
    elements.workerForm.addEventListener('submit', handleWorkerFormSubmit);
    document.getElementById('save-attendance-btn').addEventListener('click', saveAttendance);
    elements.expenseForm.addEventListener('submit', handleExpenseFormSubmit);
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

// Navigation functions
function navigateTo(page) {
    // Hide all pages
    Object.values(elements.pages).forEach(page => {
        page.classList.remove('active-page');
    });
    
    // Show selected page
    elements.pages[page].classList.add('active-page');
    
    // Update page title
    elements.pageTitle.textContent = document.querySelector(`.sidebar-menu li[data-page="${page}"]`).textContent.trim();
    
    // Update active menu item
    elements.sidebarMenuItems.forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.sidebar-menu li[data-page="${page}"]`).classList.add('active');
    
    // Load specific page data
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'workers':
            loadWorkers();
            break;
        case 'attendance':
            loadAttendance();
            break;
        case 'salary':
            loadSalaries();
            break;
        case 'expenses':
            loadExpenses();
            break;
        case 'budget':
            loadBudgetProjects();
            break;
    }
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        elements.sidebar.classList.remove('active');
    }
}

function toggleSidebar() {
    elements.sidebar.classList.toggle('active');
}

// Dashboard functions
function loadDashboard() {
    // Update summary cards
    elements.totalWorkers.textContent = state.workers.length;
    elements.ongoingProjects.textContent = state.projects.filter(p => p.status === 'ongoing').length;
    
    const totalBudget = state.projects.reduce((sum, project) => sum + parseFloat(project.budget), 0);
    elements.currentBudget.textContent = `PKR ${totalBudget.toLocaleString()}`;
    
    const totalExpenses = state.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    elements.totalExpenses.textContent = `PKR ${totalExpenses.toLocaleString()}`;
    
    // Create charts
    createProjectsChart();
    createBudgetChart();
}

function createProjectsChart() {
    const ctx = elements.projectsChart.getContext('2d');
    
    if (charts.projectsChart) {
        charts.projectsChart.destroy();
    }
    
    const ongoing = state.projects.filter(p => p.status === 'ongoing').length;
    const completed = state.projects.filter(p => p.status === 'completed').length;
    
    charts.projectsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ongoing Projects', 'Completed Projects'],
            datasets: [{
                data: [ongoing, completed],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createBudgetChart() {
    const ctx = elements.budgetChart.getContext('2d');
    
    if (charts.budgetChart) {
        charts.budgetChart.destroy();
    }
    
    const totalBudget = state.projects.reduce((sum, project) => sum + parseFloat(project.budget), 0);
    const totalExpenses = state.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const remainingBudget = totalBudget - totalExpenses;
    
    charts.budgetChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Budget', 'Expenses', 'Remaining'],
            datasets: [{
                label: 'Amount (PKR)',
                data: [totalBudget, totalExpenses, remainingBudget],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Project management functions
function loadProjects() {
    const projectsTable = elements.projectsTable;
    projectsTable.innerHTML = '';
    
    state.projects.forEach(project => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${project.name}</td>
            <td>${project.location}</td>
            <td>${parseFloat(project.budget).toLocaleString()}</td>
            <td>${formatDate(project.startDate)}</td>
            <td>${formatDate(project.endDate)}</td>
            <td><span class="status-badge ${project.status}">${project.status === 'ongoing' ? 'Ongoing' : 'Completed'}</span></td>
            <td>
                <button class="action-btn edit-btn" data-id="${project.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${project.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        projectsTable.appendChild(row);
    });
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.getAttribute('data-id');
            editProject(projectId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.getAttribute('data-id');
            deleteProject(projectId);
        });
    });
    
    // Update project filters in other sections
    updateProjectFilters();
}

function filterProjects() {
    const searchTerm = elements.projectSearch.value.toLowerCase();
    const statusFilter = elements.projectStatusFilter.value;
    
    const filteredProjects = state.projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm) || 
                            project.location.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    const projectsTable = elements.projectsTable;
    projectsTable.innerHTML = '';
    
    filteredProjects.forEach(project => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${project.name}</td>
            <td>${project.location}</td>
            <td>${parseFloat(project.budget).toLocaleString()}</td>
            <td>${formatDate(project.startDate)}</td>
            <td>${formatDate(project.endDate)}</td>
            <td><span class="status-badge ${project.status}">${project.status === 'ongoing' ? 'Ongoing' : 'Completed'}</span></td>
            <td>
                <button class="action-btn edit-btn" data-id="${project.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${project.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        projectsTable.appendChild(row);
    });
    
    // Reattach event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.getAttribute('data-id');
            editProject(projectId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.getAttribute('data-id');
            deleteProject(projectId);
        });
    });
}

function openProjectModal(project = null) {
    const modal = elements.modals.project;
    const form = elements.projectForm;
    
    if (project) {
        // Edit mode
        document.getElementById('project-modal-title').textContent = 'Edit Project';
        document.getElementById('project-id').value = project.id;
        document.getElementById('project-name').value = project.name;
        document.getElementById('project-location').value = project.location;
        document.getElementById('project-budget-input').value = project.budget;
        document.getElementById('project-start-date').value = project.startDate;
        document.getElementById('project-end-date').value = project.endDate;
        document.getElementById('project-status').value = project.status;
    } else {
        // Add mode
        document.getElementById('project-modal-title').textContent = 'Add New Project';
        form.reset();
        document.getElementById('project-id').value = '';
        document.getElementById('project-start-date').valueAsDate = new Date();
        
        // Set end date to 30 days from now
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        document.getElementById('project-end-date').valueAsDate = endDate;
    }
    
    modal.style.display = 'flex';
}

function editProject(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
        openProjectModal(project);
    }
}

function deleteProject(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;

    if (confirm(`Are you sure you want to delete the project "${project.name}"?`)) {
        // Automatically unassign workers from this project
        state.workers.forEach(worker => {
            if (worker.assignedProject === projectId) {
                worker.assignedProject = null;
            }
        });

        // Automatically delete related expenses
        state.expenses = state.expenses.filter(expense => expense.projectId !== projectId);

        // Delete the project
        state.projects = state.projects.filter(p => p.id !== projectId);
        
        saveData(['projects', 'workers', 'expenses']);
        loadProjects();
        loadWorkers();
        loadDashboard();
        loadExpenses();
        showNotification('Project and related data deleted successfully');
    }
}
function handleProjectFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const projectId = form.querySelector('#project-id').value;
    const name = form.querySelector('#project-name').value;
    const location = form.querySelector('#project-location').value;
    const budget = form.querySelector('#project-budget-input').value;
    const startDate = form.querySelector('#project-start-date').value;
    const endDate = form.querySelector('#project-end-date').value;
    const status = form.querySelector('#project-status').value;
    
    if (new Date(endDate) < new Date(startDate)) {
        alert('End date cannot be before start date');
        return;
    }
    
    const projectData = {
        id: projectId || generateId(),
        name,
        location,
        budget,
        startDate,
        endDate,
        status
    };
    
    if (projectId) {
        // Update existing project
        const index = state.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            state.projects[index] = projectData;
        }
    } else {
        // Add new project
        state.projects.push(projectData);
    }
    
    saveData('projects');
    closeAllModals();
    loadProjects();
    loadDashboard();
    updateProjectFilters();
    showNotification(`Project ${projectId ? 'updated' : 'added'} successfully`);
}

// Worker management functions
function loadWorkers() {
    const workersTable = elements.workersTable;
    workersTable.innerHTML = '';
    
    state.workers.forEach(worker => {
        const assignedProject = worker.assignedProject ? 
            state.projects.find(p => p.id === worker.assignedProject)?.name || 'Unassigned' : 
            'Unassigned';
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${worker.id}</td>
            <td>${worker.name}</td>
            <td>${capitalizeFirstLetter(worker.type)}</td>
            <td>${assignedProject}</td>
            <td>${parseFloat(worker.dailySalary).toLocaleString()}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${worker.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${worker.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        workersTable.appendChild(row);
    });
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const workerId = btn.getAttribute('data-id');
            editWorker(workerId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const workerId = btn.getAttribute('data-id');
            deleteWorker(workerId);
        });
    });
}

function filterWorkers() {
    const searchTerm = elements.workerSearch.value.toLowerCase();
    const typeFilter = elements.workerTypeFilter.value;
    
    const filteredWorkers = state.workers.filter(worker => {
        const matchesSearch = worker.name.toLowerCase().includes(searchTerm) || 
                            worker.id.toLowerCase().includes(searchTerm);
        const matchesType = typeFilter === 'all' || worker.type === typeFilter;
        return matchesSearch && matchesType;
    });
    
    const workersTable = elements.workersTable;
    workersTable.innerHTML = '';
    
    filteredWorkers.forEach(worker => {
        const assignedProject = worker.assignedProject ? 
            state.projects.find(p => p.id === worker.assignedProject)?.name || 'Unassigned' : 
            'Unassigned';
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${worker.id}</td>
            <td>${worker.name}</td>
            <td>${capitalizeFirstLetter(worker.type)}</td>
            <td>${assignedProject}</td>
            <td>${parseFloat(worker.dailySalary).toLocaleString()}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${worker.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${worker.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        workersTable.appendChild(row);
    });
    
    // Reattach event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const workerId = btn.getAttribute('data-id');
            editWorker(workerId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const workerId = btn.getAttribute('data-id');
            deleteWorker(workerId);
        });
    });
}

function openWorkerModal(worker = null) {
    const modal = elements.modals.worker;
    const form = elements.workerForm;
    
    // Populate projects dropdown
    const projectSelect = document.getElementById('worker-assigned-project');
    projectSelect.innerHTML = '<option value="">Not assigned</option>';
    
    state.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
    });
    
    if (worker) {
        // Edit mode
        document.getElementById('worker-modal-title').textContent = 'Edit Worker';
        document.getElementById('worker-id').value = worker.id;
        document.getElementById('worker-name').value = worker.name;
        document.getElementById('worker-type').value = worker.type;
        document.getElementById('worker-daily-salary').value = worker.dailySalary;
        document.getElementById('worker-assigned-project').value = worker.assignedProject || '';
    } else {
        // Add mode
        document.getElementById('worker-modal-title').textContent = 'Add New Worker';
        form.reset();
        document.getElementById('worker-id').value = '';
        document.getElementById('worker-type').value = 'mason';
        document.getElementById('worker-daily-salary').value = '1500';
    }
    
    modal.style.display = 'flex';
}

function editWorker(workerId) {
    const worker = state.workers.find(w => w.id === workerId);
    if (worker) {
        openWorkerModal(worker);
    }
}

function deleteWorker(workerId) {
    const worker = state.workers.find(w => w.id === workerId);
    if (!worker) return;

    if (confirm(`Are you sure you want to delete worker "${worker.name}"?`)) {
        // Automatically delete attendance records
        state.attendance = state.attendance.filter(record => record.workerId !== workerId);
        
        // Automatically delete salary records
        state.salaries = state.salaries.filter(salary => salary.workerId !== workerId);
        
        // Delete the worker
        state.workers = state.workers.filter(w => w.id !== workerId);
        
        saveData(['workers', 'attendance', 'salaries']);
        loadWorkers();
        loadAttendance();
        loadSalaries();
        showNotification('Worker and related records deleted successfully');
    }
}
function handleWorkerFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const workerId = form.querySelector('#worker-id').value;
    const name = form.querySelector('#worker-name').value;
    const type = form.querySelector('#worker-type').value;
    const dailySalary = form.querySelector('#worker-daily-salary').value;
    const assignedProject = form.querySelector('#worker-assigned-project').value || null;
    
    const workerData = {
        id: workerId || `WRK-${generateId().slice(0, 8)}`,
        name,
        type,
        dailySalary,
        assignedProject
    };
    
    if (workerId) {
        // Update existing worker
        const index = state.workers.findIndex(w => w.id === workerId);
        if (index !== -1) {
            state.workers[index] = workerData;
        }
    } else {
        // Add new worker
        state.workers.push(workerData);
    }
    
    saveData('workers');
    closeAllModals();
    loadWorkers();
    loadDashboard();
    showNotification(`Worker ${workerId ? 'updated' : 'added'} successfully`);
}

function loadAttendance() {
    const attendanceTable = elements.attendanceTable;
    attendanceTable.innerHTML = '';
    
    const month = elements.attendanceMonth.value;
    const projectFilter = elements.attendanceProjectFilter.value;
    
    // Filter workers based on project filter
    let workersToShow = state.workers;
    if (projectFilter !== 'all') {
        workersToShow = state.workers.filter(worker => worker.assignedProject === projectFilter);
    }
    
    // Get all attendance records for the selected month
    const monthlyRecords = state.attendance.filter(record => record.date.startsWith(month));
    
    workersToShow.forEach(worker => {
        // Filter records for this worker
        const workerRecords = monthlyRecords.filter(record => record.workerId === worker.id);
        
        // Group by status
        const statusCounts = {
            present: 0,
            absent: 0,
            halfDay: 0
        };
        
        workerRecords.forEach(record => {
            if (record.status === 'present') statusCounts.present++;
            else if (record.status === 'absent') statusCounts.absent++;
            else if (record.status === 'half-day') statusCounts.halfDay++;
        });
        
        const totalWorkingDays = statusCounts.present + (statusCounts.halfDay * 0.5);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${worker.id}</td>
            <td>${worker.name}</td>
            <td>${capitalizeFirstLetter(worker.type)}</td>
            <td>${worker.assignedProject ? state.projects.find(p => p.id === worker.assignedProject)?.name || 'Unassigned' : 'Unassigned'}</td>
            <td>${statusCounts.present}</td>
            <td>${statusCounts.absent}</td>
            <td>${statusCounts.halfDay}</td>
            <td>${totalWorkingDays}</td>
            <td>
                <button class="action-btn view-attendance-btn" data-worker-id="${worker.id}">
                    <i class="fas fa-calendar-alt"></i>
                </button>
            </td>
        `;
        attendanceTable.appendChild(row);
    });
    
    // Add event listeners to view attendance buttons
    document.querySelectorAll('.view-attendance-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const workerId = btn.getAttribute('data-worker-id');
            showAttendanceDetails(workerId, month);
        });
    });
}
function showAttendanceDetails(workerId, month) {
    const worker = state.workers.find(w => w.id === workerId);
    if (!worker) return;
    
    // Create a modal for attendance details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <span class="close-modal">&times;</span>
            <h3>Attendance Details for ${worker.name}</h3>
            <p>Month: ${month}</p>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="attendance-details-body">
                        <!-- Records will be inserted here -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Populate the table
    const tbody = document.getElementById('attendance-details-body');
    const workerRecords = state.attendance.filter(record => 
        record.workerId === workerId && record.date.startsWith(month)
    );
    
    workerRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(record.date)}</td>
            <td>${capitalizeFirstLetter(record.status)}</td>
            <td>
                <button class="action-btn delete-attendance-btn" data-record-id="${record.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-attendance-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const recordId = btn.getAttribute('data-record-id');
            deleteAttendanceRecord(recordId);
        });
    });
    
    // Add close modal functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    modal.style.display = 'flex';
}

function deleteAttendanceRecord(recordId) {
    if (confirm('Are you sure you want to delete this attendance record?')) {
        state.attendance = state.attendance.filter(record => record.id !== recordId);
        saveData('attendance');
        loadAttendance();
        showNotification('Attendance record deleted successfully');
        
        // Close the modal if this was the last record
        const modal = document.querySelector('.modal');
        if (modal && state.attendance.filter(r => r.id === recordId).length === 0) {
            document.body.removeChild(modal);
        }
    }
}

function openAttendanceModal() {
    const modal = elements.modals.attendance;
    const table = document.getElementById('mark-attendance-table').querySelector('tbody');
    table.innerHTML = '';
    
    // Set default date to today
    document.getElementById('attendance-date').valueAsDate = new Date();
    
    // Add workers to the table
    state.workers.forEach(worker => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${worker.id}</td>
            <td>${worker.name}</td>
            <td>${worker.assignedProject ? state.projects.find(p => p.id === worker.assignedProject)?.name || 'Unassigned' : 'Unassigned'}</td>
            <td>
                <select class="attendance-status" data-worker-id="${worker.id}">
                    <option value="present">Present</option>
                    <option value="half-day">Half Day</option>
                    <option value="absent">Absent</option>
                </select>
            </td>
        `;
        
        table.appendChild(row);
    });
    
    modal.style.display = 'flex';
}

function saveAttendance() {
    const date = document.getElementById('attendance-date').value;
    const statusSelects = document.querySelectorAll('.attendance-status');
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    // Remove existing records for this date if any
    state.attendance = state.attendance.filter(record => record.date !== date);
    
    // Add new records
    statusSelects.forEach(select => {
        const workerId = select.getAttribute('data-worker-id');
        const status = select.value;
        
        if (workerId && status) {
            state.attendance.push({
                id: generateId(),
                workerId,
                date,
                status
            });
        }
    });
    
    saveData('attendance');
    closeAllModals();
    loadAttendance();
    showNotification('Attendance marked successfully');
}

// Salary functions
function loadSalaries() {
    const salaryTable = elements.salaryTable;
    salaryTable.innerHTML = '';
    
    const month = elements.salaryMonth.value;
    
    const filteredSalaries = state.salaries.filter(salary => 
        salary.month === month
    );
    
    let totalPayable = 0;
    let totalOvertime = 0;
    
    filteredSalaries.forEach(salary => {
        const worker = state.workers.find(w => w.id === salary.workerId);
        if (!worker) return;
        
        totalPayable += parseFloat(salary.totalPayable);
        totalOvertime += parseFloat(salary.overtimePay);
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${worker.id}</td>
            <td>${worker.name}</td>
            <td>${capitalizeFirstLetter(worker.type)}</td>
            <td>${parseFloat(worker.dailySalary).toLocaleString()}</td>
            <td>${salary.workingDays}</td>
            <td>
                ${salary.overtimeHours}
                <button class="action-btn edit-overtime-btn" data-salary-id="${salary.id}">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
            <td>${parseFloat(salary.overtimePay).toLocaleString()}</td>
            <td>${parseFloat(salary.totalPayable).toLocaleString()}</td>
            <td><span class="status-badge ${salary.status}">${capitalizeFirstLetter(salary.status)}</span></td>
            <td>
                <button class="action-btn pay-btn" data-salary-id="${salary.id}">
                    <i class="fas fa-money-bill-wave"></i>
                </button>
            </td>
        `;
        
        salaryTable.appendChild(row);
    });
    
    // Update summary
    elements.totalPayable.textContent = `PKR ${totalPayable.toLocaleString()}`;
    elements.workersCount.textContent = filteredSalaries.length;
    elements.overtimeAmount.textContent = `PKR ${totalOvertime.toLocaleString()}`;
    
    // Add event listeners
    document.querySelectorAll('.edit-overtime-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const salaryId = btn.getAttribute('data-salary-id');
            editOvertime(salaryId);
        });
    });
    
    document.querySelectorAll('.pay-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const salaryId = btn.getAttribute('data-salary-id');
            markSalaryAsPaid(salaryId);
        });
    });
}
function calculateSalaries() {
    const month = elements.salaryMonth.value;
    if (!month) {
        alert('Please select a month');
        return;
    }
    
    // Remove existing salaries for this month
    state.salaries = state.salaries.filter(salary => salary.month !== month);
    
    // Calculate attendance for each worker
    const attendanceByWorker = {};
    
    state.attendance.forEach(record => {
        if (record.date.startsWith(month)) {
            if (!attendanceByWorker[record.workerId]) {
                attendanceByWorker[record.workerId] = {
                    present: 0,
                    halfDay: 0
                };
            }
            
            if (record.status === 'present') attendanceByWorker[record.workerId].present++;
            else if (record.status === 'half-day') attendanceByWorker[record.workerId].halfDay++;
        }
    });
    
    // Calculate salary for each worker
    state.workers.forEach(worker => {
        const workerAttendance = attendanceByWorker[worker.id] || {
            present: 0,
            halfDay: 0
        };
        
        const workingDays = workerAttendance.present + (workerAttendance.halfDay * 0.5);
        const basicSalary = workingDays * parseFloat(worker.dailySalary);
        
        // Initialize overtime as 0 - will be editable later
        const overtimeHours = 0;
        const overtimeRate = parseFloat(worker.dailySalary) / 8; // Assuming 8-hour day
        const overtimePay = 0;
        
        const totalPayable = basicSalary + overtimePay;
        
        state.salaries.push({
            id: generateId(),
            workerId: worker.id,
            month,
            workingDays,
            overtimeHours,
            overtimePay,
            basicSalary,
            totalPayable,
            status: 'pending'
        });
    });
    
    saveData('salaries');
    loadSalaries();
    showNotification('Salaries calculated successfully');
}
function editOvertime(salaryId) {
    const salary = state.salaries.find(s => s.id === salaryId);
    if (!salary) return;
    
    const worker = state.workers.find(w => w.id === salary.workerId);
    if (!worker) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close-modal">&times;</span>
            <h3>Edit Overtime for ${worker.name}</h3>
            <div class="form-group">
                <label for="overtime-hours">Overtime Hours</label>
                <input type="number" id="overtime-hours" min="0" step="0.5" value="${salary.overtimeHours}">
            </div>
            <div class="form-actions">
                <button id="save-overtime-btn" class="btn-primary">Save</button>
                <button class="btn-secondary close-modal">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add close modal functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Save overtime
    document.getElementById('save-overtime-btn').addEventListener('click', () => {
        const overtimeHours = parseFloat(document.getElementById('overtime-hours').value) || 0;
        const overtimeRate = parseFloat(worker.dailySalary) / 8;
        const overtimePay = overtimeHours * overtimeRate;
        
        salary.overtimeHours = overtimeHours;
        salary.overtimePay = overtimePay;
        salary.totalPayable = salary.basicSalary + overtimePay;
        
        saveData('salaries');
        loadSalaries();
        document.body.removeChild(modal);
        showNotification('Overtime updated successfully');
    });
    
    modal.style.display = 'flex';
}

function markSalaryAsPaid(salaryId) {
    const salary = state.salaries.find(s => s.id === salaryId);
    if (salary) {
        salary.status = 'paid';
        saveData('salaries');
        loadSalaries();
        showNotification('Salary marked as paid');
    }
}

// Expenses functions
function loadExpenses() {
    const expensesTable = elements.expensesTable;
    expensesTable.innerHTML = '';
    
    const projectFilter = elements.expenseProjectFilter.value;
    const categoryFilter = elements.expenseCategoryFilter.value;
    const monthFilter = elements.expenseMonthFilter.value;
    
    const filteredExpenses = state.expenses.filter(expense => {
        const matchesProject = projectFilter === 'all' || expense.projectId === projectFilter;
        const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
        const matchesMonth = !monthFilter || expense.date.startsWith(monthFilter);
        return matchesProject && matchesCategory && matchesMonth;
    });
    
    filteredExpenses.forEach(expense => {
        const project = state.projects.find(p => p.id === expense.projectId);
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${project?.name || 'Unassigned'}</td>
            <td>${capitalizeFirstLetter(expense.category)}</td>
            <td>${expense.description || '-'}</td>
            <td>${parseFloat(expense.amount).toLocaleString()}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${expense.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${expense.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        expensesTable.appendChild(row);
    });
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const expenseId = btn.getAttribute('data-id');
            editExpense(expenseId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const expenseId = btn.getAttribute('data-id');
            deleteExpense(expenseId);
        });
    });
}

function filterExpenses() {
    loadExpenses();
}

function openExpenseModal(expense = null) {
    const modal = elements.modals.expense;
    const form = elements.expenseForm;
    
    // Populate projects dropdown
    const projectSelect = document.getElementById('expense-project');
    projectSelect.innerHTML = '<option value="">Select a project...</option>';
    
    state.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
    });
    
    if (expense) {
        // Edit mode
        document.getElementById('expense-modal-title').textContent = 'Edit Expense';
        document.getElementById('expense-id').value = expense.id;
        document.getElementById('expense-date').value = expense.date;
        document.getElementById('expense-project').value = expense.projectId;
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-description').value = expense.description || '';
    } else {
        // Add mode
        document.getElementById('expense-modal-title').textContent = 'Add New Expense';
        form.reset();
        document.getElementById('expense-id').value = '';
        document.getElementById('expense-date').valueAsDate = new Date();
        document.getElementById('expense-category').value = 'materials';
        document.getElementById('expense-amount').value = '';
    }
    
    modal.style.display = 'flex';
}

function editExpense(expenseId) {
    const expense = state.expenses.find(e => e.id === expenseId);
    if (expense) {
        openExpenseModal(expense);
    }
}

function deleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
        state.expenses = state.expenses.filter(e => e.id !== expenseId);
        saveData('expenses');
        loadExpenses();
        loadDashboard();
        showNotification('Expense deleted successfully');
    }
}

function handleExpenseFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const expenseId = form.querySelector('#expense-id').value;
    const date = form.querySelector('#expense-date').value;
    const projectId = form.querySelector('#expense-project').value;
    const category = form.querySelector('#expense-category').value;
    const amount = form.querySelector('#expense-amount').value;
    const description = form.querySelector('#expense-description').value;
    
    if (!projectId) {
        alert('Please select a project');
        return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    const expenseData = {
        id: expenseId || generateId(),
        date,
        projectId,
        category,
        amount,
        description
    };
    
    if (expenseId) {
        // Update existing expense
        const index = state.expenses.findIndex(e => e.id === expenseId);
        if (index !== -1) {
            state.expenses[index] = expenseData;
        }
    } else {
        // Add new expense
        state.expenses.push(expenseData);
    }
    
    saveData('expenses');
    closeAllModals();
    loadExpenses();
    loadDashboard();
    showNotification(`Expense ${expenseId ? 'updated' : 'added'} successfully`);
}

// Budget functions
function loadBudgetProjects() {
    const selector = elements.budgetProjectSelector;
    selector.innerHTML = '<option value="">Select a project...</option>';
    
    state.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        selector.appendChild(option);
    });
}

function loadBudgetDetails() {
    const projectId = elements.budgetProjectSelector.value;
    
    if (!projectId) {
        elements.budgetDetails.style.display = 'none';
        return;
    }
    
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Calculate project expenses
    const projectExpenses = state.expenses
        .filter(expense => expense.projectId === projectId)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const remainingBudget = parseFloat(project.budget) - projectExpenses;
    const utilization = (projectExpenses / parseFloat(project.budget)) * 100;
    
    // Update summary
    elements.projectBudget.textContent = `PKR ${parseFloat(project.budget).toLocaleString()}`;
    elements.projectExpenses.textContent = `PKR ${projectExpenses.toLocaleString()}`;
    elements.remainingBudget.textContent = `PKR ${remainingBudget.toLocaleString()}`;
    elements.budgetUtilization.textContent = `${utilization.toFixed(2)}%`;
    
    // Create charts
    createProjectBudgetChart(project.budget, projectExpenses);
    createExpenseCategoriesChart(projectId);
    
    elements.budgetDetails.style.display = 'block';
}

function createProjectBudgetChart(budget, expenses) {
    const ctx = elements.projectBudgetChart.getContext('2d');
    
    if (charts.projectBudgetChart) {
        charts.projectBudgetChart.destroy();
    }
    
    charts.projectBudgetChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Budget', 'Expenses', 'Remaining'],
            datasets: [{
                label: 'Amount (PKR)',
                data: [budget, expenses, budget - expenses],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function createExpenseCategoriesChart(projectId) {
    const ctx = elements.expenseCategoriesChart.getContext('2d');
    
    // Calculate expenses by category
    const categories = {
        materials: 0,
        labor: 0,
        equipment: 0,
        transport: 0,
        other: 0
    };
    
    state.expenses
        .filter(expense => expense.projectId === projectId)
        .forEach(expense => {
            categories[expense.category] += parseFloat(expense.amount);
        });
    
    if (charts.expenseCategoriesChart) {
        charts.expenseCategoriesChart.destroy();
    }
    
    charts.expenseCategoriesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories).map(c => capitalizeFirstLetter(c)),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function showNotification(message) {
    elements.notificationMessage.textContent = message;
    elements.notification.classList.add('show');
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

function saveData(key) {
    localStorage.setItem(key, JSON.stringify(state[key]));
}
// Modified saveData function that can handle all cases
function saveData(dataType) {
    if (Array.isArray(dataType)) {
        // Handle array of data types (bulk save)
        dataType.forEach(type => {
            localStorage.setItem(type, JSON.stringify(state[type]));
        });
    } else if (dataType === 'all') {
        // Save all data at once
        Object.keys(state).forEach(key => {
            localStorage.setItem(key, JSON.stringify(state[key]));
        });
    } else {
        // Save single data type
        localStorage.setItem(dataType, JSON.stringify(state[dataType]));
    }
}

function updateProjectFilters() {
    // Update project filters in all sections
    const projectSelectors = [
        elements.attendanceProjectFilter,
        elements.expenseProjectFilter,
        document.getElementById('worker-assigned-project'),
        document.getElementById('expense-project')
    ];
    
    projectSelectors.forEach(selector => {
        if (!selector) return;
        
        const currentValue = selector.value;
        selector.innerHTML = '<option value="all">All Projects</option>';
        
        state.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            selector.appendChild(option);
        });
        
        // Restore selected value if it still exists
        if (currentValue && state.projects.some(p => p.id === currentValue)) {
            selector.value = currentValue;
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
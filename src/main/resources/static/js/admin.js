const API = window.location.origin + '/api/admin';

// Load user info from session/localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');

let currentTab = 'users';

function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');

    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Section').classList.add('active');

    currentTab = tabName;

    // Load data for the selected tab
    switch (tabName) {
        case 'users':
            loadUsers();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'departments':
            loadDepartments();
            break;
        case 'documents':
            loadDocuments();
            break;
        case 'plans':
            loadPlans();
            break;
        case 'tables':
            loadTables();
            break;
    }
}

async function loadUsers() {
    if (!document.getElementById('usersSection').classList.contains('active')) return;

    try {
        const response = await fetch(`${API}/users`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        const tbody = document.getElementById('usersBody');
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">Нет пользователей</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="editUser(${user.id}, '${user.username}', '${user.role}')">Редактировать</button>
                        <button class="action-btn delete-btn" onclick="deleteUser(${user.id})">Удалить</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        showError('usersBody', 'Ошибка загрузки пользователей: ' + error.message, 4);
    }
}

async function createUser(userData) {
    try {
        const response = await fetch(`${API}/users`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('Пользователь успешно создан!');
            loadUsers();
            return true;
        } else {
            const errorData = await response.json();
            alert('Ошибка при создании пользователя: ' + (errorData.error || 'Неизвестная ошибка'));
            return false;
        }
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Ошибка при создании пользователя: ' + error.message);
        return false;
    }
}

async function updateUser(userId, userData) {
    try {
        const response = await fetch(`${API}/users/${userId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('Пользователь успешно обновлен!');
            loadUsers();
            return true;
        } else {
            const errorData = await response.json();
            alert('Ошибка при обновлении пользователя: ' + (errorData.error || 'Неизвестная ошибка'));
            return false;
        }
    } catch (error) {
        console.error('Error updating user:', error);
        alert('Ошибка при обновлении пользователя: ' + error.message);
        return false;
    }
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`${API}/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Пользователь успешно удален!');
            loadUsers();
            return true;
        } else {
            const errorData = await response.json();
            alert('Ошибка при удалении пользователя: ' + (errorData.error || 'Неизвестная ошибка'));
            return false;
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Ошибка при удалении пользователя: ' + error.message);
        return false;
    }
}

async function loadOrders() {
    if (!document.getElementById('ordersSection').classList.contains('active')) return;

    try {
        const response = await fetch(`${API}/orders`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();
        const tbody = document.getElementById('ordersBody');
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-message">Нет заказов</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${formatDate(order.creation_date)}</td>
                <td>${order.customer_name}</td>
                <td>${order.order_content}</td>
                <td>${order.status}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="editOrder(${order.id})">Редактировать</button>
                        <button class="action-btn delete-btn" onclick="deleteOrder(${order.id})">Удалить</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('ordersBody', 'Ошибка загрузки заказов: ' + error.message, 6);
    }
}

async function loadDepartments() {
    if (!document.getElementById('departmentsSection').classList.contains('active')) return;

    try {
        const response = await fetch(`${API}/departments`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const departments = await response.json();
        const tbody = document.getElementById('departmentsBody');
        tbody.innerHTML = '';

        if (departments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">Нет отделов</td></tr>';
            return;
        }

        departments.forEach(dept => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dept.id}</td>
                <td>${dept.name}</td>
                <td>${dept.type}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="editDepartment(${dept.id}, '${dept.name}', '${dept.type}')">Редактировать</button>
                        <button class="action-btn delete-btn" onclick="deleteDepartment(${dept.id})">Удалить</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading departments:', error);
        showError('departmentsBody', 'Ошибка загрузки отделов: ' + error.message, 4);
    }
}

async function loadDocuments() {
    if (!document.getElementById('documentsSection').classList.contains('active')) return;

    try {
        const response = await fetch(`${API}/documents`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const documents = await response.json();
        const tbody = document.getElementById('documentsBody');
        tbody.innerHTML = '';

        if (documents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Нет документов</td></tr>';
            return;
        }

        documents.forEach(doc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${doc.id}</td>
                <td>${doc.name}</td>
                <td>${doc.content}</td>
                <td>${formatDate(doc.creation_date)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="editDocument(${doc.id})">Редактировать</button>
                        <button class="action-btn delete-btn" onclick="deleteDocument(${doc.id})">Удалить</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading documents:', error);
        showError('documentsBody', 'Ошибка загрузки документов: ' + error.message, 5);
    }
}

async function loadPlans() {
    if (!document.getElementById('plansSection').classList.contains('active')) return;

    try {
        const response = await fetch(`${API}/plans`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const plans = await response.json();
        const tbody = document.getElementById('plansBody');
        tbody.innerHTML = '';

        if (plans.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">Нет планов</td></tr>';
            return;
        }

        plans.forEach(plan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${plan.id}</td>
                <td>${plan.content}</td>
                <td>${formatDate(plan.creation_date)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="editPlan(${plan.id})">Редактировать</button>
                        <button class="action-btn delete-btn" onclick="deletePlan(${plan.id})">Удалить</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading plans:', error);
        showError('plansBody', 'Ошибка загрузки планов: ' + error.message, 4);
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

function showError(elementId, message, colspan = 1) {
    const tbody = document.getElementById(elementId);
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-message" style="color: red;">${message}</td></tr>`;
}

// User CRUD operations
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('login'),
        password: formData.get('password'),
        role: formData.get('role')
    };

    try {
        const response = await fetch(`${API}/users`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('Пользователь успешно создан!');
            e.target.reset();
            loadUsers();
        } else {
            const errorData = await response.json();
            alert('Ошибка при создании пользователя: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Ошибка при создании пользователя: ' + error.message);
    }
});

function editUser(userId, currentUsername, currentRole) {
    document.getElementById('userFormTitle').textContent = 'Редактировать пользователя';
    document.getElementById('userLogin').value = currentUsername;
    document.getElementById('userPassword').value = ''; // Don't show password
    document.getElementById('userPassword').placeholder = 'Оставьте пустым, чтобы не менять пароль';
    document.getElementById('userRole').value = currentRole;
    document.getElementById('userPassword').required = false;

    // Store editing user ID
    document.getElementById('userForm').dataset.editingId = userId;
}

function resetUserForm() {
    document.getElementById('userFormTitle').textContent = 'Добавить пользователя';
    document.getElementById('userForm').reset();
    document.getElementById('userPassword').required = true;
    document.getElementById('userPassword').placeholder = '';
    delete document.getElementById('userForm').dataset.editingId;
}

// Update form submission handler
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('login'),
        password: formData.get('password'),
        role: formData.get('role')
    };

    const editingId = e.target.dataset.editingId;

    if (editingId) {
        // Update existing user
        const updateData = { username: userData.username, role: userData.role };
        if (userData.password) {
            updateData.password = userData.password;
        }
        const success = await updateUser(editingId, updateData);
        if (success) {
            resetUserForm();
        }
    } else {
        // Create new user
        const success = await createUser(userData);
        if (success) {
            resetUserForm();
        }
    }
});

// Department functions
async function createDepartment(deptData) {
    try {
        const response = await fetch(`${API}/departments`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(deptData)
        });

        if (response.ok) {
            alert('Отдел успешно создан!');
            loadDepartments();
            return true;
        } else {
            const errorData = await response.json();
            alert('Ошибка при создании отдела: ' + (errorData.error || 'Неизвестная ошибка'));
            return false;
        }
    } catch (error) {
        console.error('Error creating department:', error);
        alert('Ошибка при создании отдела: ' + error.message);
        return false;
    }
}

async function updateDepartment(deptId, deptData) {
    try {
        const response = await fetch(`${API}/departments/${deptId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(deptData)
        });

        if (response.ok) {
            alert('Отдел успешно обновлен!');
            loadDepartments();
            return true;
        } else {
            const errorData = await response.json();
            alert('Ошибка при обновлении отдела: ' + (errorData.error || 'Неизвестная ошибка'));
            return false;
        }
    } catch (error) {
        console.error('Error updating department:', error);
        alert('Ошибка при обновлении отдела: ' + error.message);
        return false;
    }
}

async function deleteDepartment(deptId) {
    try {
        const response = await fetch(`${API}/departments/${deptId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Отдел успешно удален!');
            loadDepartments();
            return true;
        } else {
            const errorData = await response.json();
            alert('Ошибка при удалении отдела: ' + (errorData.error || 'Неизвестная ошибка'));
            return false;
        }
    } catch (error) {
        console.error('Error deleting department:', error);
        alert('Ошибка при удалении отдела: ' + error.message);
        return false;
    }
}

function editDepartment(deptId, currentName, currentType) {
    document.getElementById('departmentFormTitle').textContent = 'Редактировать отдел';
    document.getElementById('departmentName').value = currentName;
    document.getElementById('departmentType').value = currentType;

    // Store editing department ID
    document.getElementById('departmentForm').dataset.editingId = deptId;
}

function resetDepartmentForm() {
    document.getElementById('departmentFormTitle').textContent = 'Добавить отдел';
    document.getElementById('departmentForm').reset();
    delete document.getElementById('departmentForm').dataset.editingId;
}

// Update department form submission handler
document.getElementById('departmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const deptData = {
        name: formData.get('name'),
        type: formData.get('type')
    };

    const editingId = e.target.dataset.editingId;

    if (editingId) {
        // Update existing department
        const success = await updateDepartment(editingId, deptData);
        if (success) {
            resetDepartmentForm();
        }
    } else {
        // Create new department
        const success = await createDepartment(deptData);
        if (success) {
            resetDepartmentForm();
        }
    }
});

// Stub functions for other entities
function editOrder(orderId) {
    alert('Редактирование заказов не реализовано в админ панели');
}

function deleteOrder(orderId) {
    alert('Удаление заказов не реализовано в админ панели');
}

function editDocument(docId) {
    alert('Редактирование документов не реализовано в админ панели');
}

function deleteDocument(docId) {
    alert('Удаление документов не реализовано в админ панели');
}

function editPlan(planId) {
    alert('Редактирование планов не реализовано в админ панели');
}

function deletePlan(planId) {
    alert('Удаление планов не реализовано в админ панели');
}

// Department CRUD operations
document.getElementById('departmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const departmentData = {
        name: formData.get('name'),
        type: formData.get('type')
    };

    try {
        const response = await fetch(`${API}/departments`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(departmentData)
        });

        if (response.ok) {
            alert('Отдел успешно создан!');
            e.target.reset();
            loadDepartments();
        } else {
            const errorData = await response.json();
            alert('Ошибка при создании отдела: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error creating department:', error);
        alert('Ошибка при создании отдела: ' + error.message);
    }
});

function editDepartment(deptId, currentName, currentType) {
    document.getElementById('departmentFormTitle').textContent = 'Редактировать отдел';
    document.getElementById('departmentName').value = currentName;
    document.getElementById('departmentType').value = currentType;

    // Change form submit handler for editing
    const form = document.getElementById('departmentForm');
    form.onsubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const departmentData = {
            name: formData.get('name'),
            type: formData.get('type')
        };

        try {
            const response = await fetch(`${API}/departments/${deptId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(departmentData)
            });

            if (response.ok) {
                alert('Отдел успешно обновлен!');
                resetDepartmentForm();
                loadDepartments();
            } else {
                const errorData = await response.json();
                alert('Ошибка при обновлении отдела: ' + (errorData.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Error updating department:', error);
            alert('Ошибка при обновлении отдела: ' + error.message);
        }
    };
}

function resetDepartmentForm() {
    document.getElementById('departmentFormTitle').textContent = 'Добавить отдел';
    document.getElementById('departmentForm').reset();
    document.getElementById('departmentForm').onsubmit = arguments.callee.caller; // Reset to original handler
}

async function deleteDepartment(deptId) {
    if (!confirm('Вы уверены, что хотите удалить этот отдел?')) return;

    try {
        const response = await fetch(`${API}/departments/${deptId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Отдел успешно удален!');
            loadDepartments();
        } else {
            const errorData = await response.json();
            alert('Ошибка при удалении отдела: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error deleting department:', error);
        alert('Ошибка при удалении отдела: ' + error.message);
    }
}

// Stub functions for other entities (implement as needed)
function editOrder(orderId) {
    alert('Функция редактирования заказов будет реализована позже');
}

function deleteOrder(orderId) {
    alert('Функция удаления заказов будет реализована позже');
}

function editDocument(docId) {
    alert('Функция редактирования документов будет реализована позже');
}

function deleteDocument(docId) {
    alert('Функция удаления документов будет реализована позже');
}

function editPlan(planId) {
    alert('Функция редактирования планов будет реализована позже');
}

function deletePlan(planId) {
    alert('Функция удаления планов будет реализована позже');
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти из системы?')) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'main.html';
    }
}

// Generic table management
let currentGenericTable = '';
let genericColumns = [];
let pendingTableSelection = '';

function openTable(tableName) {
    pendingTableSelection = tableName;
    switchTab('tables');
}

function renderTableShortcuts(tables) {
    const list = document.getElementById('dbTablesList');
    if (!list) return;

    list.innerHTML = '';
    tables.forEach(table => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tab-button';
        button.textContent = table;
        button.addEventListener('click', () => openTable(table));
        list.appendChild(button);
    });
}

async function loadTables() {
    try {
        const response = await fetch(`${API}/tables`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tables = await response.json();

        const select = document.getElementById('tableSelect');
        select.innerHTML = '<option value="">Выберите таблицу...</option>';

        // Filter out system tables and show only relevant ones
        const relevantTables = tables.filter(table =>
            !table.startsWith('pg_') &&
            !table.startsWith('sql_') &&
            table !== 'databasechangelog' &&
            table !== 'databasechangeloglock'
        );

        relevantTables.forEach(table => {
            const option = document.createElement('option');
            option.value = table;
            option.textContent = table;
            select.appendChild(option);
        });

        renderTableShortcuts(relevantTables);

        if (pendingTableSelection) {
            const selectedTable = pendingTableSelection;
            pendingTableSelection = '';

            const hasOption = Array.from(select.options).some(option => option.value === selectedTable);
            if (!hasOption) {
                const option = document.createElement('option');
                option.value = selectedTable;
                option.textContent = selectedTable;
                select.appendChild(option);
            }

            select.value = selectedTable;
            loadSelectedTable();
        }
    } catch (error) {
        console.error('Error loading tables:', error);
        alert('Ошибка загрузки таблиц: ' + error.message);
    }
}

async function loadSelectedTable() {
    const tableName = document.getElementById('tableSelect').value;
    if (!tableName) {
        document.getElementById('genericTable').innerHTML = '';
        document.getElementById('genericFormSection').style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API}/table/${tableName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        currentGenericTable = tableName;

        if (data.length === 0) {
            genericColumns = [];
            renderGenericTable([]);
            renderGenericForm();
            return;
        }

        genericColumns = Object.keys(data[0]);
        renderGenericTable(data);
        renderGenericForm();
        document.getElementById('genericFormSection').style.display = 'block';
    } catch (error) {
        console.error('Error loading table:', error);
        alert('Ошибка загрузки данных таблицы: ' + error.message);
    }
}

function renderGenericTable(data) {
    const table = document.getElementById('genericTable');
    table.innerHTML = '';

    if (data.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = genericColumns.length + 1;
        emptyCell.className = 'empty-message';
        emptyCell.textContent = 'Таблица пуста';
        emptyRow.appendChild(emptyCell);
        table.appendChild(emptyRow);
        return;
    }

    const header = document.createElement('tr');
    genericColumns.forEach(c => {
        const th = document.createElement('th');
        th.textContent = c;
        header.appendChild(th);
    });
    const actionsTh = document.createElement('th');
    actionsTh.textContent = 'Действия';
    header.appendChild(actionsTh);
    table.appendChild(header);

    data.forEach(row => {
        const tr = document.createElement('tr');
        genericColumns.forEach(c => {
            const td = document.createElement('td');
            td.textContent = row[c];
            tr.appendChild(td);
        });

        const actionsTd = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Редактировать';
        editBtn.className = 'action-btn edit-btn';
        editBtn.onclick = () => editGenericRow(row);
        actionsTd.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.onclick = () => deleteGenericRow(row);
        actionsTd.appendChild(deleteBtn);

        tr.appendChild(actionsTd);
        table.appendChild(tr);
    });
}

function renderGenericForm(row = null) {
    const container = document.getElementById('genericFormContainer');
    container.innerHTML = '';

    if (genericColumns.length === 0) return;

    genericColumns.forEach(c => {
        const div = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = c + ':';
        label.style.display = 'block';
        label.style.marginBottom = '5px';

        const input = document.createElement('input');
        input.placeholder = c;
        input.id = `generic_f_${c}`;
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.border = '1px solid #ddd';
        input.style.borderRadius = '4px';

        if (row && row[c] !== null) {
            input.value = row[c];
        }

        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    });
}

let editingGenericRow = null;

async function saveGenericRow() {
    try {
        if (genericColumns.length === 0 || !currentGenericTable) {
            alert('Сначала выберите таблицу');
            return;
        }

        const obj = {};
        genericColumns.forEach(c => {
            const value = document.getElementById(`generic_f_${c}`).value;
            obj[c] = value === '' ? null : value;
        });

        if (editingGenericRow) {
            // Update existing row
            const idColumn = genericColumns[0]; // Assume first column is ID
            const idValue = editingGenericRow[idColumn];
            const response = await fetch(`${API}/table/${currentGenericTable}?idColumn=${idColumn}&idValue=${idValue}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(obj)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            editingGenericRow = null;
        } else {
            // Insert new row
            const response = await fetch(`${API}/table/${currentGenericTable}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(obj)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        loadSelectedTable();
        renderGenericForm();
        alert('Запись успешно сохранена');
    } catch (error) {
        console.error('Error saving row:', error);
        alert('Ошибка сохранения: ' + error.message);
    }
}

function cancelGenericEdit() {
    editingGenericRow = null;
    renderGenericForm();
    document.getElementById('genericFormTitle').textContent = 'Добавить новую запись';
}

function editGenericRow(row) {
    editingGenericRow = row;
    renderGenericForm(row);
    document.getElementById('genericFormTitle').textContent = 'Редактировать запись';
}

async function deleteGenericRow(row) {
    try {
        if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;

        const idColumn = genericColumns[0]; // Assume first column is ID
        const idValue = row[idColumn];
        const response = await fetch(`${API}/table/${currentGenericTable}?idColumn=${idColumn}&idValue=${idValue}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        loadSelectedTable();
        alert('Запись успешно удалена');
    } catch (error) {
        console.error('Error deleting row:', error);
        alert('Ошибка удаления: ' + error.message);
    }
}

// Initialize the page
async function init() {
    if (!currentUser.username) {
        alert('Пользователь не найден. Пожалуйста, войдите в систему.');
        window.location.href = 'main.html';
        return;
    }

    // Load initial data
    loadUsers();
}

// Load initial data
init();

function logout() {
    if (confirm('Вы уверены, что хотите выйти из системы?')) {
        // Clear any local storage/session storage if used
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to login page
        window.location.href = 'main.html';
    }
}

// Check authentication and redirect if not logged in
async function checkAuth() {
    try {
        // Try to access admin API to check if authenticated
        const response = await fetch(`${API}/tables`, {
            method: 'HEAD' // Use HEAD to minimize data transfer
        });

        if (response.status === 403) {
            // Not authenticated, redirect to login
            alert('Необходима аутентификация. Перенаправление на страницу входа...');
            window.location.href = 'main.html';
            return false;
        }

        return response.ok;
    } catch (error) {
        console.error('Auth check failed:', error);
        alert('Ошибка проверки аутентификации. Перенаправление на страницу входа...');
        window.location.href = 'main.html';
        return false;
    }
}

// Initialize the page
async function init() {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        await loadTables();
        renderForm();
    }
}

init();

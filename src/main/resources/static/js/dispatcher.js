const API = window.location.origin + '/api/dispatcher';

// Load user info from session/localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');

let currentTab = 'orders';

function switchTab(tabName) {
    console.log('Switching to tab:', tabName);

    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');

    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Section').classList.add('active');

    currentTab = tabName;
    console.log('Tab switched to:', tabName);

    // Load data for the selected tab
    switch (tabName) {
        case 'orders':
            console.log('Loading orders...');
            loadOrders();
            break;
        case 'deptOrders':
            console.log('Loading department orders...');
            loadDepartmentOrders();
            break;
        case 'plans':
            console.log('Loading production plans...');
            loadProductionPlans();
            break;
    }
}

// Form handling for creating department orders
document.addEventListener('DOMContentLoaded', function() {
    // Add form for creating department orders
    const ordersSection = document.getElementById('ordersSection');
    const formHTML = `
        <div class="form-section" id="deptOrderForm" style="display: none;">
            <h3 id="deptOrderFormTitle">Назначить заказ отделу</h3>
            <form id="createDeptOrderForm">
                <div class="form-container">
                    <div>
                        <label for="orderId">ID заказа:</label>
                        <input type="number" id="orderId" name="orderId" readonly>
                    </div>
                    <div>
                        <label for="departmentId">Отдел:</label>
                        <select id="departmentId" name="departmentId" required></select>
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <label for="orderContent">Содержание для отдела:</label>
                        <textarea id="orderContent" name="content" placeholder="Опишите содержание заказа для отдела..." required></textarea>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="submit" class="save-btn">Назначить</button>
                    <button type="button" class="cancel-btn" onclick="hideDeptOrderForm()">Отмена</button>
                </div>
            </form>
        </div>
    `;
    ordersSection.insertAdjacentHTML('beforeend', formHTML);

    // Handle form submission
    document.getElementById('createDeptOrderForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const requestData = {
            orderId: parseInt(formData.get('orderId')),
            departmentId: parseInt(formData.get('departmentId')),
            content: formData.get('content')
        };

        try {
            const response = await fetch(`${API}/department-orders`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                alert('Заказ успешно назначен отделу!');
                hideDeptOrderForm();
                loadDepartmentOrders();
                if (currentTab === 'orders') loadOrders();
            } else {
                const errorData = await response.json();
                alert('Ошибка при назначении заказа отделу: ' + (errorData.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Error creating department order:', error);
            alert('Ошибка при назначении заказа отделу: ' + error.message);
        }
    });
});

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
            tbody.innerHTML = '<tr><td colspan="6" class="empty-message">Нет заказов для распределения</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            const statusClass = getStatusClass(order.status);
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${formatDate(order.creation_date)}</td>
                <td><span class="${statusClass}">${order.status}</span></td>
                <td>${order.customer_name}</td>
                <td>${order.order_content}</td>
                <td>
                    <button class="action-btn assign-btn" onclick="createDepartmentOrder(${order.id})">Назначить отделу</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('ordersBody', 'Ошибка загрузки заказов: ' + error.message);
    }
}

async function loadDepartmentOrders() {
    console.log('Loading department orders...');

    try {
        const response = await fetch(`${API}/department-orders`);
        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const deptOrders = await response.json();
        console.log('Loaded department orders:', deptOrders);

        const tbody = document.getElementById('departmentOrdersBody');
        tbody.innerHTML = '';

        if (deptOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-message">Нет заказов отделений</td></tr>';
            return;
        }

        deptOrders.forEach(order => {
            const row = document.createElement('tr');
            const statusClass = getStatusClass(order.status);
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.order_id}</td>
                <td>${order.department_name}</td>
                <td>${order.content}</td>
                <td>${formatDate(order.creation_date)}</td>
                <td><span class="${statusClass}">${order.status}</span></td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="action-btn edit-btn" onclick="editDepartmentOrder(${order.id}, '${order.content.replace(/'/g, "\\'").replace(/"/g, '\\"')}', '${order.status}')">Редактировать</button>
                        <button class="action-btn delete-btn" onclick="deleteDepartmentOrder(${order.id})">Удалить</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading department orders:', error);
        showError('departmentOrdersBody', 'Ошибка загрузки заказов отделений: ' + error.message);
    }
}

async function loadProductionPlans() {
    if (!document.getElementById('plansSection').classList.contains('active')) return;

    try {
        const response = await fetch(`${API}/production-plans`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const plans = await response.json();
        const tbody = document.getElementById('plansBody');
        tbody.innerHTML = '';

        if (plans.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">Нет производственных планов</td></tr>';
            return;
        }

        plans.forEach(plan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${plan.id}</td>
                <td>${formatDate(plan.creation_date)}</td>
                <td>${formatDate(plan.last_modified)}</td>
                <td>${plan.content}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading production plans:', error);
        showError('plansBody', 'Ошибка загрузки планов: ' + error.message);
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'Принят': return 'status-approved';
        case 'В процессе': return 'status-in-progress';
        case 'Завершен': return 'status-completed';
        default: return '';
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

function showError(elementId, message) {
    const tbody = document.getElementById(elementId);
    const colspan = elementId === 'ordersBody' ? '6' : elementId === 'departmentOrdersBody' ? '7' : '4';
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-message" style="color: red;">${message}</td></tr>`;
}

async function createDepartmentOrder(orderId) {
    try {
        // Load departments for selection
        const deptResponse = await fetch(`${API}/departments`);
        if (!deptResponse.ok) {
            throw new Error('Не удалось загрузить список отделов');
        }

        const departments = await deptResponse.json();

        if (departments.length === 0) {
            alert('Нет доступных отделов');
            return;
        }

        // Populate department dropdown
        const deptSelect = document.getElementById('departmentId');
        deptSelect.innerHTML = '<option value="">Выберите отдел...</option>';
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = `${dept.name} (${dept.type})`;
            deptSelect.appendChild(option);
        });

        // Show form
        document.getElementById('orderId').value = orderId;
        document.getElementById('deptOrderForm').style.display = 'block';
        document.getElementById('deptOrderFormTitle').textContent = 'Назначить заказ отделу';

    } catch (error) {
        console.error('Error loading departments:', error);
        alert('Ошибка при загрузке отделов: ' + error.message);
    }
}

function hideDeptOrderForm() {
    document.getElementById('deptOrderForm').style.display = 'none';
    document.getElementById('createDeptOrderForm').reset();
}

// Form handling for editing department orders
document.addEventListener('DOMContentLoaded', function() {
    // Add form for editing department orders
    const deptOrdersSection = document.getElementById('deptOrdersSection');
    const formHTML = `
        <div class="form-section" id="editDeptOrderForm" style="display: none;">
            <h3>Редактировать заказ отдела</h3>
            <form id="updateDeptOrderForm">
                <div class="form-container">
                    <div style="grid-column: 1 / -1;">
                        <label for="editOrderContent">Содержание:</label>
                        <textarea id="editOrderContent" name="content" required></textarea>
                    </div>
                    <div>
                        <label for="editOrderStatus">Статус:</label>
                        <select id="editOrderStatus" name="status" required>
                            <option value="Новый">Новый</option>
                            <option value="В процессе">В процессе</option>
                            <option value="Завершен">Завершен</option>
                        </select>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="submit" class="save-btn">Сохранить</button>
                    <button type="button" class="cancel-btn" onclick="hideEditDeptOrderForm()">Отмена</button>
                </div>
            </form>
        </div>
    `;
    deptOrdersSection.insertAdjacentHTML('beforeend', formHTML);

    // Handle form submission
    document.getElementById('updateDeptOrderForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const requestData = {
            content: formData.get('content'),
            status: formData.get('status')
        };

        const deptOrderId = e.target.dataset.deptOrderId;

        try {
            const response = await fetch(`${API}/department-orders/${deptOrderId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                alert('Заказ отдела успешно обновлен!');
                hideEditDeptOrderForm();
                loadDepartmentOrders();
            } else {
                const errorData = await response.json();
                alert('Ошибка при обновлении заказа отдела: ' + (errorData.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Error updating department order:', error);
            alert('Ошибка при обновлении заказа отдела: ' + error.message);
        }
    });
});

async function editDepartmentOrder(deptOrderId, currentContent, currentStatus) {
    document.getElementById('editOrderContent').value = currentContent;
    document.getElementById('editOrderStatus').value = currentStatus;
    document.getElementById('updateDeptOrderForm').dataset.deptOrderId = deptOrderId;
    document.getElementById('editDeptOrderForm').style.display = 'block';
}

function hideEditDeptOrderForm() {
    document.getElementById('editDeptOrderForm').style.display = 'none';
    document.getElementById('updateDeptOrderForm').reset();
}

async function deleteDepartmentOrder(deptOrderId) {
    if (!confirm('Вы уверены, что хотите удалить этот заказ отдела?')) return;

    try {
        const response = await fetch(`${API}/department-orders/${deptOrderId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Заказ отдела успешно удален!');
            loadDepartmentOrders();
        } else {
            const errorData = await response.json();
            alert('Ошибка при удалении заказа отдела: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error deleting department order:', error);
        alert('Ошибка при удалении заказа отдела: ' + error.message);
    }
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти из системы?')) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'main.html';
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
    loadOrders();
}

// Load initial data
init();

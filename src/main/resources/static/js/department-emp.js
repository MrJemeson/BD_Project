const API = window.location.origin + '/api/department-employee';

// Load user info from session/localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');

let currentTab = 'orders';

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
        case 'orders':
            loadDepartmentOrders();
            break;
        case 'documents':
            loadAvailableDocumentation();
            break;
    }
}

async function loadDepartmentOrders() {
    if (!document.getElementById('ordersSection').classList.contains('active')) return;

    if (!currentUser.username) {
        showError('departmentOrdersBody', 'Пользователь не найден. Пожалуйста, войдите в систему.');
        return;
    }

    console.log('Loading orders for user:', currentUser.username);
    console.log('Current user object:', currentUser);

    try {
        const response = await fetch(`${API}/orders?username=${encodeURIComponent(currentUser.username)}`);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const orders = await response.json();
        console.log('Loaded orders:', orders);
        console.log('Orders type:', typeof orders, 'Orders length:', orders.length);

        const tbody = document.getElementById('departmentOrdersBody');
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-message">Нет заказов для вашего отдела</td></tr>';
            return;
        }

        orders.forEach(order => {
            console.log('Processing order:', order);
            const row = document.createElement('tr');
            const statusClass = getStatusClass(order.status);
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.order_id}</td>
                <td>${order.content}</td>
                <td>${formatDate(order.creation_date)}</td>
                <td><span class="${statusClass}">${order.status}</span></td>
                <td>${formatDate(order.last_modified)}</td>
                <td>
                    <button class="action-btn update-btn" onclick="updateOrderStatus(${order.id}, '${order.status}')">Обновить статус</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading department orders:', error);
        showError('departmentOrdersBody', 'Ошибка загрузки заказов: ' + error.message);
    }
}

async function loadAvailableDocumentation() {
    if (!document.getElementById('documentsSection').classList.contains('active')) return;

    if (!currentUser.username) {
        showError('documentsBody', 'Пользователь не найден. Пожалуйста, войдите в систему.');
        return;
    }

    try {
        const response = await fetch(`${API}/documentation?username=${currentUser.username}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const documents = await response.json();
        const tbody = document.getElementById('documentsBody');
        tbody.innerHTML = '';

        if (documents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-message">Нет доступной документации</td></tr>';
            return;
        }

        documents.forEach(doc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${doc.id}</td>
                <td>${doc.name}</td>
                <td>${formatDate(doc.creation_date)}</td>
                <td>${formatDate(doc.last_modified)}</td>
                <td>${doc.content}</td>
                <td>${doc.issue_date ? formatDate(doc.issue_date) : 'Не выдана'}</td>
                <td>Доступно</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading available documentation:', error);
        showError('documentsBody', 'Ошибка загрузки документации: ' + error.message);
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'Новый': return 'status-new';
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
    const colspan = elementId === 'departmentOrdersBody' ? '7' : '7';
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-message" style="color: red;">${message}</td></tr>`;
}

// Form handling for updating order status
document.addEventListener('DOMContentLoaded', function() {
    // Add form for updating order status
    const ordersSection = document.getElementById('ordersSection');
    const formHTML = `
        <div class="form-section" id="updateStatusForm" style="display: none;">
            <h3>Обновить статус заказа</h3>
            <form id="changeStatusForm">
                <div class="form-container">
                    <div>
                        <label for="statusOrderId">ID заказа:</label>
                        <input type="number" id="statusOrderId" name="orderId" readonly>
                    </div>
                    <div>
                        <label for="currentStatus">Текущий статус:</label>
                        <input type="text" id="currentStatus" name="currentStatus" readonly>
                    </div>
                    <div>
                        <label for="newStatus">Новый статус:</label>
                        <select id="newStatus" name="status" required>
                            <option value="Новый">Новый</option>
                            <option value="В процессе">В процессе</option>
                            <option value="Завершен">Завершен</option>
                        </select>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="submit" class="save-btn">Обновить статус</button>
                    <button type="button" class="cancel-btn" onclick="hideUpdateStatusForm()">Отмена</button>
                </div>
            </form>
        </div>
    `;
    ordersSection.insertAdjacentHTML('beforeend', formHTML);

    // Handle form submission
    document.getElementById('changeStatusForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const orderId = formData.get('orderId');
        const selectedStatus = formData.get('status');
        const currentStatus = formData.get('currentStatus');

        if (selectedStatus === currentStatus) {
            alert('Статус не изменился');
            return;
        }

        try {
            const response = await fetch(`${API}/orders/${orderId}/status?username=${currentUser.username}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({status: selectedStatus})
            });

            if (response.ok) {
                alert('Статус заказа успешно обновлен!');
                hideUpdateStatusForm();
                loadDepartmentOrders();
            } else {
                const errorData = await response.json();
                alert('Ошибка при обновлении статуса: ' + (errorData.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Ошибка при обновлении статуса: ' + error.message);
        }
    });
});

async function updateOrderStatus(orderId, currentStatus) {
    document.getElementById('statusOrderId').value = orderId;
    document.getElementById('currentStatus').value = currentStatus;
    document.getElementById('newStatus').value = currentStatus;
    document.getElementById('updateStatusForm').style.display = 'block';
}

function hideUpdateStatusForm() {
    document.getElementById('updateStatusForm').style.display = 'none';
    document.getElementById('changeStatusForm').reset();
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
    loadDepartmentOrders();
}

// Load initial data
init();


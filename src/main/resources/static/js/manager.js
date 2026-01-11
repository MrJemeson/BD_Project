const API = window.location.origin + '/api/manager';

// Load user info from session/localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');

let currentTab = 'active';

function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');

    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Handle different section IDs
    let sectionId;
    switch (tabName) {
        case 'active':
            sectionId = 'activeOrdersSection';
            break;
        case 'all':
            sectionId = 'allOrdersSection';
            break;
        case 'plans':
            sectionId = 'plansSection';
            break;
        default:
            sectionId = tabName + 'OrdersSection';
    }
    document.getElementById(sectionId).classList.add('active');

    currentTab = tabName;

    // Load data for the selected tab
    switch (tabName) {
        case 'active':
            loadActiveOrders();
            break;
        case 'all':
            loadAllOrders();
            break;
        case 'plans':
            loadProductionPlans();
            break;
    }
}

async function loadActiveOrders() {
    if (!document.getElementById('activeOrdersSection').classList.contains('active')) return;

    try {
        const response = await fetch(`${API}/active-orders`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();
        const tbody = document.getElementById('activeOrdersBody');
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-message">Нет активных заказов</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            const statusClass = getStatusClass(order.status);
            const actionButtons = getActionButtons(order.id, order.status);

            row.innerHTML = `
                <td>${order.id}</td>
                <td>${formatDate(order.creation_date)}</td>
                <td><span class="${statusClass}">${order.status}</span></td>
                <td>${order.customer_name}</td>
                <td>${order.order_content}</td>
                <td><div class="action-buttons">${actionButtons}</div></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading active orders:', error);
        showError('activeOrdersBody', 'Ошибка загрузки активных заказов: ' + error.message);
    }
}

function getActionButtons(orderId, status) {
    if (status === 'Новый') {
        return `
            <button class="action-btn approve-btn" onclick="approveOrder(${orderId})">Принять</button>
            <button class="action-btn reject-btn" onclick="rejectOrder(${orderId})">Отклонить</button>
        `;
    } else if (status === 'Принят') {
        return `
            <button class="action-btn complete-btn" onclick="completeOrder(${orderId})">Завершить</button>
        `;
    }
    return '';
}

function getStatusClass(status) {
    switch (status) {
        case 'Новый': return 'status-new';
        case 'Принят': return 'status-approved';
        case 'Отклонен': return 'status-rejected';
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
    tbody.innerHTML = `<tr><td colspan="${elementId === 'activeOrdersBody' ? '6' : '5'}" class="empty-message" style="color: red;">${message}</td></tr>`;
}

async function loadAllOrders() {
    if (!document.getElementById('allOrdersSection').classList.contains('active')) return;

    try {
        const response = await fetch(`${API}/all-orders`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();
        const tbody = document.getElementById('allOrdersBody');
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Нет заказов в журнале</td></tr>';
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
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading all orders:', error);
        showError('allOrdersBody', 'Ошибка загрузки журнала заказов: ' + error.message);
    }
}

async function approveOrder(orderId) {
    if (!confirm('Вы уверены, что хотите принять этот заказ?')) return;

    try {
        const response = await fetch(`${API}/orders/${orderId}/approve`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('Заказ успешно принят!');
            loadActiveOrders();
            if (currentTab === 'all') loadAllOrders();
        } else {
            const errorData = await response.json();
            alert('Ошибка при принятии заказа: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error approving order:', error);
        alert('Ошибка при принятии заказа: ' + error.message);
    }
}

async function rejectOrder(orderId) {
    if (!confirm('Вы уверены, что хотите отклонить этот заказ?')) return;

    try {
        const response = await fetch(`${API}/orders/${orderId}/reject`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('Заказ успешно отклонен!');
            loadActiveOrders();
            if (currentTab === 'all') loadAllOrders();
        } else {
            const errorData = await response.json();
            alert('Ошибка при отклонении заказа: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error rejecting order:', error);
        alert('Ошибка при отклонении заказа: ' + error.message);
    }
}

async function completeOrder(orderId) {
    if (!confirm('Вы уверены, что хотите завершить этот заказ?')) return;

    try {
        const response = await fetch(`${API}/orders/${orderId}/complete`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('Заказ успешно завершен!');
            loadActiveOrders();
            if (currentTab === 'all') loadAllOrders();
        } else {
            const errorData = await response.json();
            alert('Ошибка при завершении заказа: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error completing order:', error);
        alert('Ошибка при завершении заказа: ' + error.message);
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
            tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Нет планов производства</td></tr>';
            return;
        }

        plans.forEach(plan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${plan.id}</td>
                <td>${formatDate(plan.creation_date)}</td>
                <td>${formatDate(plan.last_modified)}</td>
                <td>${plan.content}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="editPlan(${plan.id}, '${plan.content.replace(/'/g, "\\'").replace(/"/g, '\\"')}')">Редактировать</button>
                        <button class="action-btn delete-btn" onclick="deletePlan(${plan.id})">Удалить</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading production plans:', error);
        showError('plansBody', 'Ошибка загрузки планов производства: ' + error.message);
    }
}

document.getElementById('newPlanForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const planContent = document.getElementById('planContent').value.trim();

    if (!planContent) {
        alert('Пожалуйста, опишите план производства.');
        return;
    }

    const planData = {
        content: planContent
    };

    try {
        const response = await fetch(`${API}/production-plans`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(planData)
        });

        if (response.ok) {
            alert('План производства создан успешно!');
            e.target.reset();
            loadProductionPlans();
        } else {
            const errorData = await response.json();
            alert('Ошибка при создании плана: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error creating plan:', error);
        alert('Ошибка при создании плана: ' + error.message);
    }
});

// Form handling for editing plans
document.addEventListener('DOMContentLoaded', function() {
    // Add form for editing plans
    const plansSection = document.getElementById('plansSection');
    const formHTML = `
        <div class="form-section" id="editPlanForm" style="display: none;">
            <h3>Редактировать план производства</h3>
            <form id="updatePlanForm">
                <div class="form-container">
                    <div style="grid-column: 1 / -1;">
                        <label for="editPlanContent">Содержание плана:</label>
                        <textarea id="editPlanContent" name="content" required></textarea>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="submit" class="save-btn">Сохранить</button>
                    <button type="button" class="cancel-btn" onclick="hideEditPlanForm()">Отмена</button>
                </div>
            </form>
        </div>
    `;
    plansSection.insertAdjacentHTML('beforeend', formHTML);

    // Handle form submission
    document.getElementById('updatePlanForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const requestData = {
            content: formData.get('content')
        };

        const planId = e.target.dataset.planId;

        try {
            const response = await fetch(`${API}/production-plans/${planId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                alert('План производства успешно обновлен!');
                hideEditPlanForm();
                loadProductionPlans();
            } else {
                const errorData = await response.json();
                alert('Ошибка при обновлении плана: ' + (errorData.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Error updating plan:', error);
            alert('Ошибка при обновлении плана: ' + error.message);
        }
    });
});

async function editPlan(planId, currentContent) {
    document.getElementById('editPlanContent').value = currentContent;
    document.getElementById('updatePlanForm').dataset.planId = planId;
    document.getElementById('editPlanForm').style.display = 'block';
}

function hideEditPlanForm() {
    document.getElementById('editPlanForm').style.display = 'none';
    document.getElementById('updatePlanForm').reset();
}

async function deletePlan(planId) {
    if (!confirm('Вы уверены, что хотите удалить этот план производства?')) return;

    try {
        const response = await fetch(`${API}/production-plans/${planId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('План производства удален!');
            loadProductionPlans();
        } else {
            const errorData = await response.json();
            alert('Ошибка при удалении плана: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error deleting plan:', error);
        alert('Ошибка при удалении плана: ' + error.message);
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
    loadActiveOrders();
}

// Load initial data
init();


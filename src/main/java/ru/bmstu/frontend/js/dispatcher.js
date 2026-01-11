const API = 'http://localhost:8081/api/dispatcher';

// Load user info from session/localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

async function loadOrders() {
    try {
        const response = await fetch(`${API}/orders`);
        const orders = await response.json();

        const tbody = document.getElementById('ordersBody');
        tbody.innerHTML = '';

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.creation_date}</td>
                <td>${order.status}</td>
                <td>${order.customer_name}</td>
                <td>${order.order_content}</td>
                <td>
                    <button onclick="createDepartmentOrder(${order.id})">Назначить отделу</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function loadDepartmentOrders() {
    try {
        const response = await fetch(`${API}/department-orders`);
        const deptOrders = await response.json();

        const tbody = document.getElementById('departmentOrdersBody');
        tbody.innerHTML = '';

        deptOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.order_id}</td>
                <td>${order.department_name}</td>
                <td>${order.content}</td>
                <td>${order.creation_date}</td>
                <td>${order.status}</td>
                <td>
                    <button onclick="editDepartmentOrder(${order.id}, '${order.content.replace(/'/g, "\\'")}', '${order.status}')">Редактировать</button>
                    <button onclick="deleteDepartmentOrder(${order.id})">Удалить</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading department orders:', error);
    }
}

async function loadProductionPlans() {
    try {
        const response = await fetch(`${API}/production-plans`);
        const plans = await response.json();

        const tbody = document.getElementById('plansBody');
        tbody.innerHTML = '';

        plans.forEach(plan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${plan.id}</td>
                <td>${plan.creation_date}</td>
                <td>${plan.last_modified}</td>
                <td>${plan.content}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading production plans:', error);
    }
}

async function createDepartmentOrder(orderId) {
    // Load departments for selection
    const deptResponse = await fetch(`${API}/departments`);
    const departments = await deptResponse.json();

    const deptOptions = departments.map(dept => `<option value="${dept.id}">${dept.name} (${dept.type})</option>`).join('');

    const content = prompt('Введите содержание заказа для отдела:');
    if (!content) return;

    const departmentId = prompt(`Выберите отдел:\n${departments.map(dept => `${dept.id}: ${dept.name} (${dept.type})`).join('\n')}`);
    if (!departmentId) return;

    try {
        const response = await fetch(`${API}/department-orders`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                orderId: orderId,
                departmentId: parseInt(departmentId),
                content: content
            })
        });

        if (response.ok) {
            alert('Заказ назначен отделу!');
            loadDepartmentOrders();
        } else {
            alert('Ошибка при назначении заказа отделу');
        }
    } catch (error) {
        console.error('Error creating department order:', error);
    }
}

async function editDepartmentOrder(deptOrderId, currentContent, currentStatus) {
    const newContent = prompt('Введите новое содержание:', currentContent);
    if (!newContent) return;

    const newStatus = prompt('Введите новый статус:', currentStatus);
    if (!newStatus) return;

    try {
        const response = await fetch(`${API}/department-orders/${deptOrderId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                content: newContent,
                status: newStatus
            })
        });

        if (response.ok) {
            alert('Заказ отдела обновлен!');
            loadDepartmentOrders();
        } else {
            alert('Ошибка при обновлении заказа отдела');
        }
    } catch (error) {
        console.error('Error updating department order:', error);
    }
}

async function deleteDepartmentOrder(deptOrderId) {
    if (!confirm('Вы уверены, что хотите удалить этот заказ отдела?')) return;

    try {
        const response = await fetch(`${API}/department-orders/${deptOrderId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Заказ отдела удален!');
            loadDepartmentOrders();
        } else {
            alert('Ошибка при удалении заказа отдела');
        }
    } catch (error) {
        console.error('Error deleting department order:', error);
    }
}

// Load data on page load
loadOrders();
loadDepartmentOrders();
loadProductionPlans();

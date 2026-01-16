const API = window.location.origin + '/api/client';

const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');

let currentTab = 'orders';

function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Section').classList.add('active');

    currentTab = tabName;

    if (tabName === 'orders') {
        loadOrders();
    }
}

async function loadOrders() {
    if (!document.getElementById('ordersSection').classList.contains('active')) return;

    if (!currentUser.username) {
        showError('ordersBody', 'Пользователь не найден. Пожалуйста, войдите в систему.', 4);
        return;
    }

    try {
        const response = await fetch(`${API}/orders?username=${currentUser.username}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();
        const tbody = document.getElementById('ordersBody');
        tbody.innerHTML = '';

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">У вас пока нет заказов</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            const statusClass = getStatusClass(order.status);
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${formatDate(order.creation_date)}</td>
                <td><span class="${statusClass}">${order.status}</span></td>
                <td>${order.order_content}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('ordersBody', 'Ошибка загрузки заказов: ' + error.message, 4);
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'Новый': return 'status-new';
        case 'В процессе': return 'status-in-progress';
        case 'Запланировано': return 'status-new';
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

function showError(elementId, message, colspan = 1) {
    const tbody = document.getElementById(elementId);
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-message" style="color: red;">${message}</td></tr>`;
}

document.getElementById('newOrderForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser.username) {
        alert('Ошибка: пользователь не найден. Пожалуйста, войдите в систему заново.');
        return;
    }

    const orderContent = document.getElementById('orderContent').value.trim();

    if (!orderContent) {
        alert('Пожалуйста, опишите ваш заказ.');
        return;
    }

    const orderData = {
        content: orderContent
    };

    try {
        const response = await fetch(`${API}/orders?username=${currentUser.username}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert('Заказ создан успешно!');
            e.target.reset();
            loadOrders();
        } else {
            const errorData = await response.json();
            alert('Ошибка при создании заказа: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error creating order:', error);
        alert('Ошибка при создании заказа: ' + error.message);
    }
});

function logout() {
    if (confirm('Вы уверены, что хотите выйти из системы?')) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'main.html';
    }
}

async function init() {
    if (!currentUser.username) {
        alert('Пользователь не найден. Пожалуйста, войдите в систему.');
        window.location.href = 'main.html';
        return;
    }

    loadOrders();
}

init();


const API = 'http://localhost:8081/api/manager';

const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

async function loadActiveOrders() {
    try {
        const response = await fetch(`${API}/active-orders`);
        const orders = await response.json();

        const tbody = document.getElementById('activeOrdersBody');
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
                    <button onclick="approveOrder(${order.id})">Принять</button>
                    <button onclick="rejectOrder(${order.id})">Отклонить</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading active orders:', error);
    }
}

async function loadAllOrders() {
    try {
        const response = await fetch(`${API}/all-orders`);
        const orders = await response.json();

        const tbody = document.getElementById('allOrdersBody');
        tbody.innerHTML = '';

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.creation_date}</td>
                <td>${order.status}</td>
                <td>${order.customer_name}</td>
                <td>${order.order_content}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading all orders:', error);
    }
}

async function approveOrder(orderId) {
    try {
        const response = await fetch(`${API}/orders/${orderId}/approve`, {
            method: 'POST'
        });
        if (response.ok) {
            alert('Заказ принят!');
            loadActiveOrders();
            loadAllOrders();
        } else {
            alert('Ошибка при принятии заказа');
        }
    } catch (error) {
        console.error('Error approving order:', error);
    }
}

async function rejectOrder(orderId) {
    try {
        const response = await fetch(`${API}/orders/${orderId}/reject`, {
            method: 'POST'
        });
        if (response.ok) {
            alert('Заказ отклонен!');
            loadActiveOrders();
            loadAllOrders();
        } else {
            alert('Ошибка при отклонении заказа');
        }
    } catch (error) {
        console.error('Error rejecting order:', error);
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
                <td>
                    <button onclick="editPlan(${plan.id}, '${plan.content.replace(/'/g, "\\'")}')">Редактировать</button>
                    <button onclick="deletePlan(${plan.id})">Удалить</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading production plans:', error);
    }
}

document.getElementById('newPlanForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const planData = {
        content: formData.get('planContent')
    };

    try {
        const response = await fetch(`${API}/production-plans`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(planData)
        });

        if (response.ok) {
            alert('План создан успешно!');
            e.target.reset();
            loadProductionPlans();
        } else {
            alert('Ошибка при создании плана');
        }
    } catch (error) {
        console.error('Error creating plan:', error);
    }
});

async function editPlan(planId, currentContent) {
    const newContent = prompt('Введите новый текст плана:', currentContent);
    if (newContent && newContent !== currentContent) {
        try {
            const response = await fetch(`${API}/production-plans/${planId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({content: newContent})
            });

            if (response.ok) {
                alert('План обновлен!');
                loadProductionPlans();
            } else {
                alert('Ошибка при обновлении плана');
            }
        } catch (error) {
            console.error('Error updating plan:', error);
        }
    }
}

async function deletePlan(planId) {
    if (!confirm('Вы уверены, что хотите удалить этот план?')) return;

    try {
        const response = await fetch(`${API}/production-plans/${planId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('План удален!');
            loadProductionPlans();
        } else {
            alert('Ошибка при удалении плана');
        }
    } catch (error) {
        console.error('Error deleting plan:', error);
    }
}

loadActiveOrders();
loadAllOrders();
loadProductionPlans();

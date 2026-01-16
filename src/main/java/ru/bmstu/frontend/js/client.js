const API = 'http://localhost:8081/api/client';

const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

async function loadOrders() {
    try {
        const response = await fetch(`${API}/orders?username=${currentUser.username}`);
        const orders = await response.json();

        const tbody = document.getElementById('ordersBody');
        tbody.innerHTML = '';

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.creation_date}</td>
                <td>${order.status}</td>
                <td>${order.order_content}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

document.getElementById('newOrderForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const orderData = {
        content: formData.get('orderContent')
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
            alert('Ошибка при создании заказа');
        }
    } catch (error) {
        console.error('Error creating order:', error);
    }
});

loadOrders();

const API = 'http://localhost:8081/api/department-employee';

const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

async function loadDepartmentOrders() {
    try {
        const response = await fetch(`${API}/orders?username=${currentUser.username}`);
        const orders = await response.json();

        const tbody = document.getElementById('departmentOrdersBody');
        tbody.innerHTML = '';

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.order_id}</td>
                <td>${order.content}</td>
                <td>${order.creation_date}</td>
                <td>${order.status}</td>
                <td>${order.last_modified}</td>
                <td>${order.original_order_content}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading department orders:', error);
    }
}

async function loadAvailableDocumentation() {
    try {
        const response = await fetch(`${API}/documentation?username=${currentUser.username}`);
        const documents = await response.json();

        const tbody = document.getElementById('documentsBody');
        tbody.innerHTML = '';

        documents.forEach(doc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${doc.id}</td>
                <td>${doc.name}</td>
                <td>${doc.creation_date}</td>
                <td>${doc.last_modified}</td>
                <td>${doc.content}</td>
                <td>${doc.issue_date}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading available documentation:', error);
    }
}

document.getElementById('documentationRequestForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const requestData = {
        documentId: parseInt(formData.get('documentId')),
        reason: formData.get('requestReason')
    };

    try {
        const response = await fetch(`${API}/documentation-request?username=${currentUser.username}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            alert('Запрос на документацию отправлен!');
            e.target.reset();
        } else {
            alert('Ошибка при отправке запроса');
        }
    } catch (error) {
        console.error('Error requesting documentation:', error);
    }
});

loadDepartmentOrders();
loadAvailableDocumentation();

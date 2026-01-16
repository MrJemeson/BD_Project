const API = window.location.origin + '/api/department-employee';

const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');

let currentTab = 'orders';

function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Section').classList.add('active');

    currentTab = tabName;

    switch (tabName) {
        case 'orders':
            loadDepartmentOrders();
            break;
        case 'documents':
            loadAvailableDocumentation();
            break;
        case 'request':
            loadDocumentationCatalog();
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

function setRequestDocumentsState(message, disableActions) {
    const select = document.getElementById('requestDocumentId');
    const submitBtn = document.getElementById('documentationRequestSubmit');

    if (!select || !submitBtn) return;

    select.innerHTML = `<option value="">${message}</option>`;
    select.disabled = disableActions;
    submitBtn.disabled = disableActions;
}

function isTruthy(value) {
    return value === true || value === 'true' || value === 1 || value === '1' || value === 't' || value === 'T';
}

async function loadDocumentationCatalog() {
    if (!document.getElementById('requestSection').classList.contains('active')) return;

    if (!currentUser.username) {
        setRequestDocumentsState('Пользователь не найден. Пожалуйста, войдите в систему.', true);
        return;
    }

    const select = document.getElementById('requestDocumentId');
    const submitBtn = document.getElementById('documentationRequestSubmit');
    select.innerHTML = '<option value="">Загрузка...</option>';
    select.disabled = true;
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API}/documentation-catalog?username=${encodeURIComponent(currentUser.username)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const documents = await response.json();
        select.innerHTML = '';

        if (documents.length === 0) {
            setRequestDocumentsState('Нет доступных документов', true);
            return;
        }

        let hasAvailable = false;
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Выберите документ';
        select.appendChild(placeholder);

        documents.forEach(doc => {
            const isIssuedToDepartment = isTruthy(doc.issued_to_department);
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = isIssuedToDepartment
                ? `${doc.name} (ID ${doc.id}) — уже выдано вашему отделу`
                : `${doc.name} (ID ${doc.id})`;
            option.disabled = isIssuedToDepartment;
            select.appendChild(option);
            if (!isIssuedToDepartment) {
                hasAvailable = true;
            }
        });

        if (!hasAvailable) {
            placeholder.textContent = 'Нет доступных документов для запроса';
        }

        select.disabled = false;
        submitBtn.disabled = !hasAvailable;
    } catch (error) {
        console.error('Error loading documentation catalog:', error);
        setRequestDocumentsState('Ошибка загрузки списка документов', true);
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

document.addEventListener('DOMContentLoaded', function() {
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

document.getElementById('documentationRequestForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser.username) {
        alert('Пользователь не найден. Пожалуйста, войдите в систему.');
        return;
    }

    const formData = new FormData(e.target);
    const documentId = parseInt(formData.get('documentId'), 10);
    const reason = formData.get('requestReason').trim();

    if (!documentId) {
        alert('Выберите документ.');
        return;
    }

    if (!reason) {
        alert('Укажите причину запроса.');
        return;
    }

    const requestData = {
        documentId: documentId,
        reason: reason
    };

    try {
        const response = await fetch(`${API}/documentation-request?username=${encodeURIComponent(currentUser.username)}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            alert('Запрос на документацию отправлен!');
            e.target.reset();
            loadDocumentationCatalog();
        } else {
            const errorData = await response.json();
            alert('Ошибка при отправке запроса: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error requesting documentation:', error);
        alert('Ошибка при отправке запроса: ' + error.message);
    }
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

async function init() {
    if (!currentUser.username) {
        alert('Пользователь не найден. Пожалуйста, войдите в систему.');
        window.location.href = 'main.html';
        return;
    }

    loadDepartmentOrders();
}

init();

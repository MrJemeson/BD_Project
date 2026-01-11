const API = window.location.origin + '/api/doc-employee';

// Load user info from session/localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');

let currentTab = 'documents';

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
        case 'documents':
            loadDocuments();
            break;
        case 'issued':
            loadIssuedCopies();
            break;
        case 'requests':
            loadDocumentationRequests();
            break;
        case 'new':
            // No data loading needed for new document form
            break;
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
            tbody.innerHTML = '<tr><td colspan="6" class="empty-message">Нет документов в архиве</td></tr>';
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
                <td>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                        <button class="action-btn edit-btn" onclick="editDocument(${doc.id}, '${doc.name.replace(/'/g, "\\'").replace(/"/g, '\\"')}', '${doc.content.replace(/'/g, "\\'").replace(/"/g, '\\"')}')">Редактировать</button>
                        <button class="action-btn delete-btn" onclick="deleteDocument(${doc.id})">Удалить</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading documents:', error);
        showError('documentsBody', 'Ошибка загрузки документов: ' + error.message);
    }
}

async function loadIssuedCopies() {
    if (!document.getElementById('issuedCopiesSection').classList.contains('active')) return;

    try {
        const response = await fetch(`${API}/issued-copies`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const copies = await response.json();
        const tbody = document.getElementById('issuedCopiesBody');
        tbody.innerHTML = '';

        if (copies.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Нет выданных копий</td></tr>';
            return;
        }

        copies.forEach(copy => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${copy.id}</td>
                <td>${copy.document_name}</td>
                <td>${copy.department_name}</td>
                <td>${formatDate(copy.issue_date)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn delete-btn" onclick="revokeCopy(${copy.id})">Изъять копию</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading issued copies:', error);
        showError('issuedCopiesBody', 'Ошибка загрузки выданных копий: ' + error.message, 5);
    }
}

async function loadDocumentationRequests() {
    if (!document.getElementById('requestsSection').classList.contains('active')) return;

    try {
        const response = await fetch(`${API}/documentation-requests`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const requests = await response.json();
        const tbody = document.getElementById('requestsBody');
        tbody.innerHTML = '';

        if (requests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-message">Нет запросов на документацию</td></tr>';
            return;
        }

        requests.forEach(request => {
            const row = document.createElement('tr');
            const statusClass = getStatusClass(request.status);
            const actionButtons = getRequestActionButtons(request.id, request.status);

            row.innerHTML = `
                <td>${request.id}</td>
                <td>${request.document_name}</td>
                <td>${request.department_name}</td>
                <td>${request.request_reason}</td>
                <td>${formatDate(request.request_date)}</td>
                <td><span class="${statusClass}">${request.status}</span></td>
                <td>${actionButtons}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading documentation requests:', error);
        showError('requestsBody', 'Ошибка загрузки запросов: ' + error.message, 7);
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'Новый':
        case 'Ожидает': return 'status-new';
        case 'В процессе': return 'status-in-progress';
        case 'Завершен':
        case 'Одобрено': return 'status-completed';
        case 'Отклонено': return 'status-rejected';
        default: return '';
    }
}

function getRequestActionButtons(requestId, status) {
    if (status === 'Ожидает') {
        return `
            <div class="action-buttons">
                <button class="action-btn approve-btn" onclick="approveRequest(${requestId})">Одобрить</button>
                <button class="action-btn reject-btn" onclick="rejectRequest(${requestId})">Отклонить</button>
            </div>
        `;
    }
    return '';
}

async function approveRequest(requestId) {
    if (!confirm('Вы уверены, что хотите одобрить этот запрос на документацию?')) return;

    try {
        const response = await fetch(`${API}/documentation-requests/${requestId}/approve`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('Запрос одобрен! Копия документа выдана.');
            loadDocumentationRequests();
            loadIssuedCopies();
        } else {
            const errorData = await response.json();
            alert('Ошибка при одобрении запроса: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error approving request:', error);
        alert('Ошибка при одобрении запроса: ' + error.message);
    }
}

async function rejectRequest(requestId) {
    if (!confirm('Вы уверены, что хотите отклонить этот запрос на документацию?')) return;

    try {
        const response = await fetch(`${API}/documentation-requests/${requestId}/reject`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('Запрос отклонен.');
            loadDocumentationRequests();
        } else {
            const errorData = await response.json();
            alert('Ошибка при отклонении запроса: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Ошибка при отклонении запроса: ' + error.message);
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

function showError(elementId, message) {
    const tbody = document.getElementById(elementId);
    const colspan = elementId === 'documentsBody' ? '6' : elementId === 'issuedCopiesBody' ? '5' : '4';
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty-message" style="color: red;">${message}</td></tr>`;
}

document.getElementById('newDocumentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const docName = document.getElementById('docName').value.trim();
    const docContent = document.getElementById('docContent').value.trim();

    if (!docName) {
        alert('Введите название документа');
        return;
    }

    if (!docContent) {
        alert('Введите содержание документа');
        return;
    }

    const documentData = {
        name: docName,
        content: docContent
    };

    try {
        const response = await fetch(`${API}/documents`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(documentData)
        });

        if (response.ok) {
            alert('Документ создан успешно!');
            e.target.reset();
            loadDocuments();
        } else {
            const errorData = await response.json();
            alert('Ошибка при создании документа: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error creating document:', error);
        alert('Ошибка при создании документа: ' + error.message);
    }
});

// Form handling for editing documents
document.addEventListener('DOMContentLoaded', function() {
    // Add form for editing documents
    const documentsSection = document.getElementById('documentsSection');
    const formHTML = `
        <div class="form-section" id="editDocumentForm" style="display: none;">
            <h3>Редактировать документ</h3>
            <form id="updateDocumentForm">
                <div class="form-container">
                    <div>
                        <label for="editDocName">Название документа:</label>
                        <input type="text" id="editDocName" name="name" required>
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <label for="editDocContent">Содержание:</label>
                        <textarea id="editDocContent" name="content" required></textarea>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="submit" class="save-btn">Сохранить</button>
                    <button type="button" class="cancel-btn" onclick="hideEditDocumentForm()">Отмена</button>
                </div>
            </form>
        </div>
    `;
    documentsSection.insertAdjacentHTML('beforeend', formHTML);

    // Handle form submission
    document.getElementById('updateDocumentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const requestData = {
            name: formData.get('name'),
            content: formData.get('content')
        };

        const docId = e.target.dataset.docId;

        try {
            const response = await fetch(`${API}/documents/${docId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                alert('Документ успешно обновлен!');
                hideEditDocumentForm();
                loadDocuments();
            } else {
                const errorData = await response.json();
                alert('Ошибка при обновлении документа: ' + (errorData.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Error updating document:', error);
            alert('Ошибка при обновлении документа: ' + error.message);
        }
    });
});

async function editDocument(docId, currentName, currentContent) {
    document.getElementById('editDocName').value = currentName;
    document.getElementById('editDocContent').value = currentContent;
    document.getElementById('updateDocumentForm').dataset.docId = docId;
    document.getElementById('editDocumentForm').style.display = 'block';
}

function hideEditDocumentForm() {
    document.getElementById('editDocumentForm').style.display = 'none';
    document.getElementById('updateDocumentForm').reset();
}

async function deleteDocument(docId) {
    if (!confirm('Вы уверены, что хотите удалить этот документ?')) return;

    try {
        const response = await fetch(`${API}/documents/${docId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Документ успешно удален!');
            loadDocuments();
        } else {
            const errorData = await response.json();
            alert('Ошибка при удалении документа: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        alert('Ошибка при удалении документа: ' + error.message);
    }
}

// Form handling for issuing copies
document.addEventListener('DOMContentLoaded', function() {
    // Add form for issuing copies
    const documentsSection = document.getElementById('documentsSection');
    const formHTML = `
        <div class="form-section" id="issueCopyForm" style="display: none;">
            <h3>Выдать копию документа</h3>
            <form id="createIssueCopyForm">
                <div class="form-container">
                    <div>
                        <label for="issueDocId">ID документа:</label>
                        <input type="number" id="issueDocId" name="documentId" readonly>
                    </div>
                    <div>
                        <label for="issueDepartmentId">Отдел:</label>
                        <select id="issueDepartmentId" name="departmentId" required></select>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="submit" class="save-btn">Выдать копию</button>
                    <button type="button" class="cancel-btn" onclick="hideIssueCopyForm()">Отмена</button>
                </div>
            </form>
        </div>
    `;
    documentsSection.insertAdjacentHTML('beforeend', formHTML);

    // Handle form submission
    document.getElementById('createIssueCopyForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const requestData = {
            documentId: parseInt(formData.get('documentId')),
            departmentId: parseInt(formData.get('departmentId'))
        };

        try {
            const response = await fetch(`${API}/issue-copy`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                alert('Копия документа успешно выдана!');
                hideIssueCopyForm();
                loadIssuedCopies();
            } else {
                const errorData = await response.json();
                alert('Ошибка при выдаче копии: ' + (errorData.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Error issuing copy:', error);
            alert('Ошибка при выдаче копии: ' + error.message);
        }
    });
});

async function issueCopy(docId) {
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
        const deptSelect = document.getElementById('issueDepartmentId');
        deptSelect.innerHTML = '<option value="">Выберите отдел...</option>';
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = `${dept.name} (${dept.type})`;
            deptSelect.appendChild(option);
        });

        // Show form
        document.getElementById('issueDocId').value = docId;
        document.getElementById('issueCopyForm').style.display = 'block';

    } catch (error) {
        console.error('Error loading departments:', error);
        alert('Ошибка при загрузке отделов: ' + error.message);
    }
}

function hideIssueCopyForm() {
    document.getElementById('issueCopyForm').style.display = 'none';
    document.getElementById('createIssueCopyForm').reset();
}

async function revokeCopy(copyId) {
    if (!confirm('Вы уверены, что хотите изъять эту копию?')) return;

    try {
        const response = await fetch(`${API}/issued-copies/${copyId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Копия успешно изъята!');
            loadIssuedCopies();
        } else {
            const errorData = await response.json();
            alert('Ошибка при изъятии копии: ' + (errorData.error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Error revoking copy:', error);
        alert('Ошибка при изъятии копии: ' + error.message);
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
    loadDocuments();
}

// Load initial data
init();


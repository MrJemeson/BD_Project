const API = 'http://localhost:8081/api/doc-employee';

// Load user info from session/localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

async function loadDocuments() {
    try {
        const response = await fetch(`${API}/documents`);
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
                <td>
                    <button onclick="editDocument(${doc.id}, '${doc.name.replace(/'/g, "\\'")}', '${doc.content.replace(/'/g, "\\'")}')">Редактировать</button>
                    <button onclick="deleteDocument(${doc.id})">Удалить</button>
                    <button onclick="issueCopy(${doc.id})">Выдать копию</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

async function loadIssuedCopies() {
    try {
        const response = await fetch(`${API}/issued-copies`);
        const copies = await response.json();

        const tbody = document.getElementById('issuedCopiesBody');
        tbody.innerHTML = '';

        copies.forEach(copy => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${copy.id}</td>
                <td>${copy.document_name}</td>
                <td>${copy.department_name}</td>
                <td>${copy.issue_date}</td>
                <td>
                    <button onclick="revokeCopy(${copy.id})">Изъять копию</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading issued copies:', error);
    }
}

document.getElementById('newDocumentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const documentData = {
        name: formData.get('docName'),
        content: formData.get('docContent')
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
            alert('Ошибка при создании документа');
        }
    } catch (error) {
        console.error('Error creating document:', error);
    }
});

async function editDocument(docId, currentName, currentContent) {
    const newName = prompt('Введите новое название:', currentName);
    if (!newName) return;

    const newContent = prompt('Введите новое содержание:', currentContent);
    if (!newContent) return;

    try {
        const response = await fetch(`${API}/documents/${docId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: newName,
                content: newContent
            })
        });

        if (response.ok) {
            alert('Документ обновлен!');
            loadDocuments();
        } else {
            alert('Ошибка при обновлении документа');
        }
    } catch (error) {
        console.error('Error updating document:', error);
    }
}

async function deleteDocument(docId) {
    if (!confirm('Вы уверены, что хотите удалить этот документ?')) return;

    try {
        const response = await fetch(`${API}/documents/${docId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Документ удален!');
            loadDocuments();
        } else {
            alert('Ошибка при удалении документа');
        }
    } catch (error) {
        console.error('Error deleting document:', error);
    }
}

async function issueCopy(docId) {
    // Load departments for selection
    const deptResponse = await fetch(`${API}/departments`);
    const departments = await deptResponse.json();

    const departmentId = prompt(`Выберите отдел для выдачи копии:\n${departments.map(dept => `${dept.id}: ${dept.name} (${dept.type})`).join('\n')}`);
    if (!departmentId) return;

    try {
        const response = await fetch(`${API}/issue-copy`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                documentId: docId,
                departmentId: parseInt(departmentId)
            })
        });

        if (response.ok) {
            alert('Копия документа выдана!');
            loadIssuedCopies();
        } else {
            alert('Ошибка при выдаче копии');
        }
    } catch (error) {
        console.error('Error issuing copy:', error);
    }
}

async function revokeCopy(copyId) {
    if (!confirm('Вы уверены, что хотите изъять эту копию?')) return;

    try {
        const response = await fetch(`${API}/issued-copies/${copyId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Копия изъята!');
            loadIssuedCopies();
        } else {
            alert('Ошибка при изъятии копии');
        }
    } catch (error) {
        console.error('Error revoking copy:', error);
    }
}

// Load data on page load
loadDocuments();
loadIssuedCopies();

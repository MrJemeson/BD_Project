const API = 'http://localhost:8081/api/admin';

let currentTable = '';
let columns = [];

async function loadTables() {
    try {
        const res = await fetch(`${API}/tables`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const tables = await res.json();
        const select = document.getElementById('tableSelect');
        select.innerHTML = '';
        tables.forEach(t => {
            const o = document.createElement('option');
            o.value = t;
            o.textContent = t;
            select.appendChild(o);
        });
    } catch (error) {
        console.error('Error loading tables:', error);
        alert('Ошибка загрузки таблиц: ' + error.message);
    }
}

async function loadTable() {
    try {
        currentTable = document.getElementById('tableSelect').value;
        const res = await fetch(`${API}/table/${currentTable}`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        if (data.length === 0) {
            alert('Таблица пуста');
            return;
        }

        columns = Object.keys(data[0]);
        renderTable(data);
        renderForm();
    } catch (error) {
        console.error('Error loading table:', error);
        alert('Ошибка загрузки данных таблицы: ' + error.message);
    }
}

function renderTable(data) {
    const table = document.getElementById('dataTable');
    table.innerHTML = '';

    if (data.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = columns.length + 1;
        emptyCell.className = 'empty-message';
        emptyCell.textContent = 'Таблица пуста';
        emptyRow.appendChild(emptyCell);
        table.appendChild(emptyRow);
        return;
    }

    const header = document.createElement('tr');
    columns.forEach(c => {
        const th = document.createElement('th');
        th.textContent = c;
        header.appendChild(th);
    });
    const actionsTh = document.createElement('th');
    actionsTh.textContent = 'Действия';
    header.appendChild(actionsTh);
    table.appendChild(header);

    data.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(c => {
            const td = document.createElement('td');
            td.textContent = row[c];
            td.setAttribute('data-column', c);
            td.setAttribute('data-value', row[c]);
            tr.appendChild(td);
        });

        const actionsTd = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Редактировать';
        editBtn.className = 'action-btn edit-btn';
        editBtn.onclick = () => editRow(row);
        actionsTd.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.onclick = () => deleteRow(row);
        actionsTd.appendChild(deleteBtn);

        tr.appendChild(actionsTd);
        table.appendChild(tr);
    });
}

function renderForm(row = null) {
    const container = document.getElementById('formContainer');
    container.innerHTML = '';
    columns.forEach(c => {
        const input = document.createElement('input');
        input.placeholder = c;
        input.id = `f_${c}`;
        if (row) {
            input.value = row[c] || '';
        }
        container.appendChild(input);
    });
}

let editingRow = null;

async function saveRow() {
    try {
        const obj = {};
        columns.forEach(c => {
            obj[c] = document.getElementById(`f_${c}`).value;
        });

        if (editingRow) {
            const idColumn = columns[0];
            const idValue = editingRow[idColumn];
            const res = await fetch(`${API}/table/${currentTable}?idColumn=${idColumn}&idValue=${idValue}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(obj)
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            editingRow = null;
        } else {
            const res = await fetch(`${API}/table/${currentTable}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(obj)
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
        }

        loadTable();
        renderForm();
        alert('Запись успешно сохранена');
    } catch (error) {
        console.error('Error saving row:', error);
        alert('Ошибка сохранения: ' + error.message);
    }
}

function cancelEdit() {
    editingRow = null;
    renderForm();
    document.getElementById('formTitle').textContent = 'Добавить новую запись';
}

function editRow(row) {
    editingRow = row;
    renderForm(row);
    document.getElementById('formTitle').textContent = 'Редактировать запись';
}

async function deleteRow(row) {
    try {
        if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;

        const idColumn = columns[0];
        const idValue = row[idColumn];
        const res = await fetch(`${API}/table/${currentTable}?idColumn=${idColumn}&idValue=${idValue}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        loadTable();
        alert('Запись успешно удалена');
    } catch (error) {
        console.error('Error deleting row:', error);
        alert('Ошибка удаления: ' + error.message);
    }
}

async function init() {
    await loadTables();
    renderForm();
}

init();

const API = window.location.origin + '/api/admin';

const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');

let currentGenericTable = '';
let genericColumns = [];
let editingGenericRow = null;
let pendingTableSelection = '';

async function readErrorMessage(response) {
    try {
        const data = await response.json();
        if (data && data.error) {
            return data.error;
        }
        return JSON.stringify(data);
    } catch (error) {
        try {
            const text = await response.text();
            return text || `HTTP error! status: ${response.status}`;
        } catch (innerError) {
            return `HTTP error! status: ${response.status}`;
        }
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (activeButton) activeButton.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const section = document.getElementById(tabName + 'Section');
    if (section) section.classList.add('active');

    if (tabName === 'tables') {
        loadTables();
    }
}

function openTable(tableName) {
    pendingTableSelection = tableName;
    switchTab('tables');
}

function renderTableShortcuts(tables) {
    const list = document.getElementById('dbTablesList');
    if (!list) return;

    list.innerHTML = '';
    tables.forEach(table => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tab-button';
        button.textContent = table;
        button.addEventListener('click', () => openTable(table));
        list.appendChild(button);
    });
}

async function loadTables() {
    try {
        const response = await fetch(`${API}/tables`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tables = await response.json();

        const select = document.getElementById('tableSelect');
        if (!select) return;
        select.innerHTML = '<option value="">Выберите таблицу...</option>';

        const relevantTables = tables.filter(table =>
            !table.startsWith('pg_') &&
            !table.startsWith('sql_') &&
            !table.startsWith('flyway_') &&
            table !== 'databasechangelog' &&
            table !== 'databasechangeloglock'
        );

        relevantTables.forEach(table => {
            const option = document.createElement('option');
            option.value = table;
            option.textContent = table;
            select.appendChild(option);
        });

        renderTableShortcuts(relevantTables);

        if (pendingTableSelection) {
            const selectedTable = pendingTableSelection;
            pendingTableSelection = '';
            select.value = selectedTable;
            loadSelectedTable();
        }
    } catch (error) {
        console.error('Error loading tables:', error);
        alert('Ошибка загрузки таблиц: ' + error.message);
    }
}

async function loadSelectedTable() {
    const tableSelect = document.getElementById('tableSelect');
    if (!tableSelect) return;

    const tableName = tableSelect.value;
    if (!tableName) {
        const genericTable = document.getElementById('genericTable');
        if (genericTable) genericTable.innerHTML = '';
        const formSection = document.getElementById('genericFormSection');
        if (formSection) formSection.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API}/table/${tableName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        currentGenericTable = tableName;

        if (data.length === 0) {
            genericColumns = [];
            renderGenericTable([]);
            renderGenericForm();
            return;
        }

        genericColumns = Object.keys(data[0]);
        renderGenericTable(data);
        renderGenericForm();
        const formSection = document.getElementById('genericFormSection');
        if (formSection) formSection.style.display = 'block';
    } catch (error) {
        console.error('Error loading table:', error);
        alert('Ошибка загрузки данных таблицы: ' + error.message);
    }
}

function renderGenericTable(data) {
    const table = document.getElementById('genericTable');
    if (!table) return;
    table.innerHTML = '';

    if (data.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = genericColumns.length + 1;
        emptyCell.className = 'empty-message';
        emptyCell.textContent = 'Таблица пуста';
        emptyRow.appendChild(emptyCell);
        table.appendChild(emptyRow);
        return;
    }

    const header = document.createElement('tr');
    genericColumns.forEach(c => {
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
        genericColumns.forEach(c => {
            const td = document.createElement('td');
            td.textContent = row[c];
            tr.appendChild(td);
        });

        const actionsTd = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Редактировать';
        editBtn.className = 'action-btn edit-btn';
        editBtn.onclick = () => editGenericRow(row);
        actionsTd.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.onclick = () => deleteGenericRow(row);
        actionsTd.appendChild(deleteBtn);

        tr.appendChild(actionsTd);
        table.appendChild(tr);
    });
}

function renderGenericForm(row = null) {
    const container = document.getElementById('genericFormContainer');
    if (!container) return;
    container.innerHTML = '';

    if (genericColumns.length === 0) return;

    genericColumns.forEach(c => {
        const div = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = c + ':';
        label.style.display = 'block';
        label.style.marginBottom = '5px';

        const input = document.createElement('input');
        input.placeholder = c;
        input.id = `generic_f_${c}`;
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.border = '1px solid #ddd';
        input.style.borderRadius = '4px';

        if (row && row[c] !== null) {
            input.value = row[c];
        }

        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    });
}

async function saveGenericRow() {
    try {
        if (genericColumns.length === 0 || !currentGenericTable) {
            alert('Сначала выберите таблицу');
            return;
        }

        const obj = {};
        genericColumns.forEach(c => {
            const value = document.getElementById(`generic_f_${c}`).value;
            obj[c] = value === '' ? null : value;
        });

        if (editingGenericRow) {
            const idColumn = genericColumns[0];
            const idValue = editingGenericRow[idColumn];
            const response = await fetch(`${API}/table/${currentGenericTable}?idColumn=${idColumn}&idValue=${idValue}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(obj)
            });
            if (!response.ok) {
                const errorMessage = await readErrorMessage(response);
                throw new Error(errorMessage);
            }
            editingGenericRow = null;
        } else {
            const response = await fetch(`${API}/table/${currentGenericTable}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(obj)
            });
            if (!response.ok) {
                const errorMessage = await readErrorMessage(response);
                throw new Error(errorMessage);
            }
        }

        loadSelectedTable();
        renderGenericForm();
        alert('Запись успешно сохранена');
    } catch (error) {
        console.error('Error saving row:', error);
        alert('Ошибка сохранения: ' + error.message);
    }
}

function cancelGenericEdit() {
    editingGenericRow = null;
    renderGenericForm();
    const title = document.getElementById('genericFormTitle');
    if (title) title.textContent = 'Добавить новую запись';
}

function editGenericRow(row) {
    editingGenericRow = row;
    renderGenericForm(row);
    const title = document.getElementById('genericFormTitle');
    if (title) title.textContent = 'Редактировать запись';
}

async function deleteGenericRow(row) {
    try {
        if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;

        const idColumn = genericColumns[0];
        const idValue = row[idColumn];
        const response = await fetch(`${API}/table/${currentGenericTable}?idColumn=${idColumn}&idValue=${idValue}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        loadSelectedTable();
        alert('Запись успешно удалена');
    } catch (error) {
        console.error('Error deleting row:', error);
        alert('Ошибка удаления: ' + error.message);
    }
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти из системы?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'main.html';
    }
}

async function init() {
    if (!currentUser.username) {
        alert('Пользователь не найден. Пожалуйста, войдите в систему.');
        window.location.href = 'main.html';
        return;
    }

    switchTab('tables');
}

document.addEventListener('DOMContentLoaded', init);

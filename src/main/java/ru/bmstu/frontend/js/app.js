async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    messageDiv.style.color = 'red';
    messageDiv.textContent = '';

    if (!username || !password) {
        messageDiv.textContent = 'Пожалуйста, введите логин и пароль';
        return;
    }

    try {
        const response = await fetch('http://localhost:8081/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Неверные данные');
        }

        const data = await response.json();
        window.location.href = data.redirectUrl;
        messageDiv.style.color = 'green';
        messageDiv.textContent = `Привет, ${data.username}! Роль: ${data.role}`;
    } catch (error) {
        messageDiv.textContent = 'Ошибка входа: Неверные данные';
    }
}

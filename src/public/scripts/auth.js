document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    });


    if (response.ok) {
        alert('Успешный вход!');
        window.location.href = 'index.html';
    } else {
        const data = await response.json()
        alert(`Ошибка входа: ${data.message}`);
    }
});

document.getElementById('registerForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        alert('Регистрация прошла успешно!');
        window.location.href = 'login.html';
    } else {
        const data = await response.json()
        alert(`Ошибка регистрации: ${data.message}`);
    }
});
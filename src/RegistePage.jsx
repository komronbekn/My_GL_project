import React, { useEffect, useState } from 'react';

const RegistePage = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Fetch users data from server
        fetch('http://localhost:5000/users')
            .then((res) => res.json())
            .then((data) => setUsers(data));
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = () => {
        const { username, password, confirmPassword } = formData;

        // Простая валидация
        if (!username || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Проверка, существует ли уже пользователь
        const userExists = users.some(user => user.Name === username);
        if (userExists) {
            setError('User already exists');
            return;
        }

        // Отправка данных на сервер
        fetch('http://localhost:5000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: users.length + 1, Name: username, Password: password, Coins: 0 }),
        })
        .then((res) => res.json())
        .then((data) => {
            console.log('Server Response:', data);  // Логируем ответ сервера для отладки
            if (data.success) {
                setSuccess('Registration successful!');
                setError('');
                setUsers([...users, { id: users.length + 1, Name: username, Password: password, Coins: 0 , coinLimit: 1000}]);
            } else {
                setError(data.message || 'Registration successful');
            }
        })
        .catch((err) => {
            console.error('Error:', err);
            setError('An error occurred. Please try again.');
        });
    };

    return (
        <div>
            <input
                type="text"
                name="username"
                placeholder="Your Name"
                value={formData.username}
                onChange={handleInputChange}
            />
            <input
                type="password"
                name="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={handleInputChange}
            />
            <input
                type="password"
                name="confirmPassword"
                placeholder="Retry password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
            />
            <button type="button" onClick={handleRegister}>Register</button>

            {error && <p style={{ color: 'green' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
    );
};

export default RegistePage;

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
        fetch('https://gl-server.onrender.com/users')
            .then((res) => res.json())
            .then((data) => setUsers(data));
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleRegister = () => {
        const { username, password, confirmPassword } = formData;
    
        // Simple validation
        if (!username || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }
    
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
    
        // Check if the user already exists
        const userExists = users.some(user => user.Name === username);
        if (userExists) {
            setError('User already exists');
            return;
        }
    
        // Send registration data to server
        fetch('https://gl-server.onrender.com/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: `${users.length + 1}`,
                Name: username,
                Password: password,
                Coins: 0,
                coinLimit: 1000, // Ensure this value is included
                maxCoinLimit: 1000 // Add maxCoinLimit here
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('Server Response:', data);  // Log server response for debugging
                if (data.id) { // Check for successful user creation
                    setSuccess('Registration successful!');
                    setError('');
                    // Update the users state with the new user
                    setUsers((prevUsers) => [
                        ...prevUsers,
                        {
                            id: data.id,
                            Name: username,
                            Password: password,
                            Coins: 0,
                            coinLimit: 1000,
                            maxCoinLimit: 1000 // Ensure this value is included in the state update
                        }
                    ]);
                } else {
                    setError(data.message || 'Registration failed');
                }
            })
            .catch((err) => {
                console.error('Error:', err);
                setError('An error occurred. Please try again.');
            });
    };
    

    return (
        <div className="register-container">
            <h2 className="register-title">Register</h2>
            <input
                className="register-input"
                type="text"
                name="username"
                placeholder="Your Name"
                value={formData.username}
                onChange={handleInputChange}
            />
            <input
                className="register-input"
                type="password"
                name="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={handleInputChange}
            />
            <input
                className="register-input"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
            />
            <button className="register-button" type="button" onClick={handleRegister}>Register</button>

            {error && <p className="register-error">{error}</p>}
            {success && <p className="register-success">{success}</p>}
        </div>
    );
};

export default RegistePage;

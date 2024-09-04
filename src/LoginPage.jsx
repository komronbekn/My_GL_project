import React, { useState, useEffect } from 'react';
import ClickCoins from './ClickCoins';
import RegistePage from './RegistePage';
import './LoginPage.css';

const LoginPage = () => {
    const [usersData, setUsersData] = useState([]);
    const [loginStatus, setLoginStatus] = useState('');
    const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')) || {});
    const [formData, setFormData] = useState({ username: '', password: '' });

    useEffect(() => {
        const fetchUsersData = async () => {
            try {
                const response = await fetch('https://gl-server.onrender.com/users');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUsersData(data);

                const savedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (savedUserInfo && savedUserInfo.Name) {
                    setUserInfo(savedUserInfo);
                    setLoginStatus('Account found');
                }
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };

        fetchUsersData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const checkForAccount = () => {
        const foundUser = usersData.find(
            (user) => user.Name === formData.username && user.Password === formData.password
        );

        if (foundUser) {
            setLoginStatus('Account found');
            setUserInfo(foundUser);
            localStorage.setItem('userInfo', JSON.stringify(foundUser));
        } else {
            setLoginStatus('Account not found');
        }
    };

    const logout = () => {
        setUserInfo({});
        setLoginStatus('');
        localStorage.removeItem('userInfo');
    };

    return (
        <div className="login-container">
            {loginStatus === 'Account found' ? (
                <div>
                    <div className='progress flex justify-between py-[30px] items-center px-[20px]'>
                        <p>Name: {userInfo.Name}</p>
                        <p className='flex items-center gap-4 text-[20px]'>
                            <img className='coinmini' src="https://pngimg.com/d/coin_PNG36871.png" alt="coin" />
                            {userInfo.Coins}
                        </p>
                        <button className="logout-button" onClick={logout}>Log out</button>
                    </div>
                    <ClickCoins userInfo={userInfo} setUserInfo={setUserInfo} />
                </div>
            ) : (
                <div className="login-form">
                    <input
                        className="login-input"
                        name="username"
                        type="text"
                        placeholder="Name"
                        value={formData.username}
                        onChange={handleInputChange}
                    />
                    <input
                        className="login-input"
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                    <button className="login-button" type="button" onClick={checkForAccount}>Log in</button>
                    <p className="login-status">{loginStatus}</p>
                    <div className="register-link">
                        or <RegistePage />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;

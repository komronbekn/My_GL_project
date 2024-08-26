import React, { useEffect, useState } from 'react';
import RegistePage from './RegistePage';

const LoginPage = () => {
    const [usersData, setUsersData] = useState([]);
    const [loginStatus, setLoginStatus] = useState('');
    const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')) || {});
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [isAnimating, setIsAnimating] = useState(false);
    const [animations, setAnimations] = useState([]);
    const [coinLimit, setCoinLimit] = useState(0);

    useEffect(() => {
        const fetchUsersData = () => {
            fetch('http://localhost:5000/users')
                .then((res) => res.json())
                .then((data) => {
                    setUsersData(data);

                    const savedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
                    if (savedUserInfo && savedUserInfo.Name) {
                        setUserInfo(savedUserInfo);
                        setLoginStatus('Account found');
                        setCoinLimit(savedUserInfo.coinLimit || 0); // Initialize coinLimit
                    }
                })
                .catch((err) => console.error('Error fetching users:', err));
        };

        fetchUsersData();
    }, []);

    const fetchcoinslimit = () => { 
        if (userInfo.coinLimit < userInfo.maxCoinLimit) {
            const updatedCoinLimit = userInfo.coinLimit + 1;

            fetch(`http://localhost:5000/users/${userInfo.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...userInfo, coinLimit: updatedCoinLimit }),
            })
            .then((res) => res.json())
            .then((updatedUser) => {
                setUserInfo(updatedUser);
                setCoinLimit(updatedUser.coinLimit);
            })
            .catch((err) => console.error('Error updating coin limit:', err));
        }
    }

    useEffect(() => {
        if (userInfo.id) {
            const intervalId = setInterval(() => {
                fetchcoinslimit();
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [userInfo]);

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
            setCoinLimit(foundUser.coinLimit || 0); // Update coinLimit
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

    const handleClick = (event) => {
        const imageSize = 50;
        const x = event.clientX - imageSize / 2;
        const y = event.clientY - imageSize / 2;

        const newAnimation = { x, y, id: Date.now() };
        setAnimations((prevAnimations) => [...prevAnimations, newAnimation]);

        setTimeout(() => {
            setAnimations((prevAnimations) =>
                prevAnimations.filter((animation) => animation.id !== newAnimation.id)
            );
        }, 2000);
    };

    const incrementCoins = (event) => {
        if (coinLimit > 0) {
            const updatedUserInfo = { ...userInfo, Coins: userInfo.Coins + 1, coinLimit: userInfo.coinLimit - 1 };

            fetch(`http://localhost:5000/users/${userInfo.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUserInfo),
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return res.json();
                })
                .then(() => {
                    setUserInfo(updatedUserInfo);
                    setCoinLimit(updatedUserInfo.coinLimit);
                    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

                    setIsAnimating(true);
                    setTimeout(() => setIsAnimating(false), 200);

                    handleClick(event);
                })
                .catch((err) => {
                    console.error('Error updating coins:', err);
                    alert('Failed to update coins. Please try again later.');
                });
        }
    };

    return (
        <div style={{ position: 'relative', maxWidth: '100%', overflow: 'hidden' }}>
            {loginStatus === 'Account found' ? (
                <div className='px-[100px]'>
                    <div className='flex justify-between py-[30px] items-center'>
                        <p>Name: {userInfo.Name}</p>
                        <p className='flex items-center gap-4 text-[20px]'>
                            <img className='coinmini' src="../src/assets/clikc_img.png" alt="" />
                            {userInfo.Coins}
                        </p>
                        <button onClick={logout}>Log out</button>
                    </div>

                    {/* Progress Bar for Coin Limit */}
                    <div className="progress-bar-container" style={{ background: '#ccc', borderRadius: '5px', height: '20px', width: '100%', margin: '20px 0' }}>
                        <div
                            className="progress-bar"
                            style={{
                                background: '#4caf50',
                                height: '100%',
                                borderRadius: '5px',
                                width: `${(coinLimit / (userInfo.maxCoinLimit || 1000)) * 100}%`, // Adjust the divisor according to max limit
                                transition: 'width 0.3s ease',
                            }}
                        ></div>
                    </div>
                    <p>Coin Limit: {coinLimit}</p>

                    <div className='flex justify-center'>
                        <button className='Click rounded-[50%]' type="button" onClick={incrementCoins}>
                            <img className={`coin ${isAnimating ? 'coin-click' : ''}`} src="../src/assets/clikc_img.png" alt="" />
                        </button>
                    </div>

                    {animations.map((animation) => (
                        <p key={animation.id} className='coin-animation' style={{ left: `${animation.x}px`, top: `${animation.y}px`, width: '50px', height: '50px' }}>
                            +1
                        </p>
                    ))}
                </div>
            ) : (
                <form>
                    <input name="username" type="text" placeholder="Name" value={formData.username} onChange={handleInputChange} />
                    <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} />
                    <button type="button" onClick={checkForAccount}>Log in</button>
                    <br />
                    or
                    <br />
                    <RegistePage />
                    <p>{loginStatus}</p>
                </form>
            )}
        </div>
    );
};

export default LoginPage;

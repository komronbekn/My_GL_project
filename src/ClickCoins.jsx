import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClickCoins = ({ userInfo, setUserInfo }) => {
    const navigate = useNavigate();  // Hook for navigation
    const [isAnimating, setIsAnimating] = useState(false);
    const [animations, setAnimations] = useState([]);
    const [coinLimit, setCoinLimit] = useState(userInfo.coinLimit || 0);

    useEffect(() => {
        setCoinLimit(userInfo.coinLimit || 0); // Sync coinLimit with userInfo on mount and updates
    }, [userInfo]);

    const fetchCoinsLimit = async () => {
        if (userInfo.coinLimit < userInfo.maxCoinLimit) {
            const updatedCoinLimit = userInfo.coinLimit + 1;

            try {
                const response = await fetch(`https://gl-server.onrender.com/users/${userInfo.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...userInfo, coinLimit: updatedCoinLimit }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const updatedUser = await response.json();
                setUserInfo(updatedUser); // Update userInfo with new data
                setCoinLimit(updatedUser.coinLimit); // Sync coinLimit
            } catch (err) {
                console.error('Error updating coin limit:', err);
            }
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchCoinsLimit();
        }, 700);

        return () => clearInterval(intervalId);
    }, [userInfo]); // Trigger interval on userInfo changes

    const handleClick = (event) => {
        const imageSize = 50;
        const x = event.clientX - imageSize / 2;
        const y = event.clientY - imageSize / 2;

        const newAnimation = { x, y, id: Date.now() + Math.random() };

        setAnimations((prevAnimations) => [...prevAnimations, newAnimation]);

        setTimeout(() => {
            setAnimations((prevAnimations) =>
                prevAnimations.filter((animation) => animation.id !== newAnimation.id)
            );
        }, 2000);
    };

    const incrementCoins = async (event) => {
        if (coinLimit > 0) {
            const updatedUserInfo = {
                ...userInfo,
                Coins: userInfo.Coins + 1,
                coinLimit: userInfo.coinLimit - 1
            };

            try {
                const response = await fetch(`https://gl-server.onrender.com/users/${userInfo.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedUserInfo),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setUserInfo(data); // Update userInfo
                setCoinLimit(data.coinLimit); // Update coinLimit
                localStorage.setItem('userInfo', JSON.stringify(data));

                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 200);

                handleClick(event);
            } catch (err) {
                console.error('Error updating coins:', err);
                alert('Failed to update coins. Please try again later.');
            }
        }
    };

    return (
        <div className='body'>
            <div className='flex items-center gap-5'>
                <div className="progress-bar-container" style={{ background: '#ccc', borderRadius: '5px', height: '20px', width: '100%', margin: '20px 0' }}>
                    <div
                        className="progress-bar"
                        style={{
                            background: '#ffcc00',
                            height: '100%',
                            borderRadius: '5px',
                            width: `${(coinLimit / (userInfo.maxCoinLimit || 1000)) * 100}%`,
                            transition: 'width 0.3s ease',
                        }}
                    ></div>
                </div>
                <p>{coinLimit}</p>
            </div>

            <div className='flex justify-center'>
                <button className='Click rounded-[50%]' type="button" onClick={incrementCoins}>
                    <img className={`coin ${isAnimating ? 'coin-click' : ''}`} src="https://pngimg.com/d/coin_PNG36871.png" alt="coin" />
                </button>
            </div>

            {animations.map((animation) => (
                <p
                    key={animation.id}
                    className='coin-animation'
                    style={{
                        left: `${animation.x}px`,
                        top: `${animation.y}px`,
                        width: '50px',
                        height: '50px',
                        animation: 'moveUp 2s ease-out forwards'
                    }}
                >
                    1
                </p>
            ))}
        </div>
    );
};

export default ClickCoins;

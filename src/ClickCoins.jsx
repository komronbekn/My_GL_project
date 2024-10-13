import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ClickCoins = ({ userInfo, setUserInfo }) => {
    const navigate = useNavigate();
    const [isAnimating, setIsAnimating] = useState(false);
    const [animations, setAnimations] = useState([]);
    const [coinLimit, setCoinLimit] = useState(userInfo.coinLimit || 0);

    useEffect(() => {
        setCoinLimit(userInfo.coinLimit || 0); 
    }, [userInfo]);

    useEffect(() => {
        const syncDataWithServer = async () => {
            const savedUserInfo = JSON.parse(localStorage.getItem('userInfo'));

            if (savedUserInfo && savedUserInfo._id === userInfo._id) {
                try {
                    const response = await fetch(`https://ctc-node.onrender.com/users/${userInfo._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(savedUserInfo),
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const updatedUser = await response.json();
                    setUserInfo(updatedUser);
                    setCoinLimit(updatedUser.coinLimit);
                    localStorage.removeItem('userInfo');
                } catch (err) {
                    console.error('Error updating coin limit:', err);
                }
            }
        };

        syncDataWithServer();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCoinLimit((prevCoinLimit) => {
                if (prevCoinLimit < (userInfo.maxCoinLimit || 400)) {
                    const updatedUserInfo = {
                        ...userInfo,
                        coinLimit: prevCoinLimit + 1
                    };
                    
                    setUserInfo(updatedUserInfo);
                    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                    return prevCoinLimit + 1;
                }
                return prevCoinLimit;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [userInfo]);

    useEffect(() => {
        const updateCoinLimitOnServer = async () => {
            try {
                const response = await fetch(`http://localhost:5001/users${userInfo._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...userInfo, coinLimit }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update coinLimit on server');
                }
            } catch (err) {
                console.error('Error updating coin limit:', err);
            }
        };

        updateCoinLimitOnServer();
    }, [coinLimit, userInfo._id]);

    const handleClick = (event, touchPoints) => {
        const imageSize = 50;
        
        // Если кликов несколько
        const touches = touchPoints || [{ clientX: event.clientX, clientY: event.clientY }];
        
        touches.forEach(touch => {
            const x = touch.clientX - imageSize / 2;
            const y = touch.clientY - imageSize / 2;
            const newAnimation = { x, y, id: Date.now() + Math.random() };

            setAnimations((prevAnimations) => [...prevAnimations, newAnimation]);

            setTimeout(() => {
                setAnimations((prevAnimations) =>
                    prevAnimations.filter((animation) => animation.id !== newAnimation.id)
                );
            }, 2000);
        });
    };

    const incrementCoins = () => {
        if (coinLimit > 0) {
            const updatedUserInfo = {
                ...userInfo,
                Coins: (userInfo.Coins || 0) + 1,
                coinLimit: coinLimit - 1
            };

            setCoinLimit(updatedUserInfo.coinLimit);
            setUserInfo(updatedUserInfo);
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            setIsAnimating(true);

            setTimeout(() => setIsAnimating(false), 300);
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
                <button
                    className='Click rounded-[50%]'
                    type="button"
                    onClick={(event) => { incrementCoins(); handleClick(event); }}
                    onTouchStart={(event) => {
                        incrementCoins();
                        const touchPoints = Array.from(event.touches).map(touch => ({
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                        }));
                        handleClick(event, touchPoints);
                    }}
                >
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
                    +1
                </p>
            ))}
        </div>
    );
};

export default ClickCoins;

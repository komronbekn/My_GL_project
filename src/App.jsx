import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import ClickCoins from './ClickCoins'; // Обратите внимание, что ClickCoins не используется в маршрутах напрямую

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      {/* Добавьте другие маршруты, если необходимо */}
    </Routes>

  );
};

export default App;

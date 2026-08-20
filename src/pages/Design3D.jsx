import { useState, useEffect } from 'react';
import Design3DLogin from './Design3DLogin';

export default function Design3D() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Проверка сохраненной сессии при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('design3d_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('design3d_user', JSON.stringify(userData));
    
    // Здесь будет логика реальной авторизации через API
    console.log('User logged in:', userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('design3d_user');
  };

  if (!isLoggedIn) {
    return <Design3DLogin onLogin={handleLogin} />;
  }

  return (
    <div className="design3d-app">
      <header className="design3d-header">
        <h1>4Solutions Design 3D</h1>
        <div className="user-info">
          <span>Привет, {user?.method === 'telegram' ? 'Telegram' : 'MAX'} пользователь!</span>
          <button onClick={handleLogout} className="logout-btn">Выйти</button>
        </div>
      </header>
      
      <main className="design3d-main">
        <div className="welcome-section">
          <h2>Добро пожаловать в конструктор!</h2>
          <p>Здесь скоро появится полноценный 3D-редактор для проектирования интерьера.</p>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🏗️ Построение стен</h3>
              <p>Создавайте планировку квартиры с точностью до сантиметра</p>
            </div>
            <div className="feature-card">
              <h3>🔌 Инженерия</h3>
              <p>Размещайте розетки, выключатели и освещение по правилам ПУЭ</p>
            </div>
            <div className="feature-card">
              <h3>📊 Умная смета</h3>
              <p>Автоматический расчет стоимости материалов и работ в реальном времени</p>
            </div>
            <div className="feature-card">
              <h3>🛒 Анализ корзин</h3>
              <p>Сравнение цен из Лемана ПРО и Петрович для оптимизации бюджета</p>
            </div>
          </div>
          <div className="coming-soon">
            <div className="pulse-animation"></div>
            <p>Загрузка 3D-движка... Скоро здесь будет магия! ✨</p>
          </div>
        </div>
      </main>

      <style>{`
        .design3d-app {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .design3d-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .design3d-header h1 {
          color: white;
          font-size: 1.5rem;
          margin: 0;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .logout-btn {
          padding: 0.5rem 1.25rem;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .design3d-main {
          padding: 3rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .welcome-section {
          text-align: center;
          color: white;
        }

        .welcome-section h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .welcome-section > p {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 3rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .feature-card h3 {
          font-size: 1.3rem;
          margin-bottom: 0.75rem;
        }

        .feature-card p {
          font-size: 0.95rem;
          opacity: 0.9;
          line-height: 1.5;
        }

        .coming-soon {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          max-width: 500px;
          margin: 0 auto;
        }

        .pulse-animation {
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }

        .coming-soon p {
          font-size: 1.1rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .design3d-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .design3d-main {
            padding: 2rem 1rem;
          }

          .welcome-section h2 {
            font-size: 1.8rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

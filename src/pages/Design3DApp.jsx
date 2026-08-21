import { useState, useEffect } from 'react';
import Design3DLogin from './Design3DLogin';
import { materialsDB, getMaterialsByCategory } from '../data/materialsDB';
import { EstimateCalculator, calculateFloorArea, calculateWallArea } from '../utils/calculator';

export default function Design3DApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('materials');
  const [calculator] = useState(() => new EstimateCalculator());
  const [estimateData, setEstimateData] = useState(null);
  
  // Пример помещения для расчета
  const [room] = useState({
    length: 5,
    width: 4,
    height: 2.7,
    openings: [
      { width: 0.9, height: 2.1 }, // дверь
      { width: 1.5, height: 1.4 }  // окно
    ]
  });

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
    console.log('User logged in:', userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('design3d_user');
  };

  // Расчет сметы при изменении данных
  useEffect(() => {
    if (isLoggedIn) {
      calculateSampleEstimate();
    }
  }, [isLoggedIn]);

  const calculateSampleEstimate = () => {
    calculator.clear();
    
    // Расчет площадей
    const floorArea = calculateFloorArea(room.length, room.width);
    const ceilingArea = floorArea;
    const wallPerimeter = 2 * (room.length + room.width);
    const wallArea = calculateWallArea(wallPerimeter, room.height, room.openings);
    
    // Добавляем материалы для пола
    calculator.addMaterial('floor-laminate-oak', Math.ceil(floorArea * 1.05), 'м²'); // +5% запас
    
    // Добавляем материалы для потолка
    calculator.addMaterial('ceiling-stretch-matte', Math.ceil(ceilingArea), 'м²');
    
    // Добавляем материалы для стен (гипсокартон)
    calculator.addMaterial('wall-drywall-standard', Math.ceil(wallArea / 3), 'лист');
    
    // Добавляем электрику
    const electricalPoints = { sockets: 8, switches: 3 };
    calculator.addMaterial('eng-socket-schneider', electricalPoints.sockets, 'шт');
    calculator.addMaterial('eng-switch-schneider', electricalPoints.switches, 'шт');
    calculator.addMaterial('eng-cable-vvg', 50, 'м');
    calculator.addMaterial('eng-cable-vvg-light', 30, 'м');
    
    setEstimateData(calculator.getFullEstimate());
  };

  if (!isLoggedIn) {
    return <Design3DLogin onLogin={handleLogin} />;
  }

  return (
    <div className="design3d-app-full">
      <header className="design3d-header-full">
        <div className="header-left">
          <h1>🏗️ 4Solutions Design 3D Pro</h1>
          <span className="version-badge">v1.0 Beta</span>
        </div>
        <div className="user-info-full">
          <span className="welcome-text">
            👋 {user?.method === 'telegram' ? 'Telegram' : 'MAX'} пользователь
          </span>
          <button onClick={handleLogout} className="logout-btn-full">Выйти</button>
        </div>
      </header>

      <nav className="design3d-nav">
        <button 
          className={`nav-tab ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          📦 Материалы
        </button>
        <button 
          className={`nav-tab ${activeTab === 'estimate' ? 'active' : ''}`}
          onClick={() => setActiveTab('estimate')}
        >
          💰 Смета
        </button>
        <button 
          className={`nav-tab ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          📊 Сравнение цен
        </button>
        <button 
          className={`nav-tab ${activeTab === 'project' ? 'active' : ''}`}
          onClick={() => setActiveTab('project')}
        >
          🏠 Проект
        </button>
      </nav>

      <main className="design3d-main-full">
        {activeTab === 'materials' && (
          <div className="materials-section">
            <h2>База материалов</h2>
            <div className="materials-grid">
              {Object.entries(materialsDB).map(([category, items]) => (
                <div key={category} className="material-category">
                  <h3>{getCategoryName(category)}</h3>
                  <div className="material-list">
                    {items.map(material => (
                      <div key={material.id} className="material-card">
                        <div className="material-header">
                          <span className="material-name">{material.name}</span>
                          <span className={`supplier-badge ${material.supplier.includes('Лемана') ? 'lemana' : 'petrovich'}`}>
                            {material.supplier}
                          </span>
                        </div>
                        <div className="material-specs">
                          {Object.entries(material.specs).map(([key, value]) => (
                            <span key={key} className="spec-tag">{value}</span>
                          ))}
                        </div>
                        <div className="material-footer">
                          <span className="material-price">{material.price} ₽/{material.unit}</span>
                          <span className={`stock-status ${material.inStock ? 'in-stock' : 'out-stock'}`}>
                            {material.inStock ? '✓ В наличии' : '✗ Нет в наличии'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'estimate' && estimateData && (
          <div className="estimate-section">
            <h2>Смета проекта</h2>
            
            <div className="room-info-card">
              <h3>📐 Параметры помещения</h3>
              <div className="room-params">
                <span>Длина: {room.length} м</span>
                <span>Ширина: {room.width} м</span>
                <span>Высота: {room.height} м</span>
                <span>Площадь пола: {calculateFloorArea(room.length, room.width)} м²</span>
                <span>Площадь стен: {calculateWallArea(2 * (room.length + room.width), room.height, room.openings).toFixed(2)} м²</span>
              </div>
            </div>

            <div className="estimate-content">
              <div className="materials-list-full">
                <h3>Материалы</h3>
                {estimateData.materials.map((item, index) => (
                  <div key={index} className="estimate-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-supplier">{item.supplier}</span>
                    </div>
                    <div className="item-details">
                      <span>{item.quantity} {item.unit}</span>
                      <span>{item.price} ₽</span>
                      <span className="item-total">{item.total} ₽</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="estimate-totals">
                <div className="total-row">
                  <span>Материалы:</span>
                  <span>{estimateData.totals.materials.toLocaleString()} ₽</span>
                </div>
                <div className="total-row">
                  <span>Работы:</span>
                  <span>{estimateData.totals.works.toLocaleString()} ₽</span>
                </div>
                <div className="total-row grand-total">
                  <span>Итого:</span>
                  <span>{estimateData.totals.grandTotal.toLocaleString()} ₽</span>
                </div>
                
                <div className="supplier-breakdown">
                  <h4>По поставщикам:</h4>
                  {estimateData.bySupplier.map(supplier => (
                    <div key={supplier.supplier} className="supplier-row">
                      <span>{supplier.supplier}:</span>
                      <span>{supplier.total.toLocaleString()} ₽</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && estimateData && (
          <div className="comparison-section">
            <h2>📊 Сравнение цен поставщиков</h2>
            
            <div className="comparison-cards">
              {estimateData.bySupplier.map(supplier => (
                <div key={supplier.supplier} className={`comparison-card ${supplier.supplier.includes('Лемана') ? 'lemana-card' : 'petrovich-card'}`}>
                  <div className="supplier-logo">
                    {supplier.supplier.includes('Лемана') ? '🟢' : '🔵'}
                  </div>
                  <h3>{supplier.supplier}</h3>
                  <div className="supplier-total">
                    <span className="total-label">Общая стоимость:</span>
                    <span className="total-value">{supplier.total.toLocaleString()} ₽</span>
                  </div>
                  <div className="supplier-items-count">
                    Товаров: {supplier.items.length}
                  </div>
                  <ul className="supplier-items-list">
                    {supplier.items.map(item => (
                      <li key={item.id}>
                        <span>{item.name}</span>
                        <span>{item.total} ₽</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="comparison-summary">
              <h3>💡 Рекомендация</h3>
              {estimateData.bySupplier.length >= 2 ? (
                <div className="recommendation">
                  {estimateData.bySupplier[0].total < estimateData.bySupplier[1].total ? (
                    <>
                      <p>🏆 <strong>Лемана ПРО</strong> выгоднее на {(estimateData.bySupplier[1].total - estimateData.bySupplier[0].total).toLocaleString()} ₽</p>
                    </>
                  ) : (
                    <>
                      <p>🏆 <strong>Петрович</strong> выгоднее на {(estimateData.bySupplier[0].total - estimateData.bySupplier[1].total).toLocaleString()} ₽</p>
                    </>
                  )}
                  <p className="tip">💡 Совет: Можно заказать часть материалов у одного поставщика, а часть у другого для оптимальной цены!</p>
                </div>
              ) : (
                <p>Добавьте материалы от разных поставщиков для сравнения</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'project' && (
          <div className="project-section">
            <h2>🏠 Ваш проект</h2>
            
            <div className="project-info">
              <div className="project-stats">
                <div className="stat-card">
                  <span className="stat-icon">📏</span>
                  <span className="stat-value">{room.length * room.width} м²</span>
                  <span className="stat-label">Общая площадь</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">📐</span>
                  <span className="stat-value">{calculateWallArea(2 * (room.length + room.width), room.height, room.openings).toFixed(1)} м²</span>
                  <span className="stat-label">Площадь стен</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">💰</span>
                  <span className="stat-value">{estimateData ? estimateData.totals.grandTotal.toLocaleString() : '0'} ₽</span>
                  <span className="stat-label">Бюджет проекта</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">📦</span>
                  <span className="stat-value">{estimateData ? estimateData.materials.length : 0}</span>
                  <span className="stat-label">Материалов</span>
                </div>
              </div>

              <div className="project-features">
                <h3>Возможности конструктора:</h3>
                <div className="features-list">
                  <div className="feature-item">
                    <span className="feature-icon">🏗️</span>
                    <div>
                      <h4>Построение стен</h4>
                      <p>Создавайте планировку квартиры с точностью до сантиметра</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <div>
                      <h4>Инженерия</h4>
                      <p>Размещайте розетки, выключатели и освещение по правилам ПУЭ</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📊</span>
                    <div>
                      <h4>Умная смета</h4>
                      <p>Автоматический расчет стоимости в реальном времени</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🛒</span>
                    <div>
                      <h4>Анализ корзин</h4>
                      <p>Сравнение цен из Лемана ПРО и Петрович</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="coming-soon-3d">
                <div className="pulse-animation"></div>
                <p>🚀 Загрузка полноценного 3D-редактора... Скоро здесь будет магия! ✨</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .design3d-app-full {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .design3d-header-full {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 2px solid rgba(102, 126, 234, 0.3);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .design3d-header-full h1 {
          color: #667eea;
          font-size: 1.5rem;
          margin: 0;
          font-weight: 700;
        }

        .version-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .user-info-full {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .welcome-text {
          color: #333;
          font-weight: 500;
        }

        .logout-btn-full {
          padding: 0.5rem 1.25rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .logout-btn-full:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .design3d-nav {
          display: flex;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .nav-tab {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .nav-tab:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .nav-tab.active {
          background: white;
          color: #667eea;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .design3d-main-full {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .materials-section h2,
        .estimate-section h2,
        .comparison-section h2,
        .project-section h2 {
          color: white;
          font-size: 2rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .materials-grid {
          display: grid;
          gap: 2rem;
        }

        .material-category {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .material-category h3 {
          color: #667eea;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .material-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .material-card {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          border: 2px solid #e0e0e0;
          transition: all 0.3s ease;
        }

        .material-card:hover {
          border-color: #667eea;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .material-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .material-name {
          font-weight: 600;
          color: #333;
          flex: 1;
        }

        .supplier-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-left: 0.5rem;
        }

        .supplier-badge.lemana {
          background: #d4edda;
          color: #155724;
        }

        .supplier-badge.petrovich {
          background: #cce5ff;
          color: #004085;
        }

        .material-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .spec-tag {
          background: #f0f0f0;
          padding: 0.25rem 0.5rem;
          border-radius: 5px;
          font-size: 0.8rem;
          color: #666;
        }

        .material-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid #e0e0e0;
        }

        .material-price {
          font-weight: 700;
          color: #667eea;
          font-size: 1.1rem;
        }

        .stock-status {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .stock-status.in-stock {
          color: #28a745;
        }

        .stock-status.out-stock {
          color: #dc3545;
        }

        .room-info-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .room-info-card h3 {
          color: #667eea;
          margin-bottom: 1rem;
        }

        .room-params {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
        }

        .room-params span {
          background: #f8f9fa;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .estimate-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .materials-list-full {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .materials-list-full h3 {
          color: #667eea;
          margin-bottom: 1rem;
        }

        .estimate-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .item-name {
          font-weight: 600;
          color: #333;
        }

        .item-supplier {
          font-size: 0.85rem;
          color: #666;
        }

        .item-details {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .item-total {
          font-weight: 700;
          color: #667eea;
        }

        .estimate-totals {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 1.5rem;
          height: fit-content;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .grand-total {
          font-size: 1.3rem;
          font-weight: 700;
          color: #667eea;
          border-bottom: none;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #667eea;
        }

        .supplier-breakdown {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 2px dashed #e0e0e0;
        }

        .supplier-breakdown h4 {
          color: #667eea;
          margin-bottom: 0.75rem;
        }

        .supplier-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .comparison-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .comparison-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
        }

        .lemana-card {
          border: 3px solid #28a745;
        }

        .petrovich-card {
          border: 3px solid #007bff;
        }

        .supplier-logo {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .comparison-card h3 {
          color: #333;
          margin-bottom: 1rem;
        }

        .supplier-total {
          margin: 1.5rem 0;
        }

        .total-label {
          display: block;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .total-value {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: #667eea;
        }

        .supplier-items-count {
          color: #666;
          margin-bottom: 1rem;
        }

        .supplier-items-list {
          list-style: none;
          padding: 0;
          text-align: left;
        }

        .supplier-items-list li {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .comparison-summary {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
        }

        .comparison-summary h3 {
          color: #667eea;
          margin-bottom: 1rem;
        }

        .recommendation {
          background: linear-gradient(135deg, #fff3cd, #ffe69c);
          padding: 1.5rem;
          border-radius: 12px;
          border: 2px solid #ffc107;
        }

        .recommendation p {
          margin: 0.5rem 0;
        }

        .tip {
          font-style: italic;
          color: #856404;
        }

        .project-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }

        .stat-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          display: block;
          font-size: 1.8rem;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }

        .project-features {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .project-features h3 {
          color: #667eea;
          margin-bottom: 1.5rem;
        }

        .features-list {
          display: grid;
          gap: 1rem;
        }

        .feature-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .feature-icon {
          font-size: 2rem;
        }

        .feature-item h4 {
          color: #333;
          margin: 0 0 0.25rem 0;
        }

        .feature-item p {
          color: #666;
          margin: 0;
          font-size: 0.9rem;
        }

        .coming-soon-3d {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          color: white;
        }

        .pulse-animation {
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          animation: pulse 2s infinite;
          margin: 0 auto 1.5rem;
        }

        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }

        @media (max-width: 1024px) {
          .estimate-content {
            grid-template-columns: 1fr;
          }
          
          .comparison-cards {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .design3d-header-full {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .design3d-nav {
            flex-wrap: wrap;
            padding: 1rem;
          }

          .nav-tab {
            flex: 1;
            min-width: calc(50% - 0.5rem);
          }

          .design3d-main-full {
            padding: 1rem;
          }

          .materials-section h2,
          .estimate-section h2,
          .comparison-section h2,
          .project-section h2 {
            font-size: 1.5rem;
          }

          .material-list {
            grid-template-columns: 1fr;
          }

          .room-params {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function getCategoryName(category) {
  const names = {
    walls: '🧱 Стеновые материалы',
    floors: '🏠 Напольные покрытия',
    ceilings: '✨ Потолочные материалы',
    engineering: '⚡ Инженерные системы',
    insulation: '🔥 Изоляция'
  };
  return names[category] || category;
}

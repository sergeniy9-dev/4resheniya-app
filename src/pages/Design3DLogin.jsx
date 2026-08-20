import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Shield, Zap, ArrowRight } from 'lucide-react';
import './Design3DLogin.css';

export default function Design3DLogin({ onLogin }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (method) => {
    setSelectedMethod(method);
    setIsLoading(true);
    
    // Имитация процесса авторизации (заглушка)
    setTimeout(() => {
      setIsLoading(false);
      // В реальном приложении здесь будет редирект на OAuth или отправка кода
      onLogin({ method, userId: 'demo-user-' + Date.now() });
    }, 1500);
  };

  return (
    <div className="design3d-login-container">
      {/* Фоновые элементы */}
      <div className="login-background">
        <div className="grid-overlay"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="login-header">
          <motion.div 
            className="logo-3d"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="cube-wrapper">
              <div className="cube">
                <div className="face front"></div>
                <div className="face back"></div>
                <div className="face right"></div>
                <div className="face left"></div>
                <div className="face top"></div>
                <div className="face bottom"></div>
              </div>
            </div>
          </motion.div>
          
          <h1>4Solutions Design 3D</h1>
          <p className="subtitle">Создайте интерьер своей мечты в реальном времени</p>
        </div>

        <div className="features-preview">
          <motion.div 
            className="feature-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Zap size={20} className="feature-icon" />
            <span>Мгновенный расчет сметы</span>
          </motion.div>
          <motion.div 
            className="feature-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Shield size={20} className="feature-icon" />
            <span>Точные размеры и материалы</span>
          </motion.div>
          <motion.div 
            className="feature-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <MessageCircle size={20} className="feature-icon" />
            <span>Сохранение проектов в облаке</span>
          </motion.div>
        </div>

        <div className="login-methods">
          <p className="methods-title">Войти через:</p>
          
          <motion.button
            className="login-btn telegram-btn"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0, 136, 204, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLogin('telegram')}
            disabled={isLoading}
          >
            {isLoading && selectedMethod === 'telegram' ? (
              <span className="loading-spinner"></span>
            ) : (
              <Send size={20} className="btn-icon" />
            )}
            <span>Telegram</span>
            <ArrowRight size={18} className="arrow-icon" />
          </motion.button>

          <motion.button
            className="login-btn max-btn"
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(255, 107, 39, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLogin('max')}
            disabled={isLoading}
          >
            {isLoading && selectedMethod === 'max' ? (
              <span className="loading-spinner"></span>
            ) : (
              <MessageCircle size={20} className="btn-icon" />
            )}
            <span>Messenger MAX</span>
            <ArrowRight size={18} className="arrow-icon" />
          </motion.button>
        </div>

        <div className="login-footer">
          <p className="security-note">
            <Shield size={14} />
            Безопасный вход без паролей. Ваши данные под защитой.
          </p>
          <p className="terms-note">
            Продолжая, вы принимаете{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              политику конфиденциальности
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

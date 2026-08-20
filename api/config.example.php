<?php

/**
 * Конфигурационный файл для API 4Solutions
 * 
 * ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:
 * 1. Скопируйте этот файл как api/config.php
 * 2. Заполните реальными значениями в config.php
 * 3. НИКОГДА не коммитьте config.php в git!
 * 4. Для локальной разработки можно использовать переменные окружения
 */

return [
    // Чувствительные данные - загружаются из переменных окружения или config.php
    'BITRIX_WEBHOOK' => getenv('BITRIX_WEBHOOK') ?: '',
    'TELEGRAM_BOT_TOKEN' => getenv('TELEGRAM_BOT_TOKEN') ?: '',
    'TELEGRAM_CHAT_ID' => getenv('TELEGRAM_CHAT_ID') ?: '',
    
    // Разрешённые CORS origin
    'ALLOWED_ORIGINS' => [
        'http://127.0.0.1:8080',
        'http://localhost:5173',
        'https://4-solutions.ru',
        'https://www.4-solutions.ru',
    ],
    
    // ID ответственного в Bitrix24 (опционально)
    'ASSIGNED_BY_ID' => null,
];


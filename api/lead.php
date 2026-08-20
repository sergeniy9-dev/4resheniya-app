<?php

declare(strict_types=1);

/**
 * Обработчик заявок 4Solutions
 * 
 * Функции безопасности:
 * - Валидация CORS origin из whitelist
 * - Санитизация всех входных данных
 * - Безопасное получение IP (с приоритетом Cloudflare)
 * - Логирование всех запросов
 */

header('Content-Type: application/json; charset=utf-8');

// Динамическая проверка CORS origin
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [];

$configPath = __DIR__ . '/config.php';
if (file_exists($configPath)) {
    $config = require $configPath;
    $allowedOrigins = $config['ALLOWED_ORIGINS'] ?? [];
}

if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(405, [
        'success' => false,
        'message' => 'Method not allowed',
    ]);
}

// Загрузка конфигурации
if (!file_exists($configPath)) {
    jsonResponse(500, [
        'success' => false,
        'message' => 'Configuration file not found. Please create config.php from config.example.php',
    ]);
}

$config = require $configPath;

// Rate limiting (простая реализация)
$rateLimitFile = dirname(__DIR__) . '/storage/rate_limit.json';
$maxRequestsPerMinute = 10; // Максимум запросов в минуту с одного IP

$currentIp = getClientIp();
if ($currentIp !== '') {
    $rateData = [];
    if (file_exists($rateLimitFile)) {
        $rateData = json_decode(file_get_contents($rateLimitFile), true) ?: [];
    }
    
    $currentTime = time();
    $minuteAgo = $currentTime - 60;
    
    // Очищаем старые записи
    foreach ($rateData as $ip => $timestamps) {
        $rateData[$ip] = array_filter($timestamps, fn($ts) => $ts > $minuteAgo);
        if (empty($rateData[$ip])) {
            unset($rateData[$ip]);
        }
    }
    
    // Проверяем лимит для текущего IP
    $currentTimestamps = $rateData[$currentIp] ?? [];
    if (count($currentTimestamps) >= $maxRequestsPerMinute) {
        jsonResponse(429, [
            'success' => false,
            'message' => 'Too many requests. Please try again later.',
        ]);
    }
    
    // Добавляем текущий запрос
    $currentTimestamps[] = $currentTime;
    $rateData[$currentIp] = $currentTimestamps;
    
    // Сохраняем
    $rateDir = dirname($rateLimitFile);
    if (!is_dir($rateDir)) {
        mkdir($rateDir, 0755, true);
    }
    file_put_contents($rateLimitFile, json_encode($rateData));
}

// Часовой пояс
$timezone = $config['TIMEZONE'] ?? 'Europe/Moscow';
date_default_timezone_set($timezone);

// Получение и парсинг тела запроса
$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody ?: '', true);

if (!is_array($data)) {
    $data = $_POST;
}

if (!is_array($data)) {
    jsonResponse(400, [
        'success' => false,
        'message' => 'Invalid request format',
    ]);
}

// Валидация и санитизация входных данных
$name = cleanString($data['name'] ?? '');
$rawContact = cleanString(
    $data['contact']
    ?? $data['phone']
    ?? $data['phoneNumber']
    ?? $data['telegram']
    ?? $data['email']
    ?? ''
);

$contactType = cleanString($data['contactType'] ?? $data['contact_type'] ?? '');
if ($contactType === '') {
    $contactType = detectContactType($rawContact);
}

$phone = '';
if ($contactType === 'phone') {
    $phone = normalizePhone($rawContact);
}

$email = cleanString($data['email'] ?? '');
if ($email === '' && $contactType === 'email') {
    $email = $rawContact;
}

if ($name === '' || $rawContact === '') {
    jsonResponse(400, [
        'success' => false,
        'message' => 'Имя и контакт обязательны',
    ]);
}

$requestId = bin2hex(random_bytes(8));

$formName = cleanString($data['formName'] ?? $data['form_name'] ?? 'Форма сайта');
$entryPoint = cleanString($data['entryPoint'] ?? $data['entry_point'] ?? '');
$service = cleanString($data['service'] ?? '');
$channel = cleanString($data['channel'] ?? 'website_form');
$message = cleanString($data['message'] ?? '');
$page = cleanString($data['page'] ?? ($_SERVER['HTTP_REFERER'] ?? ''));
$device = cleanString($data['device'] ?? '');

$utm = $data['utm'] ?? [];
if (!is_array($utm)) {
    $utm = [];
}

$attribution = $data['attribution'] ?? [];
if (!is_array($attribution)) {
    $attribution = [];
}

$record = [
    'request_id' => $requestId,
    'created_at' => date('c'),

    'name' => $name,

    // phone — только настоящий телефон.
    'phone' => $phone,

    // contact — то, что реально ввёл пользователь.
    'contact' => $rawContact,
    'contact_type' => $contactType,

    'email' => $email,
    'service' => $service,
    'message' => $message,
    'form_name' => $formName,
    'channel' => $channel,
    'entry_point' => $entryPoint,
    'page' => $page,
    'device' => $device,

    'attribution_source' => cleanString($attribution['source'] ?? ''),
    'landing_page' => cleanString($attribution['landing_page'] ?? ''),
    'referrer' => cleanString($attribution['referrer'] ?? ''),
    'first_seen_at' => cleanString($attribution['first_seen_at'] ?? ''),
    'last_seen_at' => cleanString($attribution['last_seen_at'] ?? ''),
    'yandex_client_id' => cleanString($attribution['yandex_client_id'] ?? ''),

    'utm' => [
        'utm_source' => cleanString($utm['utm_source'] ?? ''),
        'utm_medium' => cleanString($utm['utm_medium'] ?? ''),
        'utm_campaign' => cleanString($utm['utm_campaign'] ?? ''),
        'utm_content' => cleanString($utm['utm_content'] ?? ''),
        'utm_term' => cleanString($utm['utm_term'] ?? ''),
    ],

    // данные конструктора, если есть
    'object' => cleanString($data['object'] ?? ''),
    'priority' => cleanString($data['priority'] ?? ''),
    'mood' => cleanString($data['mood'] ?? ''),
    'level' => cleanString($data['level'] ?? ''),
    'recommendation' => cleanString($data['recommendation'] ?? ''),
    'preview_image' => cleanString($data['previewImage'] ?? $data['preview_image'] ?? ''),

    'ip' => getClientIp(),
    'user_agent' => cleanString($_SERVER['HTTP_USER_AGENT'] ?? ''),
];

ensureLogDirectory();

appendLog('incoming.log', $record);

$crmSuccess = false;
$crmId = null;
$crmError = null;

$telegramSuccess = false;
$telegramError = null;

try {
    $crmResult = sendToBitrix($config, $record);
    $crmSuccess = true;
    $crmId = $crmResult['id'] ?? null;
} catch (Throwable $error) {
    $crmError = $error->getMessage();

    appendLog('failed.log', array_merge($record, [
        'error_type' => 'bitrix',
        'error' => $crmError,
    ]));
}

try {
    $telegramSuccess = sendToTelegram($config, $record, $crmSuccess, $crmId, $crmError);
} catch (Throwable $error) {
    $telegramError = $error->getMessage();

    appendLog('failed.log', array_merge($record, [
        'error_type' => 'telegram',
        'error' => $telegramError,
    ]));
}

// ВАЖНО:
// Если заявка сохранена в лог, пользователю возвращаем успех.
// Даже если Bitrix временно не принял, заявка не потеряна.
jsonResponse(200, [
    'success' => true,
    'message' => 'Заявка принята',
    'request_id' => $requestId,
    'crm_success' => $crmSuccess,
    'crm_id' => $crmId,
    'crm_error' => $crmError,
    'telegram_success' => $telegramSuccess,
    'telegram_error' => $telegramError,
]);

function cleanString(mixed $value): string
{
    if (is_array($value) || is_object($value)) {
        return '';
    }

    return trim((string) $value);
}

function detectContactType(string $contact): string
{
    $contact = trim($contact);
    $lower = mb_strtolower($contact);

    if ($contact === '') {
        return 'unknown';
    }

    if (str_starts_with($contact, '@') || str_contains($lower, 't.me/') || str_contains($lower, 'telegram')) {
        return 'telegram';
    }

    if (str_contains($lower, 'wa.me/') || str_contains($lower, 'whatsapp')) {
        return 'whatsapp';
    }

    if (str_contains($lower, 'instagram.com') || str_starts_with($lower, 'instagram')) {
        return 'instagram';
    }

    if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
        return 'email';
    }

    $digits = preg_replace('/\D+/', '', $contact);

    if (strlen($digits) >= 10) {
        return 'phone';
    }

    return 'other';
}

function normalizePhone(string $contact): string
{
    $contact = trim($contact);
    $digits = preg_replace('/\D+/', '', $contact);

    if (strlen($digits) < 10) {
        return '';
    }

    if (strlen($digits) === 11 && str_starts_with($digits, '8')) {
        return '+7' . substr($digits, 1);
    }

    if (strlen($digits) === 11 && str_starts_with($digits, '7')) {
        return '+' . $digits;
    }

    if (str_starts_with($contact, '+')) {
        return $contact;
    }

    return $digits;
}

function getClientIp(): string
{
    // Приоритет Cloudflare IP (если используется Cloudflare)
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        $ip = filter_var($_SERVER['HTTP_CF_CONNECTING_IP'], FILTER_VALIDATE_IP);
        if ($ip !== false) {
            return $ip;
        }
    }
    
    // Для других прокси можно доверять только известным
    // X-Forwarded-For может быть подделан, поэтому используем с осторожностью
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // Берём первый IP из списка (клиентский)
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = filter_var(trim($parts[0]), FILTER_VALIDATE_IP);
        if ($ip !== false) {
            return $ip;
        }
    }
    
    // Прямой IP подключения
    if (!empty($_SERVER['REMOTE_ADDR'])) {
        $ip = filter_var($_SERVER['REMOTE_ADDR'], FILTER_VALIDATE_IP);
        if ($ip !== false) {
            return $ip;
        }
    }
    
    return '';
}

function getLogDir(): string
{
    return dirname(__DIR__) . '/storage/leads';
}

function ensureLogDirectory(): void
{
    $dir = getLogDir();

    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

function appendLog(string $fileName, array $data): void
{
    $path = getLogDir() . '/' . $fileName;

    file_put_contents(
        $path,
        json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function sendToBitrix(array $config, array $record): array
{
    $webhook = trim((string) ($config['BITRIX_WEBHOOK'] ?? ''));

    if ($webhook === '') {
        throw new RuntimeException('Bitrix webhook is empty');
    }

    $webhook = rtrim($webhook, '/') . '/';
    $url = $webhook . 'crm.lead.add.json';

    $titleParts = [];

    if ($record['service'] !== '') {
        $titleParts[] = $record['service'];
    }

    if ($record['form_name'] !== '') {
        $titleParts[] = $record['form_name'];
    }

    $title = 'Заявка с сайта';
    if (!empty($titleParts)) {
        $title .= ' — ' . implode(' / ', $titleParts);
    }

    $fields = [
        'TITLE' => $title,
        'NAME' => $record['name'],
        'OPENED' => 'Y',
        'SOURCE_ID' => 'WEB',
        'SOURCE_DESCRIPTION' => buildSourceDescription($record),
        'COMMENTS' => buildBitrixComment($record),
    ];

    $utmFields = [
        'UTM_SOURCE' => $record['utm']['utm_source'],
        'UTM_MEDIUM' => $record['utm']['utm_medium'],
        'UTM_CAMPAIGN' => $record['utm']['utm_campaign'],
        'UTM_CONTENT' => $record['utm']['utm_content'],
        'UTM_TERM' => $record['utm']['utm_term'],
    ];

    foreach ($utmFields as $fieldName => $fieldValue) {
        if ($fieldValue !== '') {
            $fields[$fieldName] = $fieldValue;
        }
    }

    if (!empty($config['BITRIX_ASSIGNED_BY_ID'])) {
        $fields['ASSIGNED_BY_ID'] = (int) $config['BITRIX_ASSIGNED_BY_ID'];
    }

    if ($record['phone'] !== '') {
        $fields['PHONE'] = [
            [
                'VALUE' => $record['phone'],
                'VALUE_TYPE' => 'WORK',
            ],
        ];
    }

    if ($record['email'] !== '') {
        $fields['EMAIL'] = [
            [
                'VALUE' => $record['email'],
                'VALUE_TYPE' => 'WORK',
            ],
        ];
    }

    $payload = [
        'fields' => $fields,
        'params' => [
            'REGISTER_SONET_EVENT' => 'Y',
        ],
    ];

    $result = httpPostJson($url, $payload);

    if (!empty($result['error'])) {
        $description = $result['error_description'] ?? $result['error'];
        throw new RuntimeException('Bitrix error: ' . $description);
    }

    if (!isset($result['result'])) {
        throw new RuntimeException('Bitrix error: empty result');
    }

    return [
        'id' => $result['result'],
        'raw' => $result,
    ];
}

function buildBitrixComment(array $record): string
{
    $lines = [
        'Новая заявка с сайта 4-solutions.ru',
        '',
        'Имя: ' . valueOrDash($record['name']),
        'Контакт: ' . valueOrDash($record['contact']),
        'Тип контакта: ' . valueOrDash($record['contact_type']),
    ];

    if ($record['phone'] !== '') {
        $lines[] = 'Телефон: ' . $record['phone'];
    }

    if ($record['email'] !== '') {
        $lines[] = 'Email: ' . $record['email'];
    }

    $lines = array_merge($lines, [
        '',
        'Услуга: ' . valueOrDash($record['service']),
        'Форма: ' . valueOrDash($record['form_name']),
        'Канал: ' . valueOrDash($record['channel']),
        'Точка входа: ' . valueOrDash($record['entry_point']),
        'Страница: ' . valueOrDash($record['page']),
        'Устройство: ' . valueOrDash($record['device']),
    ]);

    if ($record['message'] !== '') {
        $lines[] = '';
        $lines[] = 'Сообщение:';
        $lines[] = $record['message'];
    }

    if (
        $record['object'] !== ''
        || $record['priority'] !== ''
        || $record['mood'] !== ''
        || $record['level'] !== ''
        || $record['recommendation'] !== ''
    ) {
        $lines = array_merge($lines, [
            '',
            'Данные конструктора:',
            'Объект: ' . valueOrDash($record['object']),
            'Приоритет: ' . valueOrDash($record['priority']),
            'Атмосфера: ' . valueOrDash($record['mood']),
            'Уровень: ' . valueOrDash($record['level']),
            'Рекомендация: ' . valueOrDash($record['recommendation']),
        ]);
    }

    $lines = array_merge($lines, [
        '',
        'Attribution:',
        'source: ' . valueOrDash($record['attribution_source']),
        'landing_page: ' . valueOrDash($record['landing_page']),
        'referrer: ' . valueOrDash($record['referrer']),
        'first_seen_at: ' . valueOrDash($record['first_seen_at']),
        'last_seen_at: ' . valueOrDash($record['last_seen_at']),
        'yandex_client_id: ' . valueOrDash($record['yandex_client_id']),
        '',
        'UTM:',
        'utm_source: ' . valueOrDash($record['utm']['utm_source']),
        'utm_medium: ' . valueOrDash($record['utm']['utm_medium']),
        'utm_campaign: ' . valueOrDash($record['utm']['utm_campaign']),
        'utm_content: ' . valueOrDash($record['utm']['utm_content']),
        'utm_term: ' . valueOrDash($record['utm']['utm_term']),
        '',
        'IP: ' . valueOrDash($record['ip']),
        'User-Agent: ' . valueOrDash($record['user_agent']),
        'Request ID: ' . valueOrDash($record['request_id']),
        'Дата: ' . valueOrDash($record['created_at']),
    ]);

    return implode("\n", $lines);
}

function buildSourceDescription(array $record): string
{
    $parts = ['4-solutions.ru'];

    if ($record['utm']['utm_source'] !== '') {
        $parts[] = 'utm_source=' . $record['utm']['utm_source'];
    }

    if ($record['utm']['utm_campaign'] !== '') {
        $parts[] = 'utm_campaign=' . $record['utm']['utm_campaign'];
    }

    if ($record['attribution_source'] !== '' && $record['attribution_source'] !== $record['utm']['utm_source']) {
        $parts[] = 'source=' . $record['attribution_source'];
    }

    return implode('; ', $parts);
}

function sendToTelegram(
    array $config,
    array $record,
    bool $crmSuccess,
    mixed $crmId,
    ?string $crmError
): bool {
    $botToken = trim((string) ($config['TELEGRAM_BOT_TOKEN'] ?? ''));
    $chatId = trim((string) ($config['TELEGRAM_CHAT_ID'] ?? ''));

    if ($botToken === '' || $chatId === '') {
        return false;
    }

    $crmText = $crmSuccess
        ? '✅ CRM: заявка создана' . ($crmId ? ' #' . $crmId : '')
        : '⚠️ CRM: не приняла заявку' . ($crmError ? "\nОшибка: {$crmError}" : '');

    $text = implode("\n", [
        '🟡 Новая заявка с сайта',
        '',
        'Имя: ' . valueOrDash($record['name']),
        'Контакт: ' . valueOrDash($record['contact']),
        'Тип контакта: ' . valueOrDash($record['contact_type']),
        'Телефон: ' . valueOrDash($record['phone']),
        '',
        'Услуга: ' . valueOrDash($record['service']),
        'Форма: ' . valueOrDash($record['form_name']),
        'Точка входа: ' . valueOrDash($record['entry_point']),
        '',
        'Сообщение:',
        valueOrDash($record['message']),
        '',
        $crmText,
        '',
        'Страница: ' . valueOrDash($record['page']),
        'Request ID: ' . valueOrDash($record['request_id']),
    ]);

    $url = 'https://api.telegram.org/bot' . $botToken . '/sendMessage';

    $result = httpPostJson($url, [
        'chat_id' => $chatId,
        'text' => $text,
        'disable_web_page_preview' => true,
    ]);

    if (empty($result['ok'])) {
        $description = $result['description'] ?? 'unknown telegram error';
        throw new RuntimeException('Telegram error: ' . $description);
    }

    return true;
}

function httpPostJson(string $url, array $payload): array
{
    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json; charset=utf-8',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);

    $response = curl_exec($ch);

    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);

        throw new RuntimeException('Curl error: ' . $error);
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $decoded = json_decode($response, true);

    if (!is_array($decoded)) {
        throw new RuntimeException('Invalid JSON response, HTTP ' . $httpCode . ': ' . $response);
    }

    return $decoded;
}

function valueOrDash(mixed $value): string
{
    $value = cleanString($value);
    return $value !== '' ? $value : '—';
}

function jsonResponse(int $statusCode, array $payload): never
{
    http_response_code($statusCode);

    echo json_encode(
        $payload,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}

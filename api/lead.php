<?php

declare(strict_types=1);

$configPath = __DIR__ . '/config.php';

if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'config.php not found',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = require $configPath;

header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (!empty($config['ALLOWED_ORIGINS']) && in_array($origin, $config['ALLOWED_ORIGINS'], true)) {
    header("Access-Control-Allow-Origin: {$origin}");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', [], 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    jsonResponse(false, 'Invalid JSON', [], 400);
}

$name = cleanText($data['name'] ?? '', 100);
$phone = cleanPhone($data['phone'] ?? '');
$email = cleanText($data['email'] ?? '', 120);
$service = cleanText($data['service'] ?? '', 150);
$message = cleanText($data['message'] ?? '', 1500);
$formName = cleanText($data['formName'] ?? 'Форма сайта', 150);
$channel = cleanText($data['channel'] ?? 'website_form', 100);
$entryPoint = cleanText($data['entryPoint'] ?? '', 150);
$page = cleanText($data['page'] ?? '', 500);
$utm = is_array($data['utm'] ?? null) ? $data['utm'] : [];

if ($phone === '') {
    jsonResponse(false, 'Телефон обязателен', [], 400);
}

$requestId = bin2hex(random_bytes(8));

$leadData = [
    'request_id' => $requestId,
    'created_at' => date('c'),
    'name' => $name,
    'phone' => $phone,
    'email' => $email,
    'service' => $service,
    'message' => $message,
    'form_name' => $formName,
    'channel' => $channel,
    'entry_point' => $entryPoint,
    'page' => $page,
    'utm' => $utm,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
];

saveLog('incoming.log', $leadData);

try {
    $fields = [
        'TITLE' => buildTitle($service, $formName),
        'NAME' => $name !== '' ? $name : 'Клиент с сайта',
        'PHONE' => [
            [
                'VALUE' => $phone,
                'VALUE_TYPE' => 'WORK',
            ],
        ],
        'SOURCE_ID' => 'WEB',
        'SOURCE_DESCRIPTION' => $channel,
        'COMMENTS' => buildComments($leadData),
    ];

    if ($email !== '') {
        $fields['EMAIL'] = [
            [
                'VALUE' => $email,
                'VALUE_TYPE' => 'WORK',
            ],
        ];
    }

    if (!empty($config['ASSIGNED_BY_ID'])) {
        $fields['ASSIGNED_BY_ID'] = (int)$config['ASSIGNED_BY_ID'];
    }

    addUtmFields($fields, $utm);

    $bitrixResult = bitrixCall($config, 'crm.lead.add', [
        'fields' => $fields,
        'params' => [
            'REGISTER_SONET_EVENT' => 'Y',
        ],
    ]);

    $leadId = $bitrixResult['result'] ?? null;

    if (!$leadId) {
        throw new RuntimeException('Bitrix did not return lead ID');
    }

    sendTelegram($config, buildTelegramText($leadData, (int)$leadId));

    jsonResponse(true, 'Заявка принята', [
        'request_id' => $requestId,
        'lead_id' => $leadId,
    ]);

} catch (Throwable $e) {
    $errorData = $leadData;
    $errorData['error'] = $e->getMessage();

    saveLog('failed.log', $errorData);

    sendTelegram(
        $config,
        "⚠️ Ошибка отправки заявки в Bitrix\n\nТелефон: {$phone}\nОшибка: " . $e->getMessage()
    );

    jsonResponse(false, 'Заявка сохранена, но CRM временно не приняла данные', [
        'request_id' => $requestId,
    ], 500);
}

function cleanText($value, int $limit): string
{
    $value = trim((string)$value);
    $value = strip_tags($value);
    return mb_substr($value, 0, $limit);
}

function cleanPhone($value): string
{
    $phone = trim((string)$value);
    $phone = preg_replace('/[^\d\+\-\(\)\s]/u', '', $phone);
    return mb_substr($phone, 0, 50);
}

function buildTitle(string $service, string $formName): string
{
    if ($service !== '') {
        return 'Заявка с сайта — ' . $service;
    }

    return 'Заявка с сайта — ' . $formName;
}

function buildComments(array $lead): string
{
    $lines = [];

    $lines[] = 'Заявка с сайта';
    $lines[] = '';
    $lines[] = 'ID заявки: ' . $lead['request_id'];
    $lines[] = 'Дата: ' . $lead['created_at'];
    $lines[] = 'Форма: ' . ($lead['form_name'] ?: '-');
    $lines[] = 'Канал: ' . ($lead['channel'] ?: '-');
    $lines[] = 'Точка входа: ' . ($lead['entry_point'] ?: '-');
    $lines[] = 'Услуга: ' . ($lead['service'] ?: '-');
    $lines[] = 'Имя: ' . ($lead['name'] ?: '-');
    $lines[] = 'Телефон: ' . ($lead['phone'] ?: '-');
    $lines[] = 'Email: ' . ($lead['email'] ?: '-');
    $lines[] = 'Комментарий клиента: ' . ($lead['message'] ?: '-');
    $lines[] = 'Страница: ' . ($lead['page'] ?: '-');

    if (!empty($lead['utm'])) {
        $lines[] = '';
        $lines[] = 'UTM-метки:';

        foreach ($lead['utm'] as $key => $value) {
            $lines[] = $key . ': ' . cleanText($value, 255);
        }
    }

    $lines[] = '';
    $lines[] = 'Техническая информация:';
    $lines[] = 'IP: ' . ($lead['ip'] ?: '-');
    $lines[] = 'User-Agent: ' . ($lead['user_agent'] ?: '-');

    return implode("\n", $lines);
}

function addUtmFields(array &$fields, array $utm): void
{
    $map = [
        'utm_source' => 'UTM_SOURCE',
        'utm_medium' => 'UTM_MEDIUM',
        'utm_campaign' => 'UTM_CAMPAIGN',
        'utm_content' => 'UTM_CONTENT',
        'utm_term' => 'UTM_TERM',
    ];

    foreach ($map as $from => $to) {
        if (!empty($utm[$from])) {
            $fields[$to] = cleanText($utm[$from], 255);
        }
    }
}

function bitrixCall(array $config, string $method, array $payload): array
{
    $url = rtrim($config['BITRIX_WEBHOOK'], '/') . '/' . $method . '.json';

    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 25,
    ]);

    $response = curl_exec($ch);
    $curlError = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($response === false) {
        throw new RuntimeException('Bitrix curl error: ' . $curlError);
    }

    $decoded = json_decode($response, true);

    if (!is_array($decoded)) {
        throw new RuntimeException('Bitrix invalid response. HTTP ' . $httpCode . ': ' . $response);
    }

    if (isset($decoded['error'])) {
        $description = $decoded['error_description'] ?? $decoded['error'];
        throw new RuntimeException('Bitrix error: ' . $description);
    }

    return $decoded;
}

function saveLog(string $fileName, array $data): void
{
    $dir = __DIR__ . '/../storage/leads';

    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    file_put_contents(
        $dir . '/' . $fileName,
        json_encode($data, JSON_UNESCAPED_UNICODE) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function buildTelegramText(array $lead, int $leadId): string
{
    return
        "🔥 Новая заявка с сайта\n\n" .
        "Имя: " . ($lead['name'] ?: '-') . "\n" .
        "Телефон: " . $lead['phone'] . "\n" .
        "Услуга: " . ($lead['service'] ?: '-') . "\n" .
        "Форма: " . ($lead['form_name'] ?: '-') . "\n" .
        "Канал: " . ($lead['channel'] ?: '-') . "\n" .
        "Страница: " . ($lead['page'] ?: '-') . "\n\n" .
        "✅ Лид Bitrix ID: " . $leadId;
}

function sendTelegram(array $config, string $text): void
{
    $token = trim((string)($config['TELEGRAM_BOT_TOKEN'] ?? ''));
    $chatId = trim((string)($config['TELEGRAM_CHAT_ID'] ?? ''));

    if ($token === '' || $chatId === '') {
        return;
    }

    $url = 'https://api.telegram.org/bot' . $token . '/sendMessage';

    $payload = [
        'chat_id' => $chatId,
        'text' => $text,
        'disable_web_page_preview' => true,
    ];

    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 20,
    ]);

    curl_exec($ch);
    curl_close($ch);
}

function jsonResponse(bool $success, string $message, array $extra = [], int $status = 200): void
{
    http_response_code($status);

    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message,
    ], $extra), JSON_UNESCAPED_UNICODE);

    exit;
}
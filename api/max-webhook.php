<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/config.php';
$config = file_exists($configFile) ? require $configFile : [];

date_default_timezone_set($config['TIMEZONE'] ?? 'Europe/Moscow');

$storageDir = __DIR__ . '/../storage/max';
$usersDir = $storageDir . '/users';

@mkdir($storageDir, 0775, true);
@mkdir($usersDir, 0775, true);

function respond_json(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function log_line(string $file, array $data): void
{
    $data['logged_at'] = date('c');

    file_put_contents(
        $file,
        json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function get_header_value(string $name): string
{
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return $_SERVER[$key] ?? '';
}

function clean_source(?string $source): string
{
    $source = trim((string)$source);
    $source = preg_replace('/[^a-zA-Z0-9_\-]/', '', $source);

    return substr($source ?: 'max_unknown', 0, 128);
}

function array_get_path(array $data, array $path)
{
    $current = $data;

    foreach ($path as $key) {
        if (!is_array($current) || !array_key_exists($key, $current)) {
            return null;
        }

        $current = $current[$key];
    }

    return $current;
}

function collect_values_by_key($data, string $targetKey, array &$result = []): array
{
    if (!is_array($data)) {
        return $result;
    }

    foreach ($data as $key => $value) {
        if ($key === $targetKey && (is_string($value) || is_numeric($value))) {
            $result[] = $value;
        }

        if (is_array($value)) {
            collect_values_by_key($value, $targetKey, $result);
        }
    }

    return $result;
}

function find_first_text(array $data): string
{
    $paths = [
        ['message', 'body', 'text'],
        ['message', 'text'],
        ['body', 'text'],
        ['text'],
    ];

    foreach ($paths as $path) {
        $value = array_get_path($data, $path);

        if (is_string($value) && trim($value) !== '') {
            return trim($value);
        }
    }

    return '';
}

function find_payload(array $data): string
{
    foreach (['start_payload', 'start', 'payload'] as $key) {
        $values = [];
        collect_values_by_key($data, $key, $values);

        foreach ($values as $value) {
            if (is_string($value) && trim($value) !== '') {
                return clean_source($value);
            }
        }
    }

    return '';
}

function find_sender_user_id(array $data): ?int
{
    $paths = [
        ['message', 'sender', 'user_id'],
        ['sender', 'user_id'],
    ];

    foreach ($paths as $path) {
        $value = array_get_path($data, $path);

        if (is_numeric($value)) {
            return (int)$value;
        }
    }

    return null;
}

function find_user_id(array $data, int $botId = 0): ?int
{
    $senderId = find_sender_user_id($data);

    if ($senderId && $senderId !== $botId) {
        return $senderId;
    }

    $values = [];
    collect_values_by_key($data, 'user_id', $values);

    foreach ($values as $value) {
        $id = (int)$value;

        if ($id > 0 && $id !== $botId) {
            return $id;
        }
    }

    return null;
}

function find_chat_id(array $data): ?int
{
    $values = [];
    collect_values_by_key($data, 'chat_id', $values);

    foreach ($values as $value) {
        $id = (int)$value;

        if ($id > 0) {
            return $id;
        }
    }

    return null;
}

function default_user_state(): array
{
    return [
        'step' => 'new',
        'source' => 'max_unknown',
        'service' => '',
        'lead_created' => false,
        'last_lead_at' => '',
    ];
}

function user_file(string $usersDir, int $userId): string
{
    return $usersDir . '/' . $userId . '.json';
}

function load_user_state(string $usersDir, int $userId): array
{
    $default = default_user_state();
    $file = user_file($usersDir, $userId);

    if (!file_exists($file)) {
        return $default;
    }

    $data = json_decode((string)file_get_contents($file), true);

    if (!is_array($data)) {
        return $default;
    }

    return array_merge($default, $data);
}

function save_user_state(string $usersDir, int $userId, array $state): void
{
    $state['user_id'] = $userId;
    $state['updated_at'] = date('c');

    file_put_contents(
        user_file($usersDir, $userId),
        json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        LOCK_EX
    );
}

function remove_contact_fragments(string $text): string
{
    $text = preg_replace(
        '/(?<!\d)(?:\+7|7|8)[\s\-\(]*\d{3}[\s\-\)]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}(?!\d)/u',
        ' ',
        $text
    );

    $text = preg_replace(
        '/(?<!\d)\d{3}[\s\-\(]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}(?!\d)/u',
        ' ',
        $text
    );

    $text = preg_replace('/[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/iu', ' ', $text);
    $text = preg_replace('/@[a-zA-Z0-9_]{4,}/u', ' ', $text);

    return trim(preg_replace('/\s+/', ' ', $text));
}

function extract_phone(string $text): string
{
    $patterns = [
        '/(?<!\d)(?:\+7|7|8)[\s\-\(]*\d{3}[\s\-\)]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}(?!\d)/u',
        '/(?<!\d)\d{3}[\s\-\(]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}(?!\d)/u',
    ];

    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $text, $matches)) {
            $digits = preg_replace('/\D+/', '', $matches[0]);

            if (strlen($digits) === 11 && $digits[0] === '8') {
                return '+7' . substr($digits, 1);
            }

            if (strlen($digits) === 11 && $digits[0] === '7') {
                return '+' . $digits;
            }

            if (strlen($digits) === 10) {
                return '+7' . $digits;
            }
        }
    }

    return '';
}

function extract_email(string $text): string
{
    if (preg_match('/[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/iu', $text, $matches)) {
        return $matches[0];
    }

    return '';
}

function extract_username(string $text): string
{
    if (preg_match('/@[a-zA-Z0-9_]{4,}/u', $text, $matches)) {
        return $matches[0];
    }

    return '';
}

function has_contact(string $text): bool
{
    return extract_phone($text) !== ''
        || extract_email($text) !== ''
        || extract_username($text) !== '';
}

function extract_service(string $text): string
{
    $t = mb_strtolower(trim($text));

    if ($t === '1') {
        return 'Ремонт';
    }

    if ($t === '2') {
        return 'Дизайн-проект';
    }

    if ($t === '3') {
        return 'Строительство';
    }

    if ($t === '4') {
        return 'Комплектация';
    }

    if ($t === '5') {
        return 'Связаться с менеджером';
    }

    if (str_contains($t, 'дизайн') || str_contains($t, 'проект')) {
        return 'Дизайн-проект';
    }

    if (str_contains($t, 'ремонт') || str_contains($t, 'отделк')) {
        return 'Ремонт';
    }

    if (str_contains($t, 'строит') || str_contains($t, 'коттедж') || str_contains($t, 'дом')) {
        return 'Строительство';
    }

    if (str_contains($t, 'комплект') || str_contains($t, 'материал') || str_contains($t, 'снабжен')) {
        return 'Комплектация';
    }

    if (str_contains($t, 'менеджер') || str_contains($t, 'связ') || str_contains($t, 'консультац')) {
        return 'Связаться с менеджером';
    }

    return '';
}

function extract_object_type(string $text): string
{
    $t = mb_strtolower($text);

    if (str_contains($t, 'квартир') || str_contains($t, 'хата') || str_contains($t, 'новострой')) {
        return 'Квартира';
    }

    if (str_contains($t, 'дом') || str_contains($t, 'коттедж') || str_contains($t, 'таунхаус')) {
        return 'Дом';
    }

    if (str_contains($t, 'офис')) {
        return 'Офис';
    }

    if (str_contains($t, 'помещен') || str_contains($t, 'коммерч')) {
        return 'Помещение';
    }

    if (str_contains($t, 'студия')) {
        return 'Студия';
    }

    return '';
}

function extract_area(string $text): string
{
    $clean = remove_contact_fragments($text);

    if (preg_match('/(?<!\d)(\d{1,4})\s*(м2|м²|кв\.?\s*м|квм|кв|метр(?:ов|а)?)(?![а-яa-z0-9])/iu', $clean, $matches)) {
        return $matches[1] . ' м²';
    }

    return '';
}

function extract_name(string $text): string
{
    $text = remove_contact_fragments($text);

    $service = extract_service($text);
    $object = extract_object_type($text);
    $area = extract_area($text);

    if ($area !== '') {
        $text = preg_replace('/(?<!\d)\d{1,4}\s*(м2|м²|кв\.?\s*м|квм|кв|метр(?:ов|а)?)(?![а-яa-z0-9])/iu', ' ', $text);
    }

    $stopWords = [
        'квартира', 'квартиру', 'квартиры', 'кв', 'м2', 'м²', 'метров', 'метра',
        'дом', 'хата', 'помещение', 'офис', 'студия',
        'ремонт', 'дизайн', 'строительство', 'комплектация',
        'нужен', 'нужна', 'нужно', 'хочу', 'интересует', 'надо',
        'площадь', 'трёшка', 'трешка', '3шка', 'двушка', 'однушка',
        'проект', 'дизайнпроект', 'дизайн-проект',
        'рассчитать', 'стоимость', 'цена',
    ];

    foreach ($stopWords as $word) {
        $text = preg_replace('/(^|[\s,.;:()\-])' . preg_quote($word, '/') . '(?=$|[\s,.;:()\-])/iu', ' ', $text);
    }

    $text = preg_replace('/\d+/u', ' ', $text);
    $text = preg_replace('/[,;:.\-()]+/u', ' ', $text);
    $text = trim(preg_replace('/\s+/', ' ', $text));

    if ($text === '') {
        return 'Клиент MAX';
    }

    $parts = preg_split('/\s+/u', $text);
    $name = trim(implode(' ', array_slice($parts, 0, 2)));

    return $name !== '' ? mb_substr($name, 0, 80) : 'Клиент MAX';
}

function menu_text(): string
{
    return "Выберите, что вас интересует:\n\n"
        . "1 — Рассчитать ремонт\n"
        . "2 — Дизайн-проект\n"
        . "3 — Строительство\n"
        . "4 — Комплектация материалами\n"
        . "5 — Связаться с менеджером";
}

function welcome_text(): string
{
    return "Здравствуйте! Вы написали в компанию «4 Решения».\n\n"
        . "Опишите задачу свободно: ремонт, дизайн-проект, строительство или комплектация.\n\n"
        . "Например:\n"
        . "«Нужен дизайн квартиры 100 м²»\n"
        . "или\n"
        . "«Анна, +7 999 000-00-00, квартира 100 м², нужен дизайн»\n\n"
        . "Если хотите выбрать из списка — напишите «меню».";
}

function build_parsed_message(array $state, string $source, ?int $userId, ?int $chatId, string $text): array
{
    $service = extract_service($text);

    if ($service === '') {
        $service = $state['service'] ?? '';
    }

    if ($service === '') {
        $service = 'MAX обращение';
    }

    $phone = extract_phone($text);
    $email = extract_email($text);
    $username = extract_username($text);

    $status = ($phone !== '' || $email !== '' || $username !== '')
        ? 'lead_ready'
        : 'contact_required';

    return [
        'source' => $source,
        'status' => $status,
        'service' => $service,
        'name' => extract_name($text),
        'phone' => $phone,
        'email' => $email,
        'username' => $username,
        'object' => extract_object_type($text),
        'area' => extract_area($text),
        'raw_message' => $text,
        'user_id' => $userId,
        'chat_id' => $chatId,
    ];
}

function http_post_json(string $url, array $headers, array $body): array
{
    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_TIMEOUT => 20,
    ]);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    return [
        'status' => $status,
        'response' => $response,
        'error' => $error,
    ];
}

function send_max_message(array $config, ?int $userId, ?int $chatId, string $text): array
{
    $token = trim((string)($config['MAX_BOT_TOKEN'] ?? ''));

    if ($token === '') {
        return [
            'status' => 0,
            'response' => '',
            'error' => 'MAX_BOT_TOKEN is empty',
        ];
    }

    if ($userId) {
        $url = 'https://platform-api.max.ru/messages?user_id=' . urlencode((string)$userId);
    } elseif ($chatId) {
        $url = 'https://platform-api.max.ru/messages?chat_id=' . urlencode((string)$chatId);
    } else {
        return [
            'status' => 0,
            'response' => '',
            'error' => 'No user_id or chat_id',
        ];
    }

    return http_post_json(
        $url,
        [
            'Authorization: ' . $token,
            'Content-Type: application/json; charset=utf-8',
        ],
        [
            'text' => $text,
            'notify' => true,
        ]
    );
}

function create_bitrix_lead(array $config, array $lead): array
{
    $webhook = rtrim((string)($config['BITRIX_WEBHOOK'] ?? ''), '/');

    if ($webhook === '') {
        return [
            'status' => 0,
            'response' => '',
            'error' => 'BITRIX_WEBHOOK is empty',
        ];
    }

    $url = $webhook . '/crm.lead.add.json';

    $comments = [
        'Источник: MAX',
        'Статус: ' . ($lead['status'] ?? '-'),
        'Метка: ' . ($lead['source'] ?? 'max_unknown'),
        'Направление: ' . ($lead['service'] ?? '-'),
        'Объект: ' . ($lead['object'] ?? '-'),
        'Площадь: ' . ($lead['area'] ?? '-'),
        'MAX user_id: ' . ($lead['user_id'] ?? '-'),
        'MAX chat_id: ' . ($lead['chat_id'] ?? '-'),
    ];

    if (!empty($lead['username'])) {
        $comments[] = 'Username/контакт: ' . $lead['username'];
    }

    $comments[] = '';
    $comments[] = 'Сообщение клиента:';
    $comments[] = $lead['raw_message'] ?? '';

    $fields = [
        'TITLE' => 'MAX: ' . ($lead['service'] ?: 'обращение клиента'),
        'NAME' => $lead['name'] ?: 'Клиент MAX',
        'OPENED' => 'Y',
        'SOURCE_ID' => 'WEB',
        'SOURCE_DESCRIPTION' => 'MAX bot / ' . ($lead['source'] ?? 'max_unknown'),
        'COMMENTS' => implode("\n", $comments),
    ];

    if (!empty($lead['phone'])) {
        $fields['PHONE'] = [
            [
                'VALUE' => $lead['phone'],
                'VALUE_TYPE' => 'WORK',
            ],
        ];
    }

    if (!empty($lead['email'])) {
        $fields['EMAIL'] = [
            [
                'VALUE' => $lead['email'],
                'VALUE_TYPE' => 'WORK',
            ],
        ];
    }

    if (!empty($config['BITRIX_ASSIGNED_BY_ID'])) {
        $fields['ASSIGNED_BY_ID'] = (int)$config['BITRIX_ASSIGNED_BY_ID'];
    }

    return http_post_json(
        $url,
        ['Content-Type: application/json; charset=utf-8'],
        [
            'fields' => $fields,
            'params' => [
                'REGISTER_SONET_EVENT' => 'Y',
            ],
        ]
    );
}

function save_inquiry(string $storageDir, array $parsed): void
{
    log_line($storageDir . '/inquiry.log', $parsed);
}

function save_lead_ready(string $storageDir, array $config, array $parsed): void
{
    log_line($storageDir . '/lead-ready.log', $parsed);

    if ((bool)($config['MAX_CREATE_BITRIX_LEAD'] ?? false)) {
        $bitrixResult = create_bitrix_lead($config, $parsed);

        log_line($storageDir . '/bitrix.log', [
            'lead' => $parsed,
            'result' => $bitrixResult,
        ]);
    }
}

function save_bitrix_inquiry_if_enabled(string $storageDir, array $config, array $parsed): void
{
    if (!(bool)($config['MAX_CREATE_BITRIX_INQUIRY'] ?? false)) {
        return;
    }

    $bitrixResult = create_bitrix_lead($config, $parsed);

    log_line($storageDir . '/bitrix-inquiry.log', [
        'lead' => $parsed,
        'result' => $bitrixResult,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_json([
        'ok' => true,
        'message' => 'MAX webhook endpoint is alive',
    ]);
}

$secret = (string)($config['MAX_WEBHOOK_SECRET'] ?? '');
$requireSecret = (bool)($config['MAX_REQUIRE_SECRET'] ?? false);

if ($requireSecret && $secret !== '') {
    $incomingSecret = get_header_value('X-Max-Bot-Api-Secret');

    if (!hash_equals($secret, $incomingSecret)) {
        log_line($storageDir . '/failed.log', [
            'reason' => 'bad_secret',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]);

        respond_json([
            'ok' => false,
            'error' => 'Forbidden',
        ], 403);
    }
}

$raw = file_get_contents('php://input') ?: '';
$data = json_decode($raw, true);

if (!is_array($data)) {
    log_line($storageDir . '/failed.log', [
        'reason' => 'invalid_json',
        'raw' => $raw,
    ]);

    respond_json([
        'ok' => false,
        'error' => 'Invalid JSON',
    ], 400);
}

$hash = hash('sha256', $raw);
$processedFile = $storageDir . '/processed.log';
$processed = file_exists($processedFile) ? (string)file_get_contents($processedFile) : '';

if (str_contains($processed, $hash)) {
    respond_json([
        'ok' => true,
        'duplicate' => true,
    ]);
}

$botId = (int)($config['MAX_BOT_ID'] ?? 0);
$senderId = find_sender_user_id($data);

if ($senderId && $senderId === $botId) {
    file_put_contents($processedFile, $hash . PHP_EOL, FILE_APPEND | LOCK_EX);

    respond_json([
        'ok' => true,
        'ignored' => 'bot_own_message',
    ]);
}

$userId = find_user_id($data, $botId);
$chatId = find_chat_id($data);
$text = find_first_text($data);
$payload = find_payload($data);

$source = clean_source($payload ?: 'max_unknown');

if ($userId) {
    $state = load_user_state($usersDir, $userId);

    if ($payload !== '') {
        $state['source'] = clean_source($payload);
    }

    $source = clean_source($state['source'] ?? $source);
} else {
    $state = default_user_state();
    $state['source'] = $source;
}

log_line($storageDir . '/incoming.log', [
    'hash' => $hash,
    'source' => $source,
    'user_id' => $userId,
    'chat_id' => $chatId,
    'text' => $text,
    'state_before' => $state,
    'raw' => $data,
]);

$replyText = '';
$lowerText = mb_strtolower(trim($text));

$isMenuCommand = in_array($lowerText, [
    'меню',
    'menu',
], true);

$isResetCommand = in_array($lowerText, [
    'старт',
    '/start',
    'start',
    'начать',
    'заново',
    'сначала',
], true);

if ($text === '') {
    $state['step'] = 'welcome';
    $replyText = welcome_text();
} elseif ($isResetCommand) {
    $state = default_user_state();
    $state['source'] = $source;
    $state['step'] = 'welcome';

    $replyText = welcome_text();
} elseif ($isMenuCommand) {
    $state['step'] = 'menu';

    $replyText = menu_text();
} else {
    $parsed = build_parsed_message($state, $source, $userId, $chatId, $text);
    save_inquiry($storageDir, $parsed);

    if ($parsed['status'] === 'lead_ready') {
        save_lead_ready($storageDir, $config, $parsed);

        $state['step'] = 'done';
        $state['service'] = $parsed['service'];
        $state['lead_created'] = true;
        $state['last_lead_at'] = date('c');

        $replyText = "Спасибо! Мы получили вашу заявку.\n\n"
            . "Специалист компании «4 Решения» свяжется с вами в ближайшее время.";
    } else {
        save_bitrix_inquiry_if_enabled($storageDir, $config, $parsed);

        $state['step'] = 'contact_required';
        $state['service'] = $parsed['service'] !== 'MAX обращение'
            ? $parsed['service']
            : ($state['service'] ?? '');
        $state['lead_created'] = false;

        $serviceLine = $parsed['service'] !== 'MAX обращение'
            ? "\n\nНаправление: {$parsed['service']}."
            : '';

        $replyText = "Спасибо, мы получили ваше сообщение.{$serviceLine}\n\n"
            . "Чтобы менеджер быстрее связался с вами, напишите, пожалуйста, номер телефона.\n"
            . "Если удобнее — можете продолжить общение здесь в MAX.\n\n"
            . "Для выбора направления можно написать «меню».";
    }
}

if ($userId) {
    save_user_state($usersDir, $userId, $state);
}

if ((bool)($config['MAX_AUTO_REPLY'] ?? false) && ($userId || $chatId) && $replyText !== '') {
    $maxResult = send_max_message($config, $userId, $chatId, $replyText);

    log_line($storageDir . '/outgoing.log', [
        'type' => 'scenario_reply',
        'user_id' => $userId,
        'chat_id' => $chatId,
        'source' => $source,
        'reply_text' => $replyText,
        'result' => $maxResult,
    ]);
}

file_put_contents($processedFile, $hash . PHP_EOL, FILE_APPEND | LOCK_EX);

respond_json([
    'ok' => true,
    'source' => $source,
    'user_id' => $userId,
    'chat_id' => $chatId,
    'has_text' => $text !== '',
    'step' => $state['step'] ?? null,
]);
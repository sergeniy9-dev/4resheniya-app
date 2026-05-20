<?php

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'ok' => true,
    'php' => PHP_VERSION,
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'CLI',
    'time' => date('c'),
], JSON_UNESCAPED_UNICODE);
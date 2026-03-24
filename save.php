<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['error' => 'Method Not Allowed']); exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['path']) || !isset($input['content'])) {
    http_response_code(400); echo json_encode(['error' => 'Missing path or content']); exit;
}

$path = $input['path'];
// Lolipop WAF対策としてBase64エンコードされたコンテンツをデコードする
$content = base64_decode($input['content']);

if (strpos($path, '..') !== false || !preg_match('/^src(\d{2})?\//', $path)) {
    http_response_code(400); echo json_encode(['error' => 'Invalid file path']); exit;
}

$filepath = __DIR__ . '/' . $path;
$dir = dirname($filepath);
if (!file_exists($dir)) {
    // ロリポップでの権限エラーを防ぐため 0755 を指定
    mkdir($dir, 0755, true);
}

if (file_put_contents($filepath, $content) !== false) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500); 
    // より詳細なエラーを出力
    $error = error_get_last();
    echo json_encode(['error' => 'Failed to write file: ' . ($error['message'] ?? 'Unknown error')]);
}

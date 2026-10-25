<?php
// Receives the request form from the site and forwards it, with the photos,
// to the master's Telegram through a bot. Setup: docs/plan.md.
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = ['image/png' => 'png', 'image/jpeg' => 'jpg'];
const FIELD_LIMITS = ['tech' => 200, 'problem' => 3000, 'place' => 200, 'phone' => 50];
const RATE_LIMIT = 5;          // requests from one address...
const RATE_WINDOW = 10 * 60;   // ...per this many seconds

function reply(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function field(string $name, bool $required): string
{
    $value = trim((string) ($_POST[$name] ?? ''));
    $value = mb_substr($value, 0, FIELD_LIMITS[$name]);
    if ($required && $value === '') {
        reply(422, ['ok' => false, 'error' => "missing_$name"]);
    }
    return $value;
}

function telegram(string $token, string $method, array $params): array
{
    $curl = curl_init("https://api.telegram.org/bot$token/$method");
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $params,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 60,
    ]);
    $raw = curl_exec($curl);
    $error = curl_error($curl);
    curl_close($curl);
    $data = is_string($raw) ? json_decode($raw, true) : null;
    return is_array($data) ? $data : ['ok' => false, 'description' => $error ?: 'no response'];
}

// One photo goes as sendPhoto, several as an album. Telegram refuses some
// images as photos (odd sizes), so on failure they are retried as files.
function sendPhotos(string $token, string $chatId, array $photos): bool
{
    foreach (['photo', 'document'] as $kind) {
        if (count($photos) === 1) {
            $method = $kind === 'photo' ? 'sendPhoto' : 'sendDocument';
            $photo = $photos[0];
            $result = telegram($token, $method, [
                'chat_id' => $chatId,
                $kind => new CURLFile($photo['path'], $photo['mime'], $photo['name']),
            ]);
        } else {
            $params = ['chat_id' => $chatId];
            $media = [];
            foreach ($photos as $i => $photo) {
                $media[] = ['type' => $kind, 'media' => "attach://file$i"];
                $params["file$i"] = new CURLFile($photo['path'], $photo['mime'], $photo['name']);
            }
            $params['media'] = json_encode($media);
            $result = telegram($token, 'sendMediaGroup', $params);
        }
        if ($result['ok'] ?? false) {
            return true;
        }
    }
    return false;
}

function rateLimited(): bool
{
    $file = sys_get_temp_dir() . '/zayavka-' . md5($_SERVER['REMOTE_ADDR'] ?? '') . '.json';
    $now = time();
    $times = is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
    $times = array_values(array_filter($times, fn ($t) => $t > $now - RATE_WINDOW));
    if (count($times) >= RATE_LIMIT) {
        return true;
    }
    $times[] = $now;
    file_put_contents($file, json_encode($times), LOCK_EX);
    return false;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(405, ['ok' => false, 'error' => 'method']);
}

// The upload was bigger than the hosting allows: PHP drops the whole body.
if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    reply(413, ['ok' => false, 'error' => 'too_large']);
}

// Bots fill the hidden "website" field; pretend all went well.
if (($_POST['website'] ?? '') !== '') {
    reply(200, ['ok' => true]);
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    reply(500, ['ok' => false, 'error' => 'not_configured']);
}
$config = require $configFile;

$tech = field('tech', true);
$problem = field('problem', true);
$place = field('place', false);
$phone = field('phone', true);

$photos = [];
$files = $_FILES['photos'] ?? null;
if (is_array($files) && is_array($files['name'])) {
    if (count($files['name']) > MAX_PHOTOS) {
        reply(422, ['ok' => false, 'error' => 'too_many_photos']);
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    foreach (array_keys($files['name']) as $i) {
        if ($files['error'][$i] === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($files['error'][$i] !== UPLOAD_ERR_OK || $files['size'][$i] > MAX_PHOTO_BYTES) {
            reply(422, ['ok' => false, 'error' => 'photo_size']);
        }
        $mime = $finfo->file($files['tmp_name'][$i]);
        if (!isset(PHOTO_TYPES[$mime])) {
            reply(422, ['ok' => false, 'error' => 'photo_type']);
        }
        $photos[] = [
            'path' => $files['tmp_name'][$i],
            'mime' => $mime,
            'name' => 'foto-' . ($i + 1) . '.' . PHOTO_TYPES[$mime],
        ];
    }
}

if (rateLimited()) {
    reply(429, ['ok' => false, 'error' => 'rate_limit']);
}

$escape = fn (string $text) => htmlspecialchars($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
$lines = [
    '<b>Заявка с сайта</b>',
    '',
    '<b>Техника:</b> ' . $escape($tech),
    '<b>Что случилось:</b> ' . $escape($problem),
];
if ($place !== '') {
    $lines[] = '<b>Где находится:</b> ' . $escape($place);
}
$lines[] = '<b>Телефон:</b> ' . $escape($phone);
if ($photos) {
    $lines[] = '<b>Фото:</b> ' . count($photos) . ' шт., ниже';
}

$token = $config['bot_token'];
$chatId = (string) $config['chat_id'];

$sent = telegram($token, 'sendMessage', [
    'chat_id' => $chatId,
    'text' => implode("\n", $lines),
    'parse_mode' => 'HTML',
]);
if (!($sent['ok'] ?? false)) {
    reply(502, ['ok' => false, 'error' => 'telegram']);
}

// The request text already reached the master, so the client sees success
// either way; if the photos fail, the master is told to ask for them.
if ($photos && !sendPhotos($token, $chatId, $photos)) {
    telegram($token, 'sendMessage', [
        'chat_id' => $chatId,
        'text' => 'Фото к этой заявке не дошли (' . count($photos) . ' шт.). Попросите клиента прислать их в Telegram.',
    ]);
}

reply(200, ['ok' => true]);

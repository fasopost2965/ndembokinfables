<?php
/**
 * GitHub Webhook Handler — déclenche deploy.sh sur push vers main.
 * Configurer dans GitHub : Settings → Webhooks → Payload URL = https://crm.ndembokin.com/deploy/webhook.php
 * Content type : application/json | Secret : la valeur de WEBHOOK_SECRET ci-dessous
 */

define('WEBHOOK_SECRET', getenv('WEBHOOK_SECRET') ?: 'changez-ce-secret-en-production');
define('DEPLOY_SCRIPT', '/home/u562454273/domains/ndembokin.com/public_html/crm/deploy/deploy.sh');
define('LOG_FILE',      '/home/u562454273/.pm2/logs/deploy.log');

$payload = file_get_contents('php://input');
$sig     = 'sha256=' . hash_hmac('sha256', $payload, WEBHOOK_SECRET);

if (!hash_equals($sig, $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '')) {
    http_response_code(403);
    echo json_encode(['error' => 'Signature invalide']);
    exit;
}

$data = json_decode($payload, true);

if (($data['ref'] ?? '') !== 'refs/heads/main') {
    http_response_code(200);
    echo json_encode(['message' => 'Branche ignorée — seul main déclenche un déploiement']);
    exit;
}

// Lancer le script en arrière-plan (non bloquant)
$cmd = 'bash ' . escapeshellarg(DEPLOY_SCRIPT) . ' >> ' . escapeshellarg(LOG_FILE) . ' 2>&1 &';
exec($cmd);

http_response_code(200);
echo json_encode([
    'message' => 'Déploiement lancé',
    'commit'  => $data['after'] ?? 'unknown',
    'pusher'  => $data['pusher']['name'] ?? 'unknown',
]);

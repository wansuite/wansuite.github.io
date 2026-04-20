<?php
/**
 * CN visitor blocker.
 *
 * Tries multiple GeoIP backends in order. If none available, falls back to
 * checking the visitor IP against the static cn_v4.cidr file (slower).
 *
 * Usage:
 *   - Drop in alongside your HTML
 *   - Either include from each page:   <?php require __DIR__.'/block_cn.php'; ?>
 *   - Or set in .htaccess:             php_value auto_prepend_file /path/to/block_cn.php
 */

declare(strict_types=1);

(function () {
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP']  // Cloudflare
       ?? $_SERVER['HTTP_X_FORWARDED_FOR']   // Behind proxy
       ?? $_SERVER['REMOTE_ADDR']
       ?? '';
    if ($ip === '') return;
    // X-Forwarded-For may be a comma list — take first
    $ip = trim(explode(',', $ip)[0]);

    // Allowlist localhost / private ranges
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
        return;
    }

    $country = detect_country($ip);
    if ($country === 'CN') {
        block_visitor();
    }
})();

// -----------------------------------------------------------------------------

function detect_country(string $ip): ?string {
    // 1. Apache mod_geoip (sets env var server-side, fastest)
    if (!empty($_SERVER['GEOIP_COUNTRY_CODE'])) {
        return strtoupper($_SERVER['GEOIP_COUNTRY_CODE']);
    }

    // 2. Cloudflare proxy header (only if behind CF — not needed on HKUST)
    if (!empty($_SERVER['HTTP_CF_IPCOUNTRY'])) {
        return strtoupper($_SERVER['HTTP_CF_IPCOUNTRY']);
    }

    // 3. PECL geoip extension (legacy)
    if (function_exists('geoip_country_code_by_name')) {
        $c = @geoip_country_code_by_name($ip);
        if ($c) return strtoupper($c);
    }

    // 4. MaxMind GeoIP2 (modern) if composer-installed
    $mmdb = __DIR__ . '/GeoLite2-Country.mmdb';
    if (file_exists($mmdb) && class_exists('\\GeoIp2\\Database\\Reader')) {
        try {
            $reader = new \GeoIp2\Database\Reader($mmdb);
            return strtoupper($reader->country($ip)->country->isoCode);
        } catch (\Throwable $e) { /* fall through */ }
    }

    // 5. Static CIDR list fallback (works even with no extensions)
    $cidr_file = __DIR__ . '/cn_v4.cidr';
    if (file_exists($cidr_file) && filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        if (ip_in_cidr_file($ip, $cidr_file)) return 'CN';
    }

    return null;
}

function ip_in_cidr_file(string $ip, string $file): bool {
    $ip_long = ip2long($ip);
    if ($ip_long === false) return false;

    // Lazy cache: parse CIDRs once into binary tuples [ip_long, mask_long]
    static $cidrs = null;
    if ($cidrs === null) {
        $cidrs = [];
        $fh = fopen($file, 'r');
        while (($line = fgets($fh)) !== false) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') continue;
            [$net, $prefix] = explode('/', $line) + [null, '32'];
            $net_long = ip2long($net);
            if ($net_long === false) continue;
            $mask = $prefix == 0 ? 0 : (-1 << (32 - (int)$prefix)) & 0xFFFFFFFF;
            $cidrs[] = [$net_long & $mask, $mask];
        }
        fclose($fh);
        sort($cidrs);
    }

    // Linear scan; for ~9k entries this is ~1ms.
    foreach ($cidrs as [$net, $mask]) {
        if (($ip_long & $mask) === $net) return true;
    }
    return false;
}

function block_visitor(): void {
    http_response_code(403);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    $page = __DIR__ . '/blocked.html';
    if (file_exists($page)) {
        readfile($page);
    } else {
        echo '<!doctype html><meta charset="utf-8"><title>Not available</title>';
        echo '<p style="font-family:sans-serif;padding:2em">This page is not available in your region.</p>';
    }
    exit;
}

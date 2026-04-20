# CN visitor blocker — HKUST Personal Homepage

Two parallel mechanisms; pick whichever your HKUST Apache supports.

## Files

| File | Purpose |
|---|---|
| `block_cn.php` | PHP blocker. Tries multiple GeoIP backends in order. Drop-in. |
| `cn_v4.cidr` | 8,788 mainland-CN IPv4 CIDR blocks (APNIC delegation file). |
| `.htaccess.cn-only` | Pure Apache `<RequireAll>` rules using the CIDR list. **Not used by default** — use only if PHP is unavailable on your hosting. |
| `blocked.html` | Friendly block page shown to CN visitors. |
| `.htaccess` | Restricts direct browsing of these support files. |

## Recommended setup (PHP, fastest, easiest to maintain)

1. Upload this entire `cn-block/` folder to `~/public_html/cn-block/` on HKUST.
2. In your **root** `.htaccess` (one level up, in `~/public_html/`), add:
   ```apache
   php_value auto_prepend_file "/home/<your-account>/public_html/cn-block/block_cn.php"
   ```
   The `hkust-deploy/.htaccess` template already includes this — just edit the path to match your account name.

3. If your pages are `.html` (not `.php`), tell Apache to run them through PHP:
   ```apache
   AddType application/x-httpd-php .html .htm
   ```
   Same template has this commented out — uncomment if needed.

4. Test: visit your site from a CN VPN exit. You should get the `blocked.html` page.

## Fallback setup (pure Apache, no PHP needed)

If HKUST disables PHP for your account:

1. Rename `.htaccess.cn-only` → `.htaccess` and place it in `~/public_html/`.
2. Apache will check every request against ~9,000 CIDRs. Slower than PHP but works.

## How GeoIP detection works (in priority order)

`block_cn.php` checks these in sequence; first hit wins:

1. **`$_SERVER['GEOIP_COUNTRY_CODE']`** — if HKUST has `mod_geoip` enabled, this is set automatically. Fastest.
2. **`$_SERVER['HTTP_CF_IPCOUNTRY']`** — only if you ever proxy through Cloudflare. Not relevant for HKUST hosting.
3. **`geoip_country_code_by_name($ip)`** — PECL GeoIP extension, if installed.
4. **MaxMind GeoIP2** — if you install the `geoip2/geoip2` Composer package and place a `GeoLite2-Country.mmdb` here.
5. **Static `cn_v4.cidr` lookup** — always works, no extensions needed. ~1ms per request for 9K entries.

## Refreshing the CIDR list

The APNIC file changes weekly as new IP ranges are allocated. Re-run:

```bash
curl -sS "https://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest" -o /tmp/apnic.txt
python3 build_cn_block.py
```

Then re-upload `cn_v4.cidr` and `.htaccess.cn-only`.

Suggest doing this every 1–3 months.

## Caveats

- **Hong Kong is NOT blocked.** APNIC `CN` = mainland only. Hong Kong (`HK`), Taiwan (`TW`), Macao (`MO`) are separate codes.
- **VPN bypass.** Visitors behind non-CN VPN exits will not be blocked.
- **You'll never see CN traffic in your logs.** If you also want to *count* blocked attempts, add a `file_put_contents` line in `block_visitor()` to append to a log.
- **Your own access from a CN trip.** If you travel to mainland China and don't VPN out, you'll lock yourself out. Consider an allowlist for your home IP.

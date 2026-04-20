# HKUST Personal Homepage — deployment package

This folder contains everything needed to host the academic site at `imwan.people.ust.hk` with mainland-CN visitors blocked at the server level.

## Layout

```
hkust-deploy/
├── .htaccess              ← root rules: HTTPS redirect, auto-prepend PHP blocker, caching
├── cn-block/
│   ├── block_cn.php       ← multi-backend GeoIP blocker
│   ├── cn_v4.cidr         ← 8,788 mainland CN CIDRs (APNIC, refresh quarterly)
│   ├── blocked.html       ← friendly page shown to blocked visitors
│   ├── .htaccess.cn-only  ← Apache-only fallback (no PHP needed)
│   ├── .htaccess          ← protects support files from direct browsing
│   ├── build_cn_block.py  ← regenerate CIDR list from APNIC
│   └── README.md          ← detailed setup notes for the blocker
```

## Quick deployment

1. **Edit `.htaccess`** (this folder). Find the line:
   ```apache
   php_value auto_prepend_file "/home/imwan/public_html/cn-block/block_cn.php"
   ```
   Replace `imwan` with your actual HKUST account name if different.

2. **Connect via SFTP** (per HKUST instructions):
   - Host: `sftp.people.ust.hk`
   - User: your HKUST account
   - Connect over the HKUST VPN
   - Tool: FileZilla

3. **Upload everything** in this folder (and your HTML/CSS/JS) to `~/public_html/`. The `.htaccess` files must be uploaded; they are hidden by default — enable "show hidden files" in FileZilla.

4. **Test (~/public_html/ should now contain):**
   ```
   index.html
   research.html
   teaching.html
   about.html
   .htaccess
   .nojekyll                (harmless, can leave or delete)
   assets/
   cn-block/
       block_cn.php
       cn_v4.cidr
       ...
   ```

5. **Verify:**
   - Visit `https://<account>.people.ust.hk/` — should load
   - Use a CN VPN exit → should see the blocked page
   - HKUST campus / HK / international IPs → unaffected

## Notes on the academic site content

If you copy the full current site (including the "ML in Practice" / SFG / AGR section), be aware HKUST IT and faculty conflict-of-interest rules apply more strictly to content on the `*.people.ust.hk` domain.

**Recommended:** for the HKUST-hosted version, **remove the "ML in Practice" section entirely** and keep that content only on `wansuite.github.io`. The academic pages (Research, Teaching, About) carry no policy risk.

Ask Claude to produce a stripped academic-only build in `hkust-deploy/site/` if you want it pre-trimmed.

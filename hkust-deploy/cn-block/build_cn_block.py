"""Convert APNIC delegation file CN entries to .htaccess + plain CIDR list."""
import math, ipaddress, sys
from pathlib import Path

OUT_DIR = Path("/Users/neuronpro/My Drive/MyPage/hkust-deploy/cn-block")
OUT_DIR.mkdir(parents=True, exist_ok=True)

apnic = Path("/tmp/apnic.txt").read_text().splitlines()

cidrs = []
for line in apnic:
    if not line or line.startswith("#"):
        continue
    parts = line.split("|")
    if len(parts) < 5:
        continue
    if parts[0] != "apnic" or parts[1] != "CN" or parts[2] != "ipv4":
        continue
    start_ip = parts[3]
    count = int(parts[4])
    # APNIC counts are not always power of 2 — split into multiple CIDRs.
    network = ipaddress.summarize_address_range(
        ipaddress.IPv4Address(start_ip),
        ipaddress.IPv4Address(int(ipaddress.IPv4Address(start_ip)) + count - 1),
    )
    for n in network:
        cidrs.append(str(n))

cidrs.sort(key=lambda c: int(ipaddress.IPv4Network(c).network_address))
print(f"Total CN IPv4 CIDRs: {len(cidrs)}")

(OUT_DIR / "cn_v4.cidr").write_text("\n".join(cidrs) + "\n")

# Apache .htaccess (Apache 2.4 syntax, with 2.2 fallback comments)
ht = ["# CN IPv4 block list — generated from APNIC delegation file",
      "# Regenerate periodically with build_cn_block.py.",
      "# Apache 2.4 syntax. For 2.2 use 'Order deny,allow' / 'Deny from <ip>'.",
      "",
      "<RequireAll>",
      "    Require all granted"]
for c in cidrs:
    ht.append(f"    Require not ip {c}")
ht.append("</RequireAll>")
(OUT_DIR / ".htaccess.cn-only").write_text("\n".join(ht) + "\n")

print(f"Wrote: {OUT_DIR/'cn_v4.cidr'}  ({len(cidrs)} CIDRs)")
print(f"Wrote: {OUT_DIR/'.htaccess.cn-only'}")

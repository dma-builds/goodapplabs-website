"""Email subscribers that a new update is up: a short heads-up with the title and a link.

    python3 updates/send_update.py 2026-10-30                  # preview, then send after you confirm
    python3 updates/send_update.py 2026-10-30 --to me@x.com    # send one test copy (not recorded)
    python3 updates/send_update.py 2026-10-30 --dry-run        # show who would get it, send nothing
    python3 updates/send_update.py --list                      # show the subscriber list
    add --local to any of these to use the local dev database instead of the live one

Each send is recorded in the deliveries table, so a post goes to each person once. Rerunning
after editing a post (or after a send that stopped partway) only reaches people who haven't had
it. Mail goes out through Gmail SMTP as GMAIL_USER, with an app password kept in the macOS
keychain:

    security add-generic-password -a david@goodapplabs.com -s gal-updates-gmail -w
"""
import datetime as dt
import json
import pathlib
import re
import smtplib
import subprocess
import sys
import time
from email.message import EmailMessage
from email.utils import formataddr, make_msgid
from html import escape, unescape

SITE = "https://goodapplabs.ai"
GMAIL_USER = "david@goodapplabs.com"
FROM_NAME = "David at GoodApp Labs"
KEYCHAIN_SERVICE = "gal-updates-gmail"
# Bulk-email law (CAN-SPAM) wants a postal address in every email. A PO box is fine.
MAILING_ADDRESS = "2108 N St Ste N, Sacramento, CA 95816"

HERE = pathlib.Path(__file__).parent
ROOT = HERE.parent
POST = re.compile(r'<a href="/updates/(\d{4}-\d{2}-\d{2})">.*?<span class="title">(.*?)</span>', re.S)


def d1(sql, local):
    """Run SQL on the D1 database through wrangler. -> list of result rows"""
    cmd = ["npx", "-y", "wrangler@4", "d1", "execute", "DB", "--json",
           "--local" if local else "--remote", "--command", sql]
    out = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    if out.returncode != 0:
        raise SystemExit(f"wrangler d1 failed:\n{out.stdout}\n{out.stderr}")
    return json.loads(out.stdout)[0]["results"]


def q(s):
    return "'" + s.replace("'", "''") + "'"


def post_title(slug):
    for s, title in POST.findall((HERE / "index.html").read_text()):
        if s == slug:
            return unescape(title)
    raise SystemExit(f"{slug} isn't in the post list in updates/index.html")


def build(title, url, to, token):
    unsub = f"{SITE}/api/unsubscribe?t={token}" if token else f"{SITE}/updates"
    address = MAILING_ADDRESS or "[mailing address]"
    msg = EmailMessage()
    msg["Subject"] = f"New GoodApp Labs update: {title}"
    msg["From"] = formataddr((FROM_NAME, GMAIL_USER))
    msg["To"] = to
    msg["Message-ID"] = make_msgid(domain="goodapplabs.com")
    if token:
        msg["List-Unsubscribe"] = f"<{unsub}>"
        msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
    msg.set_content(f"""Hi! There's a new GoodApp Labs update up:

{title}
{url}

David

--
You're getting this because you signed up at goodapplabs.ai/updates.
Unsubscribe: {unsub}
GoodApp Labs LLC, {address}
""")
    t, u, a = escape(title), escape(url), escape(address)
    # Tables and inline styles because that's what email clients render reliably. Gmail
    # doesn't show SVG, so the logo is the site's PNG touch icon.
    font = "-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif"
    msg.add_alternative(f"""<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#faf7f1">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f1"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;font-family:{font};color:#191714">
    <tr><td style="padding:0 4px 20px">
      <a href="{SITE}" style="text-decoration:none;color:#191714"><img src="{SITE}/apple-touch-icon.png" width="36" height="36" alt="" style="vertical-align:middle;border:0;border-radius:4px"><span style="vertical-align:middle;margin-left:10px;font-size:16px;font-weight:600;letter-spacing:-0.01em">GoodApp Labs</span></a>
    </td></tr>
    <tr><td style="background:#ffffff;border:1px solid #ece5d8;border-top:4px solid #e39a1c;border-radius:12px;padding:28px 28px 30px">
      <p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#c2740f">New update</p>
      <p style="margin:0 0 24px;font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.02em"><a href="{u}" style="color:#191714;text-decoration:none">{t}</a></p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#191714;border-radius:8px">
        <a href="{u}" style="display:inline-block;padding:12px 20px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none">Read the update &rarr;</a>
      </td></tr></table>
      <p style="margin:26px 0 0;font-size:16px;line-height:1.6;color:#5f5850">Thanks for following along,<br>David</p>
    </td></tr>
    <tr><td style="padding:20px 4px 0;font-size:12px;line-height:1.6;color:#847c72">
      You're getting this because you signed up at <a href="{SITE}/updates" style="color:#847c72">goodapplabs.ai/updates</a>.
      <a href="{escape(unsub)}" style="color:#847c72">Unsubscribe</a><br>GoodApp Labs LLC, {a}
    </td></tr>
  </table>
</td></tr></table>
</body></html>""", subtype="html")
    return msg


def smtp():
    pw = subprocess.run(["security", "find-generic-password", "-a", GMAIL_USER, "-s", KEYCHAIN_SERVICE, "-w"],
                        capture_output=True, text=True)
    if pw.returncode != 0:
        raise SystemExit(f"No Gmail app password in the keychain. Add one with:\n"
                         f"  security add-generic-password -a {GMAIL_USER} -s {KEYCHAIN_SERVICE} -w")
    s = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=30)
    s.login(GMAIL_USER, "".join(pw.stdout.split()))  # Google shows it in groups of four
    return s


def main(argv):
    local = "--local" in argv
    if "--list" in argv:
        for r in d1("SELECT email, created_at, unsubscribed_at FROM subscribers ORDER BY created_at", local):
            print(f"{r['created_at'][:10]}  {r['email']}{'  (unsubscribed)' if r['unsubscribed_at'] else ''}")
        return
    slugs = [a for a in argv if re.fullmatch(r"\d{4}-\d{2}-\d{2}", a)]
    if len(slugs) != 1:
        raise SystemExit(__doc__)
    slug = slugs[0]
    if not (HERE / f"{slug}.html").exists():
        raise SystemExit(f"updates/{slug}.html doesn't exist")
    title, url = post_title(slug), f"{SITE}/updates/{slug}"

    if "--to" in argv:
        to = argv[argv.index("--to") + 1]
        with smtp() as s:
            s.send_message(build(title, url, to, None))
        print(f"sent a test copy to {to}")
        return

    if not MAILING_ADDRESS and "--dry-run" not in argv:
        raise SystemExit("Set MAILING_ADDRESS at the top of updates/send_update.py first.")

    rows = d1(f"""SELECT s.email, s.token, s.created_at,
                  NOT EXISTS (SELECT 1 FROM deliveries d WHERE d.email = s.email) AS is_new
                  FROM subscribers s
                  WHERE s.unsubscribed_at IS NULL
                    AND NOT EXISTS (SELECT 1 FROM deliveries d WHERE d.email = s.email AND d.post = {q(slug)})
                  ORDER BY s.created_at""", local)
    print(f"{title}\n{url}\n")
    if not rows:
        print("Everyone subscribed has already had this one.")
        return
    new = [r for r in rows if r["is_new"]]
    if new:
        # There's no confirmation email, so look these over before they get mail from you.
        print(f"New since the last send ({len(new)}), check these look like real people:")
        for r in new:
            print(f"  {r['email']}  (signed up {r['created_at'][:10]})")
        print()
    print(f"Ready to email {len(rows)} {'person' if len(rows) == 1 else 'people'}.")
    if "--dry-run" in argv:
        return
    if input("Send? Type 'send' to go: ").strip() != "send":
        print("Not sent.")
        return

    sent = []
    try:
        with smtp() as s:
            for i, r in enumerate(rows):
                s.send_message(build(title, url, r["email"], r["token"]))
                sent.append(r["email"])
                print(f"  sent {i + 1}/{len(rows)}  {r['email']}")
                time.sleep(1)  # stay well under Gmail's sending rate limits
    finally:
        if sent:
            now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
            values = ", ".join(f"({q(slug)}, {q(e)}, {q(now)})" for e in sent)
            d1(f"INSERT OR IGNORE INTO deliveries (post, email, sent_at) VALUES {values}", local)
            print(f"recorded {len(sent)} deliveries")


if __name__ == "__main__":
    main(sys.argv[1:])

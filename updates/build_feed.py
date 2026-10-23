"""Write updates/feed.xml from the post list in updates/index.html.

    python3 updates/build_feed.py

The feed is for RSS readers. Email subscribers are handled separately by send_update.py.
Items carry only the title and link.
"""
import datetime as dt
import pathlib
import re
from html import escape, unescape

SITE = "https://goodapplabs.ai"
HERE = pathlib.Path(__file__).parent

POST = re.compile(
    r'<a href="(/updates/(\d{4}-\d{2}-\d{2}))">.*?<span class="title">(.*?)</span>', re.S)


def main():
    posts = POST.findall((HERE / "index.html").read_text())
    if not posts:
        raise SystemExit("no posts found in updates/index.html")
    items = []
    for path, day, title in posts:
        url = SITE + path
        when = dt.datetime.strptime(day, "%Y-%m-%d").replace(hour=17, tzinfo=dt.timezone.utc)
        title = escape(unescape(title), quote=False)
        items.append(f"""    <item>
      <title>{title}</title>
      <link>{url}</link>
      <guid isPermaLink="true">{url}</guid>
      <pubDate>{when.strftime("%a, %d %b %Y %H:%M:%S +0000")}</pubDate>
      <description>A new GoodApp Labs update is up: {title}</description>
    </item>""")
    feed = f"""<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>GoodApp Labs updates</title>
    <link>{SITE}/updates</link>
    <description>Weekly notes on what we built, what we learned, and where we're headed.</description>
    <language>en</language>
{chr(10).join(items)}
  </channel>
</rss>
"""
    (HERE / "feed.xml").write_text(feed)
    print(f"wrote updates/feed.xml ({len(items)} posts)")


if __name__ == "__main__":
    main()

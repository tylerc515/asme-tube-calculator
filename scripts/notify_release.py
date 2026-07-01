"""Post a Discord embed announcing a new GitHub release.

This is a static site on GitHub Pages with no in-app updater, so the
notification always points people to the live URL rather than a download.
"""

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone

# -- Project config --------------------------------------------------------
TOOL_NAME = "ASME Boiler Tube Calculator"
LIVE_URL = "https://tylerc515.github.io/asme-tube-calculator/"
REPO_URL = "https://github.com/tylerc515/asme-tube-calculator"
BRAND_COLOR = 0x7C4DFF  # purple accent from the app UI
THUMBNAIL_URL = ""  # leave empty; set to a raw GitHub URL if an icon is added later
# ----------------------------------------------------------------------------

SECTION_NAMES = {
    "what's new": "What's New",
    "bug fixes": "Bug Fixes",
    "notes": "Notes",
    "breaking changes": "Breaking Changes",
}

FALLBACK_LIMIT = 1024

SECTION_HEADING_RE = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)


def parse_release_body(body):
    body = body or ""
    stripped = body.strip()

    matches = list(SECTION_HEADING_RE.finditer(body))
    pre_heading = body[: matches[0].start()].strip() if matches else stripped
    description = pre_heading.splitlines()[0].strip() if pre_heading else ""

    if not matches:
        text = stripped
        if len(text) > FALLBACK_LIMIT:
            text = text[: FALLBACK_LIMIT - 3] + "..."
        fields = [{"name": "Release Notes", "value": text}] if text else []
        return {"description": description, "fields": fields}

    fields = []
    for i, match in enumerate(matches):
        heading = match.group(1).strip()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        section_body = body[start:end].strip()

        canonical = SECTION_NAMES.get(heading.lower())
        if canonical is None or not section_body:
            continue
        fields.append({"name": canonical, "value": section_body})

    return {"description": description, "fields": fields}


def build_payload(version, body, role_id):
    parsed = parse_release_body(body)

    fields = [
        {"name": f["name"], "value": f["value"], "inline": False}
        for f in parsed["fields"]
    ]
    fields.append({"name": "View Live", "value": LIVE_URL, "inline": False})

    embed = {
        "color": BRAND_COLOR,
        "title": f"{TOOL_NAME} {version}",
        "url": f"{REPO_URL}/releases/tag/{version}",
        "description": parsed["description"],
        "fields": fields,
        "footer": {
            "text": "Released · tylerc515",
            "icon_url": "https://github.com/tylerc515.png",
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if THUMBNAIL_URL:
        embed["thumbnail"] = {"url": THUMBNAIL_URL}

    content = f"<@&{role_id}> New release: {TOOL_NAME} {version}" if role_id else ""

    return {"content": content, "embeds": [embed]}


def print_preview(payload):
    embed = payload["embeds"][0]
    print("=" * 60)
    if payload.get("content"):
        print(payload["content"])
    print(f"{embed['title']}")
    print(embed["url"])
    if embed.get("description"):
        print(f"\n{embed['description']}")
    for field in embed["fields"]:
        print(f"\n{field['name']}\n{field['value']}")
    print(f"\n{embed['footer']['text']}")
    print("=" * 60)


def send_to_discord(webhook_url, payload):
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        webhook_url,
        data=data,
        headers={
            "Content-Type": "application/json",
            # Discord's webhook endpoint sits behind Cloudflare, which blocks
            # urllib's default "Python-urllib/x.y" User-Agent as a bot.
            "User-Agent": "asme-tube-calculator-release-notifier/1.0",
        },
        method="POST",
    )
    try:
        urllib.request.urlopen(request)
    except urllib.error.HTTPError as error:
        response_body = error.read().decode("utf-8", errors="replace")
        print(f"Discord webhook failed: {error.code} {response_body}", file=sys.stderr)
        return 1
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--version", dest="version")
    parser.add_argument("--body", dest="body")
    args = parser.parse_args(argv)

    dry_run = args.dry_run or os.environ.get("DRY_RUN") == "1"
    version = args.version if args.version is not None else os.environ.get("RELEASE_TAG", "")
    if args.body is not None:
        body = args.body.replace("\\n", "\n")
    else:
        body = os.environ.get("RELEASE_BODY", "")
    role_id = os.environ.get("DISCORD_ANALYST_ROLE_ID", "")

    payload = build_payload(version, body, role_id)

    if dry_run:
        print(json.dumps(payload, indent=2))
        print_preview(payload)
        return 0

    webhook_url = os.environ.get("DISCORD_WEBHOOK_URL", "")
    return send_to_discord(webhook_url, payload)


if __name__ == "__main__":
    sys.exit(main())

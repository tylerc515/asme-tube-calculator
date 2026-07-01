import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

import notify_release as nr


class ParserTests(unittest.TestCase):
    def test_parses_whats_new_section(self):
        parsed = nr.parse_release_body("## What's New\n- added tooltips")
        names = [f["name"] for f in parsed["fields"]]
        self.assertIn("What's New", names)

    def test_parses_multiple_sections(self):
        body = "## What's New\n- item one\n\n## Bug Fixes\n- item two"
        parsed = nr.parse_release_body(body)
        names = [f["name"] for f in parsed["fields"]]
        self.assertEqual(names, ["What's New", "Bug Fixes"])

    def test_fallback_on_no_headings(self):
        parsed = nr.parse_release_body("Just some plain release text.")
        self.assertEqual(len(parsed["fields"]), 1)
        self.assertEqual(parsed["fields"][0]["name"], "Release Notes")
        self.assertEqual(parsed["fields"][0]["value"], "Just some plain release text.")

    def test_fallback_truncates_at_1024(self):
        body = "x" * 1500
        parsed = nr.parse_release_body(body)
        value = parsed["fields"][0]["value"]
        self.assertEqual(len(value), 1024)
        self.assertTrue(value.endswith("..."))

    def test_empty_section_omitted(self):
        body = "## What's New\n- item one\n\n## Notes\n"
        parsed = nr.parse_release_body(body)
        names = [f["name"] for f in parsed["fields"]]
        self.assertNotIn("Notes", names)

    def test_case_insensitive_headings(self):
        parsed = nr.parse_release_body("## bug fixes\n- fixed a thing")
        names = [f["name"] for f in parsed["fields"]]
        self.assertIn("Bug Fixes", names)


class EmbedBuilderTests(unittest.TestCase):
    def test_embed_has_brand_color(self):
        payload = nr.build_payload("v1.0.0", "## What's New\n- x", "")
        self.assertEqual(payload["embeds"][0]["color"], nr.BRAND_COLOR)

    def test_embed_title_contains_version(self):
        payload = nr.build_payload("v1.0.0", "## What's New\n- x", "")
        self.assertIn("v1.0.0", payload["embeds"][0]["title"])

    def test_embed_has_live_url_field(self):
        payload = nr.build_payload("v1.0.0", "## What's New\n- x", "")
        fields = payload["embeds"][0]["fields"]
        matching = [f for f in fields if f["name"] == "View Live"]
        self.assertEqual(len(matching), 1)
        self.assertEqual(matching[0]["value"], nr.LIVE_URL)

    def test_embed_has_no_download_field(self):
        payload = nr.build_payload("v1.0.0", "## What's New\n- x", "")
        for field in payload["embeds"][0]["fields"]:
            self.assertNotIn("download", field["name"].lower())

    def test_role_mention_in_content(self):
        payload = nr.build_payload("v1.0.0", "## What's New\n- x", "1234567890123456789")
        self.assertTrue(payload["content"].startswith("<@&"))

    def test_no_mention_when_role_id_empty(self):
        payload = nr.build_payload("v1.0.0", "## What's New\n- x", "")
        self.assertFalse(payload.get("content"))

    def test_thumbnail_omitted_when_empty(self):
        payload = nr.build_payload("v1.0.0", "## What's New\n- x", "")
        self.assertNotIn("thumbnail", payload["embeds"][0])


class DryRunTests(unittest.TestCase):
    def test_dry_run_does_not_call_urlopen(self):
        with patch("urllib.request.urlopen") as mock_urlopen:
            exit_code = nr.main(["--dry-run", "--version", "v1.0.0", "--body", "## What's New\n- x"])
        mock_urlopen.assert_not_called()
        self.assertEqual(exit_code, 0)


if __name__ == "__main__":
    unittest.main()

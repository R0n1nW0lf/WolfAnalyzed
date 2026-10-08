# WolfAnalyzed v1.4.7 — October 7, 2026

Changes to the editable application source, preserving the existing report section order and visual format:

- IPv4 extraction and highlighting now require complete address tokens, reject leading-zero octets and values above 255, and exclude matches embedded in identifiers or longer dotted sequences. The SMTP ID containing `2026.10.06.18.22.03` no longer contributes the false IP `10.06.18.22`.
- Repeated email headers match only their exact normalized name or a numeric repetition suffix. `Received-SPF` no longer appears as a Received routing hop. Routing hops retain their original header order; they are not asserted to be a verified chronological trace.
- Highlighting finds non-overlapping ranges in the original text and escapes text once when generating HTML. Later rules cannot rewrite generated tags. Parsed field coloring and decoded CHR previews also avoid nested marks and escape decoded content.
- Authentication summary lists explicit SPF, DKIM and DMARC result claims with their Authentication-Results service or Received-SPF source. Multiple and conflicting claims remain visible. Missing result headers say `Not analyzed`; a DKIM signature alone is not treated as a pass. No local cryptographic, DNS or sender-trust verification is claimed.
- Empty indicator and security-term lists say `None detected in supplied text`. CHR scans specify that other encoding types are not analyzed. Attachment and URL sections explain their metadata/extraction scope: attachment safety, hash verification, remote links, reputation and encoded MIME content are not analyzed.
- HTML exports include Phase 1.4.7 in report metadata; TXT exports and app version labels also use 1.4.7.
- `Download for offline use` saves `WolfAnalyze_Phase1.4.7_Offline.html`, including these fixes and a visible change summary. The downloaded app starts with empty input and excludes loaded evidence.
- Raw Original remains untouched; existing report headings, section order, filename convention and offline behavior are retained.

Validation:

- Browser regression test against `Heya Rwwesley!_report_Reports.html`, using the text from its Raw Original section. No separate source EML was located in Downloads, Desktop or Documents. This validates the preserved report evidence, not byte identity with an unavailable original EML.
- Corrected example: one IPv4 address (`209.85.220.41`), three genuine Received headers, no Received-SPF routing hop, no nested highlight tags and unchanged Raw Original text.
- Additional checks cover invalid/embedded IPv4 candidates, private addresses, conflicting authentication results, HTML escaping, decoded-content escaping, exported HTML, and the offline download reopening and analyzing the safe sample.
- No browser script errors or HTTP/HTTPS requests during validation.

Repository files:

- `index.html`: updated standalone application; its Download for offline use button exports v1.4.7.
- `test-wolf-147.cjs`: browser regression test using a synthetic fixture, with optional supplied report input.
- Public wolf artwork, privacy disclaimer and existing report branding are preserved.

Run tests after installing Playwright: `node test-wolf-147.cjs`. Microsoft Edge is used for the browser. To test an existing report, pass its local HTML path as the first argument. Personal evidence and generated reports are excluded from the repository.

# Unfurl analytics

Implements SANE-221 and SANE-222 through SANE-230.

## Project and consent

- Organization: HitBox Games. Project: [Unfurl EU, 273361](https://eu.posthog.com/project/273361).
- Ingestion host: `https://eu.i.posthog.com`.
- [Usage & activation dashboard](https://eu.posthog.com/project/273361/dashboard/949966): seven saved charts for all-time opted-in users, WAU, activation funnel, format mix, first-edit conversion by channel, failures, and demo-to-export sessions.
- Consent is off by default, with an explicit choice in the sidebar's **Privacy & analytics** dialog. Web and desktop use the same policy. No events before consent are buffered for later replay.
- The SDK is lazy-loaded only after consent in configured production builds. Development and untagged desktop builds do not collect analytics. Missing keys, invalid hosts, blocked SDK loading, and unavailable storage leave editing functional.
- The facade in `src/shared/lib/analytics` is the sole SDK import. The application stores consent, a random anonymous ID after consent, and a first-edit marker in localStorage. SDK event properties are kept in memory. Withdrawal removes the ID/marker, stops capture, and is observed across tabs. Previously transmitted data is not deleted remotely.
- No account identity or cross-device linking. Counts represent opted-in browser/app identifiers and are a lower bound, not installs or unique people. Clearing storage or opting out and back in produces another identifier. Keep GitHub/itch download counters as complementary measures.

## Event contract

Every event includes `surface` (`web` or `desktop`), `distribution` (`web`, `desktop_github`, or `desktop_itch`), and `app_version`. `app_opened` also sets the anonymous person's `distribution` property. The SDK token, anonymous distinct ID, random session ID, timestamp/event ID, and person-processing/GeoIP-disable flags support ingestion and grouping.

| Event | Trigger | Additional properties |
| --- | --- | --- |
| `app_opened` | Once on startup with consent, or when enabling analytics | None |
| `demo_loaded` | Sample converted and saved successfully | `source: button` (the current UI has no Konami entry point) |
| `import_succeeded` | Converted story saved locally | `format`, `node_count_bucket` |
| `import_failed` | Failed conversion/save, missing Markdown title, or unsupported file | `format`, sanitized `error_class` |
| `export_succeeded` | JSON download initiated from editor or file menu | `format: json`, `node_count_bucket` |
| `export_failed` | Synchronous JSON download failure | `format: json`, `node_count_bucket`, `error_class: download` |
| `first_graph_edit` | First applied node/choice/content change, addition, or deletion per anonymous ID | None |
| `recent_file_opened` | Existing file selected in sidebar, recent list, or project card | None |

Formats: `twee`, `obsidian`, `json`, `unknown`. Node buckets: `0`, `1-20`, `21-100`, `100+` (the last means **more than 100**). Error classes: `invalid_json`, `invalid_story`, `missing_title`, `unsupported_format`, `storage`, `conversion`, `download`. Failed imports omit a node bucket because conversion may not have produced a story. Markdown batches produce one event per combined story, not one per note.

File loading, sample loading, no-op saves, file renames, undo, and redo do not count as the first graph edit. Download initiation cannot prove the user saved a file: browser cancellation and later OS errors are not observable here.

The send hook rebuilds each payload's properties from an allowlist, including validation of categorical values. It removes SDK defaults such as URLs, referrers, initial person properties, and device details. Autocapture, page views/leaves, exceptions, performance capture, replay, surveys, tours, conversations, remote configuration/flags, and external scripts are disabled. GeoIP enrichment is disabled. A direct connection still exposes a network address to PostHog during transport.

## Build configuration

Only the blank `.env.example` template is tracked. Copy it to an ignored `.env.local` for local configuration and set `VITE_PUBLIC_POSTHOG_KEY` and `VITE_PUBLIC_POSTHOG_HOST` for the intended project. Use a separate project/key for integration testing. The ingestion key is public client configuration bundled into the renderer; never place a PostHog personal API key in a `VITE_*` variable.

Desktop release CI reads `VITE_PUBLIC_POSTHOG_KEY` and `VITE_PUBLIC_POSTHOG_HOST` from GitHub Actions repository variables. Web hosting must supply the same build-time environment variables; `pnpm build:web` uses Vite's `web` mode. Missing configuration leaves analytics disabled.

- `pnpm build:web` defaults to `web` and rejects desktop tags.
- Desktop release CI builds separate installers for each OS and each channel. GitHub downloads only `installer-desktop_github-*`; itch downloads only `installer-desktop_itch-*`. The same binary cannot represent both channels.
- For a local tagged desktop build in PowerShell, set `$env:VITE_PUBLIC_DISTRIBUTION = 'desktop_github'` (or `desktop_itch`) before `pnpm build:windows`, `pnpm build:mac`, or `pnpm build:linux`.
- Local desktop builds with no distribution tag deliberately disable analytics. Run `pnpm build:web` and `pnpm preview` to check the configured consent UI in a browser.

Dashboard definitions are saved in `docs/analytics-dashboard.json` for review and recreation. The activation funnel is `app_opened → (demo_loaded OR import_succeeded) → first_graph_edit → export_succeeded`, ordered within 14 days. Demo effectiveness groups by random session ID. The dashboard starts empty; there is no seeded or fabricated usage data.

SDK reference: [PostHog JavaScript configuration](https://posthog.com/docs/references/posthog-js/types/PostHogConfig).

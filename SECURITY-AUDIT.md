# Code Audit — Easy Twitter Feeds v1.2.13

**Reviewer:** Senior WordPress plugin reviewer
**Date:** 2026-05-17
**Scope:** Full plugin (`easy-twitter-feeds.php`, `inc/`, `build/render.php`, `assets/`, `uninstall.php`, `readme.txt`) plus a light pass over the bundled `vendor/freemius-lite/` SDK.

---

## Summary

| Severity | Count | Headline |
|----------|-------|----------|
| Critical | 0 | No SQL injection, no exploitable XSS, no missing-nonce destructive endpoint. |
| High | 1 | `Requires PHP: 7.2` is wrong — bundled SDK needs PHP 7.4+ and fatals below it. |
| Medium | 6 | Unprefixed shortcodes/actions, missing JS translations, un-i18n strings, misused `wp_kses_post()`, self-hosted proprietary JS. |
| Low | 12 | HTML/i18n nits, filter-vs-action misuse, PHP 8.1 deprecations, packaging hygiene. |

**Overall:** The plugin is in good security shape. Output is consistently escaped, the one state-changing endpoint (post duplication) is properly protected with a nonce **and** capability checks, and there is no raw SQL anywhere. The findings below are mostly correctness, standards, and WP.org-readiness issues — none are exploitable, but **H1 will break sites and should block release.**

---

## Critical

None found. Credit where due — the duplicate-post handler ([inc/CustomPost.php:112-143](inc/CustomPost.php#L112-L143)) does a nonce check, a coarse capability check, a per-object `edit_post` check, and post-type validation before writing. That is the correct pattern.

---

## High

### H1 — `Requires PHP: 7.2` is incorrect; plugin fatals on PHP 7.2 / 7.3
**Files:** [readme.txt:7](readme.txt#L7), [easy-twitter-feeds.php:2-12](easy-twitter-feeds.php#L2-L12)

The bundled Freemius Lite SDK uses **typed properties**, a PHP 7.4 feature:

```php
// vendor/freemius-lite/start.php:20-23
protected object  $config;
public    string  $prefix = '';
protected string  $plugin_file;
private   ?object $lc = null;
```

Same in [vendor/freemius-lite/inc/FreemiusAdmin.php:26-27](vendor/freemius-lite/inc/FreemiusAdmin.php#L26-L27) and lines 158-168. On PHP 7.2 or 7.3 these files raise a **parse error**, which means a fatal/white-screen on every admin page for any user who installed the plugin trusting the advertised `Requires PHP: 7.2`.

The plugin's *own* code (`inc/`, root file) is 7.2-compatible, but the shipped product as a whole is not.

**Fix:**
- Set `Requires PHP: 7.4` in `readme.txt`.
- Add `Requires PHP: 7.4` and `Requires at least: 6.5` to the plugin **header** block (currently absent from the header — only readme carries them).

---

## Medium

### M1 — Unprefixed shortcode tags `[timeline]` and `[follow_button]`
**File:** [inc/ShortCode.php:6-7](inc/ShortCode.php#L6-L7)

```php
add_shortcode( 'timeline', [$this, 'timelineShortCode'] );
add_shortcode( 'follow_button', [$this, 'followButtonShortCode'] );
```

`[timeline]` in particular is an extremely common tag — `add_shortcode()` is last-write-wins, so this silently collides with themes, page builders, and other social plugins. WordPress guidelines require prefixing all public identifiers.

**Fix:** Rename to `[etf_timeline]` / `[etf_follow_button]`. Keep the old tags registered for one release for back-compat if existing users rely on them, then deprecate.

### M2 — Unprefixed admin action handler `admin_action_duplicate_post`
**Files:** [inc/CustomPost.php:14](inc/CustomPost.php#L14), [inc/CustomPost.php:101](inc/CustomPost.php#L101)

```php
add_action('admin_action_duplicate_post', array($this, 'etf_duplicate_post'));
...
$url = admin_url("admin.php?action=duplicate_post&post={$post->ID}");
```

`duplicate_post` is a generic action name; if another plugin registers the same `admin_action_duplicate_post`, both handlers fire for the same request. The handler itself is safe (nonce + caps), but the collision is unprofessional and can produce surprising behavior.

**Fix:** Use `action=etf_duplicate_post` and hook `admin_action_etf_duplicate_post`.

### M3 — Self-hosted, proprietary Twitter `widget.js` bundled in the plugin
**Files:** [assets/js/widget.js](assets/js/widget.js), [inc/ShortCode.php:11](inc/ShortCode.php#L11)

`assets/js/widget.js` is X/Twitter's proprietary `platform.js` widget bundle, copied locally and served from the site. Two problems:

1. **Licensing:** WP.org guideline 1 requires all bundled code to be GPL-compatible. Twitter's `widgets.js` carries no open-source license — this is a GPL-compatibility flag for the review team.
2. **Staleness:** A frozen local copy never receives X's fixes/breakage patches; the timeline can stop working when X changes its embed contract.

**Fix:** Enqueue the official loader from `https://platform.twitter.com/widgets.js` instead of bundling it. (The external request to X is already disclosed in `readme.txt` under "External Services," so disclosure is fine — the bundling is the issue.)

### M4 — `wp_set_script_translations()` missing for the `easy-tf-admin` script
**File:** [easy-twitter-feeds.php:84](easy-twitter-feeds.php#L84)

```php
wp_enqueue_script( 'easy-tf-admin', EASY_TF_DIR_URL . 'assets/js/admin.js', ['wp-i18n'], EASY_TF_VERSION, true );
```

`assets/js/admin.js` calls `wp.i18n.__('Copied Successfully!', 'easy-twitter-feeds')` and `wp.i18n.__('Copy To Clipboard', ...)`, but no `wp_set_script_translations()` call is registered for this handle, so those strings are never translatable. (`admin-menu.php` does it correctly for `etf-admin-dashboard` — just this one was missed.)

**Fix:**
```php
wp_set_script_translations( 'easy-tf-admin', 'easy-twitter-feeds', EASY_TF_DIR_PATH . 'languages' );
```

### M5 — Hardcoded English strings not internationalized
**Files:** [inc/ShortCode.php:43](inc/ShortCode.php#L43), [inc/ShortCode.php:64](inc/ShortCode.php#L64), [inc/ShortCode.php:66](inc/ShortCode.php#L66), [inc/CustomPost.php:72-73](inc/CustomPost.php#L72-L73), [inc/CustomPost.php:115](inc/CustomPost.php#L115)

- `'<h2>You must enter your Twitter handle in the username attribute…</h2>'` — printed verbatim, twice.
- `Follow @<?php echo esc_html($username); ?>` — the word "Follow" is hardcoded.
- `$defaults['shortcode'] = 'ShortCode'; $defaults['date'] = 'Date';` — column headers are literal English. Worse, `'Date'` **overrides core's already-translated "Date" label** with an untranslated literal.
- `wp_die( 'Permission denied' )`, `wp_die( 'Invalid post' )` — not translatable.

**Fix:** Wrap all in `esc_html__( …, 'easy-twitter-feeds' )` (and use `esc_html_e`/`__` as appropriate). For the column label use `_x( 'Date', 'column label', 'easy-twitter-feeds' )` or reuse core's label.

### M6 — `wp_kses_post()` misapplied to `get_block_wrapper_attributes()`
**File:** [build/render.php:6](build/render.php#L6)

```php
<div <?php echo wp_kses_post( get_block_wrapper_attributes() ); ?>
```

`get_block_wrapper_attributes()` returns an **HTML attribute string** (e.g. `class="…" style="…"`), already escaped and designed to be echoed directly. `wp_kses_post()` is a content/tag sanitizer — running it over a bare attribute string is the wrong tool and can entity-mangle the output (e.g. quotes/ampersands inside `style`). It cannot introduce XSS, but it is incorrect and can corrupt the wrapper.

**Fix:**
```php
<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore — WP-escaped by design ?>
```

---

## Low

### L1 — Curly/smart quotes in `rel` attribute
[inc/ShortCode.php:39](inc/ShortCode.php#L39): `rel=”nofollow”` uses typographic quotes (`”`) instead of `"`. Browsers parse this as a `rel` attribute whose literal value is `”nofollow”`, so `nofollow` never actually applies. **Fix:** `rel="nofollow"`.

### L2 — `add_action()` used to register filters
[inc/CustomPost.php:12-13](inc/CustomPost.php#L12-L13): `use_block_editor_for_post` and `post_row_actions` are **filters** (their callbacks return values), but are registered with `add_action()`. It works only because `add_action` is an alias of `add_filter` — still incorrect API usage. **Fix:** use `add_filter()`.

### L3 — `shortcode_atts()` defaults of `null` trigger PHP 8.1+ deprecations
[inc/ShortCode.php:16-24](inc/ShortCode.php#L16-L24) and [inc/ShortCode.php:50-54](inc/ShortCode.php#L50-L54) default every attribute to `null`. When an attribute is omitted, `esc_attr( null )` runs, which emits *"Passing null to parameter… is deprecated"* notices on PHP 8.1+. **Fix:** default the attributes to `''`.

### L4 — Coarse capability check inconsistent with the CPT's `capability_type`
[inc/CustomPost.php:114](inc/CustomPost.php#L114) gates duplication with `current_user_can('edit_posts')`, but the CPT uses `capability_type => 'page'` ([inc/CustomPost.php:44](inc/CustomPost.php#L44)), whose primitive cap is `edit_pages`. The real protection is the per-object `current_user_can('edit_post', $post_id)` on line 126 (correct), so this is not a security hole — just an inconsistent coarse gate. **Fix:** use `edit_pages`, or drop the coarse check and rely on the per-object check.

### L5 — Admin code + Freemius SDK loaded on front-end requests
[easy-twitter-feeds.php:74-76](easy-twitter-feeds.php#L74-L76): `load_classes()` runs in the constructor unconditionally, so `inc/admin-menu.php` is `require`d on every front-end page. Likewise `easy_tf_fs()` ([easy-twitter-feeds.php:54](easy-twitter-feeds.php#L54)) loads the Freemius SDK files on the front end even though its admin class only instantiates under `is_admin()`. Minor wasted I/O on every page load. **Fix:** wrap admin includes in `if ( is_admin() )`.

### L6 — `.DS_Store` files shipped in the package
`/.DS_Store` and `/assets/.DS_Store` are macOS metadata and should not be in the distributed ZIP. **Fix:** add to `.distignore` / build exclude list.

### L7 — Dead `rewrite` argument on a non-public CPT
[inc/CustomPost.php:45](inc/CustomPost.php#L45): `'rewrite' => [ 'slug' => 'etf' ]` has no effect because the CPT is `public => false` and `publicly_queryable => false`. Harmless but misleading. **Fix:** remove it.

### L8 — License metadata inconsistency / missing `License URI` in header
Plugin header ([easy-twitter-feeds.php:11](easy-twitter-feeds.php#L11)) says `License: GPLv3`; `readme.txt` says `GPLv3 or later`. The header also omits `License URI`. **Fix:** make both say `GPLv3 or later` and add `License URI: https://www.gnu.org/licenses/gpl-3.0.html` to the header. Consider shipping a `LICENSE` file.

### L9 — `readme.txt` changelog gaps and informal dates
The changelog jumps from `1.2.7` to `1.2.5` (no `1.2.6`), and uses informal dates like `17 May, 26`. Cosmetic, but tidy it for WP.org polish.

### L10 — No `index.php` silence files in plugin directories
`inc/`, `assets/`, `build/`, `languages/` lack `index.php` stubs (the Freemius vendor dir has one). Minor directory-listing hardening. **Fix:** add empty `index.php` stubs or rely on server config.

### L11 — `uninstall.php` cleanup is incomplete
[uninstall.php](uninstall.php) deletes the new option names but not the **legacy** `unique_id` option that `FreemiusAdmin::anonymous_id()` migrates from ([FreemiusAdmin.php:483](vendor/freemius-lite/inc/FreemiusAdmin.php#L483)), and leaves all `easy-twitter-feeds` CPT posts behind. Leaving CPT content is a defensible choice — but it should be intentional and documented.

### L12 — Duplicated post inherits the source `post_status`
[inc/CustomPost.php:130-135](inc/CustomPost.php#L130-L135): duplicating a *published* feed immediately creates another *published* feed. Most duplicate features create a `draft`. Minor UX expectation mismatch.

---

## Area-by-area notes

### Security
- **Nonces / CSRF:** The only state-changing endpoint, `etf_duplicate_post`, uses `wp_nonce_url()` + `check_admin_referer()` with a post-scoped action — correct. Freemius AJAX handlers all run through `verify_ajax()` (nonce + `manage_options`). No gaps.
- **Capabilities:** Admin menu gated by `manage_options`; duplication gated by per-object `edit_post`. Adequate (see L4 for a cosmetic inconsistency).
- **Sanitization:** All `$_GET`/`$_POST`/`$_SERVER` reads go through `absint()`, `wp_unslash()`, `sanitize_text_field()`, or `map_deep(..., 'sanitize_text_field')`. No raw superglobal use.
- **Escaping / XSS:** Every dynamic echo uses `esc_attr` / `esc_html` / `esc_url` or `wp_json_encode()`+`esc_attr`. The two unescaped echoes — `render_block()` ([CustomPost.php:66](inc/CustomPost.php#L66)) and `get_block_wrapper_attributes()` ([render.php:6](build/render.php#L6)) — are safe-by-design WP APIs (render.php's `wp_kses_post` wrapper is wrong but not dangerous, see M6). The admin-column `onclick="eftHandleShortcode(%1$s)"` is safe because `%1$s` is always an integer post ID. **No exploitable XSS found.**
- **SQL injection:** No `$wpdb`, no raw SQL anywhere — zero injection surface.
- **File handling:** All `require_once` paths are plugin constants; no user-controlled includes, no uploads, no `file_get_contents` on input. Clean.

### WordPress standards
- Class names are consistently prefixed (`EASY_TF_*`); the `EASY_TF_`/`easy_tf_` namespace is good. **Shortcodes and one admin action are not prefixed (M1, M2).**
- Plugin header is valid but missing `Requires at least` / `Requires PHP` / `License URI` (see H1, L8).
- Text domain `easy-twitter-feeds` matches the header; `.pot`/`.po`/`.mo`/`.json` are present. i18n is mostly correct except the hardcoded strings in M5 and the missing `wp_set_script_translations` in M4.
- No deprecated WP APIs in use. Block registration via `register_block_type( __DIR__ . '/build' )` is current. Filter-vs-action misuse noted in L2.

### Code quality & performance
- Reasonable class-per-file structure. Front-end assets (`widget.js`, block `viewScript`) are enqueued conditionally — good. Admin assets are correctly hook-scoped.
- No caching around `onAddShortcode()`'s `get_post()` + `parse_blocks()` + `render_block()`, but `get_post()` is object-cached by core and feeds are small — acceptable.
- Indentation in `easy-twitter-feeds.php` (everything indented under the `ABSPATH` guard though not inside it) is cosmetically misleading — purely a style nit.

### Bundled Freemius Lite SDK (`vendor/freemius-lite/`)
Reviewed lightly as third-party code. It is reasonably defensive: AJAX handlers verify nonce + `manage_options`, `wp_remote_request()` calls set `sslverify => true`, remote calls are gated behind explicit opt-in (`has_opted_in()`), and superglobals are sanitized. Two things to be aware of:
- It forces a one-time admin redirect to the opt-in page on activation (`maybe_redirect()`, [FreemiusAdmin.php:387-403](vendor/freemius-lite/inc/FreemiusAdmin.php#L387-L403)). It is flag-guarded so it fires once, but WP.org reviewers sometimes flag activation redirects — keep an eye on it.
- It is the source of the **PHP 7.4 requirement** (H1).

### WP.org readiness
- `Stable tag: 1.2.13` matches the plugin version — good.
- `readme.txt` has a "Source Code" section pointing to GitHub — satisfies the build-tools/compiled-JS requirement.
- **Blockers/flags:** H1 (wrong `Requires PHP` → fatals), M3 (proprietary non-GPL `widget.js` bundled). Address both before submitting an update.
- Everything else (M1, M2, M4, M5, M6, Lows) is polish the review team may or may not catch but should be fixed for quality.

---

## Recommended fix order

1. **H1** — bump `Requires PHP` to `7.4` (readme + header). Ship-blocker.
2. **M3** — load `widget.js` from `platform.twitter.com` instead of bundling it.
3. **M1 / M2** — prefix shortcodes and the admin action.
4. **M4 / M5** — add `wp_set_script_translations` and internationalize remaining strings.
5. **M6 + Lows** — correctness and packaging cleanup.

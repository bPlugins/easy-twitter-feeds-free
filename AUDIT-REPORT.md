# Easy Twitter Feeds — WordPress Plugin Security & Code Audit

**Plugin:** Easy Twitter Feeds – Embed Social Media Posts with Live Updates  
**Version:** 1.2.13  
**Audit Date:** 2026-05-17  
**Auditor:** Claude Code (Senior WP Reviewer)

---

## Executive Summary

The plugin is largely safe from classic injection attack vectors — there are no raw `$wpdb->query()` calls, output escaping is applied consistently in shortcode templates, and nonces are present on the duplicate-post action. However, two **High** severity findings — a content-access bypass in the `[etf]` shortcode and an unconditional third-party script load on every page — warrant immediate attention before the next WP.org submission. Six **Medium** issues cover PHP fatal errors, a broken AJAX action, a malformed block attribute schema, and URL-encoding gaps. Eight **Low** issues cover standards compliance, deprecated APIs, and accessibility.

---

## Issue Index

| # | Severity | Area | Title |
|---|----------|------|-------|
| 1 | **HIGH** | Security | `[etf]` shortcode renders any post's blocks with no type/status guard |
| 2 | **HIGH** | Performance | Twitter `widget.js` loaded unconditionally on every page |
| 3 | **MEDIUM** | Security / Bug | Fatal PHP error when `[etf id=X]` targets a nonexistent post |
| 4 | **MEDIUM** | Security | `etf_duplicate_post` lacks per-post capability and post-type checks |
| 5 | **MEDIUM** | Bug | `wp_insert_post()` return value unchecked; redirect to invalid URL |
| 6 | **MEDIUM** | Bug | `block.json` `shadow` attribute type/default mismatch |
| 7 | **MEDIUM** | Bug | Tweet/Follow URLs not URL-encoded — breaks on special characters |
| 8 | **MEDIUM** | Bug | `JSON.parse` without try/catch in `view.js` — page-breaking exception |
| 9 | **MEDIUM** | Bug | `etfPipeChecker` AJAX action called in JS but never registered in PHP |
| 10 | **LOW** | WP Standards | Missing `load_plugin_textdomain()` for PHP string translations |
| 11 | **LOW** | WP Standards | Non-namespaced script/style handles risk collision |
| 12 | **LOW** | WP Standards | `react` / `react-dom` used as dependency handles instead of `wp-element` |
| 13 | **LOW** | Code Quality | Deprecated `document.execCommand('copy')` in two files |
| 14 | **LOW** | Accessibility | `<a>` elements in Follow/Tweet buttons have no `href` attribute |
| 15 | **LOW** | WP Standards | No plugin deactivation/uninstall cleanup |
| 16 | **LOW** | WP.org | `block.json` keywords contain placeholder values ("key1", "key2", "key3") |
| 17 | **LOW** | WP.org | `readme.txt` Installation section contains boilerplate "e.g." artifact |
| 18 | **LOW** | Code Quality | Unused constant `EASY_TF_ASSETS_DIR` |
| 19 | **LOW** | i18n | "Duplicate" link text is not wrapped in a translation function |

---

## Detailed Findings

---

### [HIGH-1] `[etf]` shortcode renders any post's blocks without post-type or status guard

**File:** `inc/CustomPost.php` lines 52–65  
**Hook:** `add_shortcode('etf', ...)`

```php
function onAddShortcode( $atts ) {
    if ( empty( $atts['id'] ) ) { return ''; }
    $post_id = (int) $atts['id'];          // cast from shortcode attribute
    $post    = get_post( $post_id );       // no null-check
    $blocks  = parse_blocks( $post->post_content );  // null→fatal; ANY post accepted
    ob_start();
    echo render_block($blocks[0]);         // renders the first block of ANY post
    return ob_get_clean();
}
```

The handler casts the user-supplied `id` attribute to `int` (good) but does **not** verify:

1. The post exists (null pointer — see [MEDIUM-3]).
2. The post is of type `easy-twitter-feeds`.
3. The post has `publish` status (draft and private posts pass through).

**Impact:** Any role that can embed shortcodes (Contributors, public widget areas, page-builder elements) can supply an arbitrary WordPress post ID and trigger block rendering for posts they should not be able to see — exposing draft/private post block output on a public page.

**Fix:**

```php
function onAddShortcode( $atts ) {
    if ( empty( $atts['id'] ) ) { return ''; }

    $post_id = (int) $atts['id'];
    $post    = get_post( $post_id );

    if ( ! $post
        || 'easy-twitter-feeds' !== $post->post_type
        || 'publish'           !== $post->post_status ) {
        return '';
    }

    $blocks = parse_blocks( $post->post_content );
    if ( empty( $blocks[0] ) ) { return ''; }

    ob_start();
    echo render_block( $blocks[0] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    return ob_get_clean();
}
```

---

### [HIGH-2] Twitter `widget.js` loaded unconditionally on every page

**File:** `inc/ShortCode.php` lines 4–13

```php
add_action( 'admin_enqueue_scripts', [$this, 'enqueueScripts'] );
add_action( 'wp_enqueue_scripts',    [$this, 'enqueueScripts'] );

function enqueueScripts(){
    wp_enqueue_script( 'widget-js', EASY_TF_DIR_URL . 'assets/js/widget.js', array(), EASY_TF_VERSION, false );
}
```

The Twitter platform widget JS is enqueued on **every admin page** and **every frontend page**, unconditionally. This means:

- Every site visitor loads unnecessary JavaScript even on pages with no Twitter widget.
- The `admin_enqueue_scripts` hook is entirely wrong — the legacy shortcodes are front-end only.
- The handle `widget-js` is not namespaced (see [LOW-11]).

**Fix:**

```php
// Remove admin hook entirely.
add_action( 'wp_enqueue_scripts', [$this, 'enqueueScripts'] );

function enqueueScripts(){
    // Register only; enqueue lazily via wp_enqueue_script() inside the shortcode output.
    wp_register_script( 'easy-tf-widget', EASY_TF_DIR_URL . 'assets/js/widget.js', [], EASY_TF_VERSION, true );
}

function timelineShortCode( $atts ){
    wp_enqueue_script( 'easy-tf-widget' ); // enqueue only when shortcode is actually used
    // … rest of the function
}
```

---

### [MEDIUM-3] Fatal PHP error when `[etf id=X]` targets a nonexistent post

**File:** `inc/CustomPost.php` line 59

```php
$post   = get_post( $post_id );
$blocks = parse_blocks( $post->post_content ); // $post is null → TypeError (PHP 8) / E_NOTICE + crash (PHP 7)
```

`get_post()` returns `null` for an invalid ID. The subsequent property access triggers a fatal `TypeError` on PHP 8 or an `E_NOTICE` followed by broken output on PHP 7.x, potentially breaking the entire page.

**Fix:** Covered by the null guard in the [HIGH-1] fix above.

---

### [MEDIUM-4] `etf_duplicate_post` lacks per-post capability and post-type checks

**File:** `inc/CustomPost.php` lines 105–131

```php
if ( ! isset( $_GET['post'] ) || ! isset( $_GET['_wpnonce'] ) || ! current_user_can( 'edit_posts' ) ) {
    wp_die( 'Permission denied' );
}
```

Two problems:

1. `current_user_can('edit_posts')` is a **generic role** check. It does not verify that the user can edit this **specific post**. On multi-author sites, a user with `edit_posts` can trigger duplication of another author's feed — the correct check is `current_user_can('edit_post', $post_id)`.
2. There is no verification that the target post is an `easy-twitter-feeds` CPT. A crafted admin URL pointing at a page or post of another type would pass the nonce check (nonce is ID-scoped, not type-scoped).

**Fix:**

```php
public function etf_duplicate_post() {
    if ( ! isset( $_GET['post'], $_GET['_wpnonce'] ) ) {
        wp_die( 'Permission denied' );
    }

    $post_id = absint( wp_unslash( $_GET['post'] ) );
    check_admin_referer( 'etf_duplicate_post_' . $post_id );

    $post = get_post( $post_id );
    if ( ! $post || 'easy-twitter-feeds' !== $post->post_type ) {
        wp_die( 'Invalid post' );
    }
    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        wp_die( 'Permission denied' );
    }

    // … rest of duplication logic
}
```

---

### [MEDIUM-5] `wp_insert_post()` return value not validated before redirect

**File:** `inc/CustomPost.php` lines 128–130

```php
$new_post_id = wp_insert_post($new_post);
wp_safe_redirect(admin_url("post.php?action=edit&post={$new_post_id}"));
exit;
```

`wp_insert_post()` returns `0` or a `WP_Error` on failure. When it returns `0`, the redirect targets `post.php?action=edit&post=0` — a "Post not found" admin dead-end with no user feedback. Interpolating a `WP_Error` object into the URL string also triggers a PHP deprecation notice (PHP 8.x).

**Fix:**

```php
$new_post_id = wp_insert_post( $new_post, true ); // second arg = return WP_Error
if ( is_wp_error( $new_post_id ) ) {
    wp_die( esc_html( $new_post_id->get_error_message() ) );
}
wp_safe_redirect( admin_url( 'post.php?action=edit&post=' . $new_post_id ) );
exit;
```

---

### [MEDIUM-6] `block.json` `shadow` attribute — type/default mismatch

**File:** `src/block.json` lines 86–89

```json
"shadow": {
    "type": "array",
    "default": {}
}
```

The declared type is `array` but the default value `{}` is a JSON **object**. This violates the JSON Schema contract and can cause:

- WordPress block validation to produce console errors.
- Incorrect React initial state (empty object where array is expected).
- Serialization differences between PHP and JS.

**Fix:** Align type and default:

```json
"shadow": {
    "type": "object",
    "default": {}
}
```

Or, if an array was intended:

```json
"shadow": {
    "type": "array",
    "default": []
}
```

---

### [MEDIUM-7] Tweet/Follow URLs not URL-encoded — breaks on special characters

**File:** `src/Components/Common/TweetButton.js` line 8; `src/Components/Common/FollowButton.js` line 8

```js
// TweetButton.js
const twitterUrl = `https://twitter.com/intent/tweet?screen_name=${userName}&text=${button.tweetText}`;

// FollowButton.js
const twitterUrl = `https://twitter.com/intent/follow?region=follow_link&screen_name=${userName}`;
```

Neither `userName` nor `button.tweetText` is passed through `encodeURIComponent()`. If `tweetText` contains `&`, `=`, `#`, `+`, or non-ASCII characters, the URL is malformed and the pre-populated tweet text is silently truncated or corrupted. This is a functional bug that directly breaks the tweet feature for any non-trivial tweet text.

**Fix:**

```js
// TweetButton.js
const twitterUrl = `https://twitter.com/intent/tweet?screen_name=${encodeURIComponent(userName)}&text=${encodeURIComponent(button.tweetText)}`;

// FollowButton.js
const twitterUrl = `https://twitter.com/intent/follow?region=follow_link&screen_name=${encodeURIComponent(userName)}`;
```

---

### [MEDIUM-8] `JSON.parse` without try/catch in `view.js` — page-breaking exception

**File:** `src/view.js` line 13

```js
document.addEventListener('DOMContentLoaded', () => {
    const blockEls = document.querySelectorAll('.wp-block-etf-twitter-feed');
    blockEls.forEach(blockEl => {
        const attributes = JSON.parse(blockEl.dataset.attributes); // throws SyntaxError
        // …
    });
});
```

If `data-attributes` is malformed or absent (e.g., due to a caching plugin stripping data attributes, HTML entity encoding, or a plugin conflict), `JSON.parse` throws an uncaught `SyntaxError`. Because there is no `try/catch`, the exception propagates out of the `forEach` callback and aborts the entire `DOMContentLoaded` handler, silently breaking **all** Twitter Feed blocks on the page.

**Fix:**

```js
blockEls.forEach(blockEl => {
    let attributes;
    try {
        attributes = JSON.parse(blockEl.dataset.attributes);
    } catch (e) {
        console.error('Easy Twitter Feeds: Failed to parse block attributes', e);
        return; // Skip this block, continue with the rest
    }
    // … rest of rendering
    blockEl.removeAttribute('data-attributes');
});
```

---

### [MEDIUM-9] `etfPipeChecker` AJAX action referenced in JS but never registered in PHP

**File:** `src/hooks/usePremium.js` line 4 (JS); entire PHP codebase (PHP — absent)

```js
const { data = null, isLoading } = useWPAjax('etfPipeChecker', { _wpnonce: nonce });
const isPremium = (!isLoading && data?.isPipe) || false;
```

The hook fires a `wp_ajax_etfPipeChecker` AJAX request, but no `add_action('wp_ajax_etfPipeChecker', ...)` exists anywhere in the PHP code. WordPress returns its default `-1` / empty response, `data` is always `null`, and `isPremium` is permanently `false`. The result is:

- Premium features are permanently disabled through this path (silent functional regression).
- A wasted HTTP request fires from every block editor load where this hook is invoked.

**Fix:** Either register the AJAX handler in PHP, or replace it with a `wp_localize_script()` variable that passes the premium status from PHP to JS at enqueue time:

```php
wp_localize_script( 'etf-block-editor', 'etfData', [
    'isPremium' => (bool) easy_tf_fs()->can_use_premium_code(),
    'nonce'     => wp_create_nonce( 'etf_premium_check' ),
] );
```

```js
const isPremium = window.etfData?.isPremium ?? false;
```

---

### [LOW-10] Missing `load_plugin_textdomain()` for PHP string translations

**File:** `easy-twitter-feeds.php` (absent)

PHP strings wrapped in `__()`, `_e()`, `esc_html__()`, etc. (across `inc/ShortCode.php`, `inc/CustomPost.php`, `inc/admin-menu.php`) are never loaded from `.po/.mo` files because `load_plugin_textdomain()` is never called. Only JavaScript translations are configured via `wp_set_script_translations()`. This means any localization of PHP-generated strings (error messages, column headers, shortcode error notices) will silently fall back to English regardless of site locale.

**Fix:** Add to the plugin's main constructor or an `init` hook:

```php
add_action( 'init', function() {
    load_plugin_textdomain(
        'easy-twitter-feeds',
        false,
        dirname( plugin_basename( __FILE__ ) ) . '/languages'
    );
} );
```

---

### [LOW-11] Non-namespaced script/style handles risk handle collision

**Files:** `easy-twitter-feeds.php` lines 84–85; `inc/ShortCode.php` line 12

```php
wp_enqueue_style( 'mcbAdmin', ... );    // should be 'easy-tf-admin-css'
wp_enqueue_script( 'mcbAdmin', ... );   // should be 'easy-tf-admin'
wp_enqueue_script( 'widget-js', ... );  // should be 'easy-tf-widget'
```

WordPress handle registration is global. `mcbAdmin` and `widget-js` are generic enough that another plugin could register the same handle with a different URL, causing one plugin's asset to silently replace the other's.

**Fix:** Prefix all handles with the plugin slug: `easy-tf-admin`, `easy-tf-widget`, etc.

---

### [LOW-12] `react` / `react-dom` used as dependency handles instead of `wp-element`

**File:** `inc/admin-menu.php` line 17

```php
wp_enqueue_script(
    'etf-admin-dashboard',
    EASY_TF_DIR_URL . 'build/admin-dashboard.js',
    [ 'react', 'react-dom', 'wp-data', 'wp-api', 'wp-util', 'wp-i18n' ],
    EASY_TF_VERSION,
    true
);
```

WordPress bundles React under the handle `wp-element`, not `react` or `react-dom`. While WordPress does register `react` and `react-dom` as internal handles in some versions, this is undocumented and subject to change. Declaring `wp-element` as a dependency is the correct, future-proof approach.

**Fix:** Replace `'react', 'react-dom'` with `'wp-element'` in the dependency array.

---

### [LOW-13] `document.execCommand('copy')` is deprecated in both files

**Files:** `assets/js/admin.js` line 6; `src/Settings.js` line 29

`document.execCommand()` is deprecated across all major browsers and may be removed in future versions. The modern replacement is the asynchronous `navigator.clipboard` API.

**Fix:**

```js
async function eftHandleShortcode(id) {
    const input   = document.querySelector(`#etfAdminShortcode-${id} input`);
    const tooltip = document.querySelector(`#etfAdminShortcode-${id} .tooltip`);
    try {
        await navigator.clipboard.writeText(input.value);
    } catch {
        // Fallback for non-secure contexts (HTTP)
        input.select();
        document.execCommand('copy');
    }
    tooltip.textContent = wp.i18n.__('Copied Successfully!', 'easy-twitter-feeds');
    setTimeout(() => {
        tooltip.textContent = wp.i18n.__('Copy To Clipboard', 'easy-twitter-feeds');
    }, 1500);
}
```

Apply the same pattern in `Settings.js`'s `clickToCopy` function.

---

### [LOW-14] `<a>` elements in Follow/Tweet buttons have no `href` attribute

**Files:** `src/Components/Common/FollowButton.js` line 12; `src/Components/Common/TweetButton.js` line 12

```jsx
<a onClick={handleTwitterFollow} rel='noreferrer' className="etfButton">
```

Anchor elements without an `href`:

- Are **not keyboard-focusable** by default (WCAG 2.1 SC 2.1.1 failure).
- Cannot be right-clicked to "Open in New Tab".
- Render with `cursor: default` instead of `cursor: pointer` (requires extra CSS).
- Are not recognised as links by search engines or screen readers.

**Fix:** Compute the URL outside the handler and use it in `href`:

```jsx
const twitterUrl = `https://twitter.com/intent/follow?region=follow_link&screen_name=${encodeURIComponent(userName)}`;

return (
    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="etfButton">
        {/* … */}
    </a>
);
```

The `onClick` handler becomes unnecessary and can be removed.

---

### [LOW-15] No plugin deactivation or uninstall cleanup

**File:** `easy-twitter-feeds.php` (absent)

The plugin does not register `register_deactivation_hook()` or `register_uninstall_hook()` (and has no `uninstall.php`). While the plugin currently writes no persistent options of its own, the Freemius Lite SDK does write to `fs_lite_accounts`, `{slug}-opt_in`, `{slug}-marketing-allowed`, and `{slug}-redirect` options. These are left behind when the plugin is deleted.

**Fix:** Add `uninstall.php` at a minimum:

```php
<?php
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) { exit; }
// Clean up Freemius Lite options if desired (user-consent-aware cleanup)
delete_option( 'easy-twitter-feeds-opt_in' );
delete_option( 'easy-twitter-feeds-marketing-allowed' );
delete_option( 'easy-twitter-feeds-redirect' );
```

---

### [LOW-16] `block.json` keywords contain placeholder values

**File:** `src/block.json` lines 8–12

```json
"keywords": ["key1", "key2", "key3"]
```

These are clearly from a boilerplate template. They are useless for block discoverability and appear unprofessional in the Block Directory.

**Fix:**

```json
"keywords": ["twitter", "X", "social media", "feed", "embed"]
```

---

### [LOW-17] `readme.txt` Installation section contains boilerplate "e.g." artifact

**File:** `readme.txt` line 155

```
== Installation ==

This section describes how to install the plugin and get it working.

e.g.

1. Upload `easy-twitter-feeds` …
```

The `e.g.` line is a leftover from the default WordPress plugin readme template. WP.org reviewers will flag this.

**Fix:** Delete the `e.g.` line.

---

### [LOW-18] Unused constant `EASY_TF_ASSETS_DIR`

**File:** `easy-twitter-feeds.php` line 17

```php
define( 'EASY_TF_ASSETS_DIR', plugin_dir_url(__FILE__) . 'assets/' );
```

A grep of the entire plugin (excluding `node_modules`) finds zero usages of `EASY_TF_ASSETS_DIR`. All asset references use `EASY_TF_DIR_URL . 'assets/...'` directly.

**Fix:** Remove the constant, or refactor all asset URLs to use it for DRY consistency.

---

### [LOW-19] "Duplicate" link text is not translatable

**File:** `inc/CustomPost.php` line 100

```php
$actions['duplicate'] = '<a href="' . esc_url($nonce_url) . '">Duplicate</a>';
```

The link text is hardcoded English, never passed through a translation function.

**Fix:**

```php
$actions['duplicate'] = sprintf(
    '<a href="%s">%s</a>',
    esc_url( $nonce_url ),
    esc_html__( 'Duplicate', 'easy-twitter-feeds' )
);
```

---

## WP.org Readiness Checklist

| Item | Status | Notes |
|------|--------|-------|
| Plugin header — all required fields | ✅ Pass | Name, URI, Description, Version, Author, Text Domain, License all present |
| GPL-compatible license declared | ✅ Pass | GPLv3 or later |
| `License URI` in header | ✅ Pass | Present |
| Text domain matches plugin slug | ✅ Pass | `easy-twitter-feeds` throughout |
| `readme.txt` — `Stable tag` matches plugin header version | ✅ Pass | Both `1.2.13` |
| `readme.txt` — `Requires at least` / `Tested up to` | ✅ Pass | `6.5` / `6.9` |
| External services fully disclosed | ✅ Pass | X/Twitter and Freemius Lite documented with ToS/Privacy links |
| No data sent without opt-in consent | ✅ Pass | Freemius Lite gated behind explicit opt-in |
| ABSPATH guard in every PHP file | ✅ Pass | All PHP files checked |
| Nonce on destructive admin actions | ✅ Pass | Duplicate post action uses `check_admin_referer()` |
| Output escaping in shortcode templates | ✅ Pass | `esc_attr`, `esc_html` used correctly |
| `load_plugin_textdomain()` called | ❌ Fail | Missing — PHP strings will not be translated (see LOW-10) |
| Plugin deactivation/uninstall cleanup | ❌ Fail | No `uninstall.php` or hooks (see LOW-15) |
| Script/style handles namespaced | ❌ Fail | `mcbAdmin`, `widget-js` (see LOW-11) |
| `block.json` keywords meaningful | ❌ Fail | Placeholder "key1/key2/key3" (see LOW-16) |
| `readme.txt` installation text clean | ❌ Fail | "e.g." artifact (see LOW-17) |
| `[etf]` shortcode access control | ❌ Fail | Post-type/status guard missing (see HIGH-1) |
| `.DS_Store` excluded from distribution | ⚠️ Warning | `.DS_Store` committed to git; must not be in plugin zip |
| `node_modules/` excluded from distribution | ⚠️ Warning | `node_modules` present in working directory; must be excluded from plugin zip via `.distignore` |
| Build artifacts (`easy-twitter-feeds.zip`) not committed | ⚠️ Warning | Zip artifact committed to git root; should not be version-controlled |

---

## Recommended Fix Priority

1. **[HIGH-1]** Post-type + status guard in `onAddShortcode` — 10-minute fix, prevents content bypass.
2. **[MEDIUM-7]** `encodeURIComponent` on tweet/follow URLs — breaks core plugin functionality.
3. **[HIGH-2]** Conditionally enqueue `widget.js` — visible performance regression on every page.
4. **[MEDIUM-8]** `try/catch` around `JSON.parse` in `view.js` — prevents silently broken blocks.
5. **[MEDIUM-3 + 5]** Null guard and `wp_insert_post` error check in `CustomPost.php`.
6. **[MEDIUM-9]** Register or remove the `etfPipeChecker` AJAX action.
7. **[LOW-10]** Add `load_plugin_textdomain()` — required for WP.org approval.
8. **[MEDIUM-4]** Replace `current_user_can('edit_posts')` with `current_user_can('edit_post', $post_id)`.
9. Remaining LOW items before next WP.org submission.

async function eftHandleShortcode(id) {
	var input   = document.querySelector('#etfAdminShortcode-' + id + ' input');
	var tooltip = document.querySelector('#etfAdminShortcode-' + id + ' .tooltip');
	try {
		await navigator.clipboard.writeText(input.value);
	} catch (e) {
		// Fallback for non-secure contexts (plain HTTP)
		input.select();
		input.setSelectionRange(0, 99999);
		document.execCommand('copy'); // eslint-disable-line -- intentional fallback for non-secure (HTTP) contexts
	}
	tooltip.textContent = wp.i18n.__('Copied Successfully!', 'easy-twitter-feeds');
	setTimeout(function () {
		tooltip.textContent = wp.i18n.__('Copy To Clipboard', 'easy-twitter-feeds');
	}, 1500);
}

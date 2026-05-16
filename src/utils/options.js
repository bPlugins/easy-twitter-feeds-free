import { __ } from '@wordpress/i18n';
import { XIcon, twitterIcon } from './icons';


export const types = [
	{ label: __('Timeline', 'easy-twitter-feeds'), value: 'timeline' },
	{ label: __('Follow Button', 'easy-twitter-feeds'), value: 'follow' },
	{ label: __('Tweet Button', 'easy-twitter-feeds'), value: 'tweet' }
];
export const themes = [
	{ label: __('Dark', 'easy-twitter-feeds'), value: 'dark' },
	{ label: __('Light', 'easy-twitter-feeds'), value: 'light' }
];
export const twitterIcons = [
	{ label: __('Twitter Icon', 'easy-twitter-feeds'), value: 'tIcon', icon: twitterIcon() },
	{ label: __('X Icon', 'easy-twitter-feeds'), value: 'xIcon', icon: XIcon() }
];
export const yesNoOptions = [
	{ label: __('Yes', 'easy-twitter-feeds'), value: 'yes' },
	{ label: __('No', 'easy-twitter-feeds'), value: 'no' }
];


export const generalStyleTabs = [
	{ name: 'general', title: __('General', 'easy-twitter-feeds') },
	{ name: 'style', title: __('Style', 'easy-twitter-feeds') }
];
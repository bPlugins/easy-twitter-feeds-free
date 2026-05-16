import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './Edit';
import './editor.scss';
import { twitterIcon } from './utils/icons';

registerBlockType(metadata, {
	icon: twitterIcon('#4527a4'),

	edit: Edit,

	save: () => null
});
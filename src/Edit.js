import { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { produce } from 'immer';
import { useBlockProps } from '@wordpress/block-editor';
// Settings Components
import { tabController } from '../../bpl-tools/utils/functions';

import Settings from './Settings';
import Style from './Style';
import { Placeholder } from '@wordpress/components';
import Timeline from './Components/Common/Timeline';
import FollowButton from './Components/Common/FollowButton';
import TweetButton from './Components/Common/TweetButton';
import { twitterIcon } from './utils/icons';
import { types } from './utils/options';
import { SelectControl } from '@wordpress/components';

const Edit = props => {
	const { attributes, setAttributes, clientId, isSelected } = props;
	const { type } = attributes;

	useEffect(() => { clientId && setAttributes({ cId: clientId.substring(0, 10) }); }, [clientId]); // Set & Update clientId to cId

	useEffect(() => tabController(), [isSelected]);

	const updateObj = (object, property, val, childProp = false) => {
		const newObj = produce(attributes[object], draft => {
			if (false !== childProp) {
				draft[property][childProp] = val;
			} else {
				draft[property] = val;
			}
		});
		setAttributes({ [object]: newObj });
	}



	const id = `etfTwitterFeed-${clientId}`

	return <>
		<Settings attributes={attributes} setAttributes={setAttributes} updateObj={updateObj} />

		<div {...useBlockProps()} id={id}>
			<Style attributes={attributes} id={id} />

			<div className={`etfTwitterFeed`}>
				{type ? <>
					{type == "timeline" && <div className="twitter_iframe">
						<Timeline attributes={attributes} />
					</div>}
					{type == "follow" && <FollowButton attributes={attributes} />}
					{type == "tweet" && <TweetButton attributes={attributes} />}
				</> :
					<Placeholder icon={twitterIcon('#03A9F4')} instructions={__("Choose a Feed type to get started.", "easy-twitter-feeds")} label={__("Choose a Feed Type", "easy-twitter-feeds")}>
						<SelectControl value={type} onChange={val => setAttributes({ type: val })} options={types} />
					</Placeholder>}
			</div>
		</div>
	</>;
};
export default Edit;



import { createRoot } from 'react-dom/client';

import './style.scss';
import Style from './Style';
import Timeline from './Components/Common/Timeline';
import FollowButton from './Components/Common/FollowButton';
import TweetButton from './Components/Common/TweetButton';

// Block Name
document.addEventListener('DOMContentLoaded', () => {
	const blockEls = document.querySelectorAll('.wp-block-etf-twitter-feed');
	blockEls.forEach(blockEl => {
		let attributes;
		try {
			attributes = JSON.parse(blockEl.dataset.attributes);
		} catch (e) {
			console.error('Easy Twitter Feeds: Failed to parse block attributes', e);
			return;
		}

		createRoot(blockEl).render(<>
				<Style attributes={attributes} id={blockEl?.id} />

				<TwitterFeed attributes={attributes} />
			</>);

		blockEl?.removeAttribute('data-attributes');
	});
});

const TwitterFeed = ({ attributes }) => {
	const { type } = attributes;

	return <div className={`etfTwitterFeed`}>
		{type == "timeline" && <Timeline attributes={attributes} />}
		{type == "follow" && <FollowButton attributes={attributes} />}
		{type == "tweet" && <TweetButton attributes={attributes} />}
	</div>
}
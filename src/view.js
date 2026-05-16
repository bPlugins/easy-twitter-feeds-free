import { render } from 'react-dom';

import './style.scss';
import Style from './Style';
import Timeline from './Components/Common/Timeline';
import FollowButton from './Components/Common/FollowButton';
import TweetButton from './Components/Common/TweetButton';

// Block Name
document.addEventListener('DOMContentLoaded', () => {
	const blockEls = document.querySelectorAll('.wp-block-etf-twitter-feed');
	blockEls.forEach(blockEl => {
		const attributes = JSON.parse(blockEl.dataset.attributes);

		render(<>
			<Style attributes={attributes} id={blockEl?.id} />

			<TwitterFeed attributes={attributes} />
		</>, blockEl);

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
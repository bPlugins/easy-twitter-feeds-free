import { XIcon, twitterIcon } from "../../utils/icons";

const TweetButton = ({ attributes }) => {
    const { userName, button } = attributes
    const { iconsType } = button

    const handleTwitterTweet = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?screen_name=${userName}&text=${button.tweetText}`;
        window.open(twitterUrl, '_blank');
    };

    return <a onClick={handleTwitterTweet} className="etfButton">
        {iconsType == "tIcon" ? twitterIcon() : XIcon()}
        <span>Tweet to @{userName}</span>
    </a>
}

export default TweetButton;
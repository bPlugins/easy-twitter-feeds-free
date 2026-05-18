import { XIcon, twitterIcon } from "../../utils/icons";

const TweetButton = ({ attributes }) => {
    const { userName, button } = attributes
    const { iconsType } = button

    const twitterUrl = `https://twitter.com/intent/tweet?screen_name=${encodeURIComponent(userName)}&text=${encodeURIComponent(button.tweetText)}`;

    return <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="etfButton">
        {iconsType == "tIcon" ? twitterIcon() : XIcon()}
        <span>Tweet to @{userName}</span>
    </a>
}

export default TweetButton;
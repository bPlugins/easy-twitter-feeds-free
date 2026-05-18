import { XIcon, twitterIcon } from "../../utils/icons";

const FollowButton = ({ attributes }) => {
    const { userName, button } = attributes;
    const { iconsType } = button

    const twitterUrl = `https://twitter.com/intent/follow?region=follow_link&screen_name=${encodeURIComponent(userName)}`;

    return <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="etfButton">
        {iconsType == "tIcon" ? twitterIcon() : XIcon()}
        <span> Follow @{userName}</span>
    </a>
}
export default FollowButton;
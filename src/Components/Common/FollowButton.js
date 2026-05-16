import { XIcon, twitterIcon } from "../../utils/icons";

const FollowButton = ({ attributes }) => {
    const { userName, button } = attributes;
    const { iconsType } = button

    const handleTwitterFollow = () => {
        const twitterUrl = `https://twitter.com/intent/follow?region=follow_link&screen_name=${userName}`;
        window.open(twitterUrl, '_blank');
    };

    return <a onClick={handleTwitterFollow} rel='noreferrer' className="etfButton">
        {iconsType == "tIcon" ? twitterIcon() : XIcon()}
        <span> Follow @{userName}</span>
    </a>
}
export default FollowButton;
import { getBorderCSS, getColorsCSS, getMultiShadowCSS, getTypoCSS, getBoxCSS } from '../../bpl-tools/utils/getCSS';

const Style = ({ attributes, id }) => {
	const { alignment, button, border, shadow } = attributes;
	const { icon, typo, colors, padding } = button;

	const mainSl = `#${id}`;
	const blockSl = `${mainSl} .etfTwitterFeed`;

	return <style dangerouslySetInnerHTML={{
		__html: `
		${getTypoCSS('', typo)?.googleFontLink}
		${getTypoCSS(`${blockSl} .etfButton`, typo)?.styles}

		${mainSl}{
			text-align: ${alignment};
		}
		${blockSl}{
			text-align: ${alignment};
		}
		${blockSl} .etfButton{
		    ${getColorsCSS(colors)}
			padding: ${getBoxCSS(padding)};
			
		}
		${blockSl} .etfButton svg{
			width: ${icon.width};
			height: ${icon.height};
		}
		${blockSl} iframe, ${blockSl} .etfButton{
			${getBorderCSS(border)}
			box-shadow: ${getMultiShadowCSS(shadow)};
		}
	`}} />;
}
export default Style;
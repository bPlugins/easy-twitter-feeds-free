import { useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { InspectorControls, BlockControls, AlignmentToolbar } from '@wordpress/block-editor';
import { PanelBody, TabPanel, TextControl, SelectControl, ToggleControl, __experimentalUnitControl as UnitControl, __experimentalBoxControl as BoxControl } from '@wordpress/components';
import { produce } from 'immer';

// Settings Components
import { Label, ColorsControl, Typography, ShadowControl, Notice } from '../../bpl-tools/Components';
import { BorderControl } from '../../bpl-tools/Components/Deprecated';

import { tabController } from '../../bpl-tools/utils/functions';
import { emUnit, perUnit, pxUnit } from '../../bpl-tools/utils/options';

import { generalStyleTabs, yesNoOptions, themes, types, twitterIcons } from './utils/options';
import { withSelect } from '@wordpress/data';

const Settings = ({ attributes, setAttributes, updateObj, currentPostId, currentPostType }) => {
	const { userName, type, config, alignment, border, shadow, button } = attributes;
	const { theme, width, scrolling } = config;
	const { tweetText, icon, typo, colors, padding } = button;

	const clickToCopyToolTipRef = useRef(null);
	const clickToCopyRef = useRef(null);

	const clickToCopy = () => {
		if (clickToCopyRef.current) {
			clickToCopyRef.current.select();

			document.execCommand('copy');
			clickToCopyToolTipRef.current.innerHTML = __('Copied Successfully!', 'easy-twitter-feeds');
			setTimeout(() => {
				clickToCopyToolTipRef.current.innerHTML = __('Copy To Clipboard', 'easy-twitter-feeds');
			}, 1500);
		}
	}

	return <>
		{type && <InspectorControls>
			{currentPostType == "easy-twitter-feeds" && <div className='etfFrontShortcode' >
				<TextControl value={`[etf id=${currentPostId}]`} className='components-text-control__input' label={__('Copy Shortcode', 'easy-twitter-feeds')} onClick={clickToCopy} ref={clickToCopyRef} />
				<span className='tooltip' ref={clickToCopyToolTipRef}>{__('Copy To Clipboard', 'easy-twitter-feeds')}</span>
			</div>}

			<TabPanel className='bPlTabPanel' activeClass='activeTab' tabs={generalStyleTabs} onSelect={tabController}>{tab => <>
				{'general' === tab.name && <>
					<PanelBody className='bPlPanelBody' title={__('Twitter Feed', 'easy-twitter-feeds')}>
						{['timeline', 'follow', 'tweet'].includes(type) && <>
							<Label className='mb5'>{__('Username:', 'easy-twitter-feeds')}</Label>
							<TextControl value={userName} onChange={val => setAttributes({ userName: val })} />
						</>}

						<SelectControl
							className='mt20'
							label="Type"
							labelPosition='left'
							value={type}
							onChange={val => setAttributes({ type: val })}
							options={types}
						/>


					</PanelBody>

					{['timeline'].includes(type) && <PanelBody className='bPlPanelBody' title={__('Config', 'easy-twitter-feeds')} initialOpen={false}>
						<UnitControl label={__('Width:', 'easy-twitter-feeds')} labelPosition='left' value={width} onChange={val => updateObj('config', 'width', val)} units={[pxUnit(610), emUnit(35), perUnit(100)]} />

						<SelectControl className='mt20' label={__('Scrolling?', 'easy-twitter-feeds')} labelPosition='left' value={scrolling} onChange={val => updateObj('config', 'scrolling', val)} options={yesNoOptions} />

						<SelectControl className='mt20' label={__('Theme', 'easy-twitter-feeds')} labelPosition='left' value={theme} onChange={val => updateObj('config', 'theme', val)} options={themes} />

						<ToggleControl className='mt20' label={__('Show Header', 'easy-twitter-feeds')} checked={config.isHeader} onChange={val => updateObj('config', 'isHeader', val)} />
						<ToggleControl className='mt20' label={__('Show Footer', 'easy-twitter-feeds')} checked={config.isFooter} onChange={val => updateObj('config', 'isFooter', val)} />
						<TextControl className='mt20' label={__('Language', 'easy-twitter-feeds')} value={config.language} onChange={val => updateObj('config', 'language', val)} />
					</PanelBody>}

					{['tweet'].includes(type) && <PanelBody className='bPlPanelBody addRemoveItems editItem' title={__('Tweet Button', 'easy-twitter-feeds')}>
						<Label className='mb5'>{__('Tweet Text:', 'easy-twitter-feeds')}</Label>
						<TextControl value={tweetText} onChange={val => updateObj('button', 'tweetText', val)} />
					</PanelBody>}
				</>}


				{'style' === tab.name && <>
					<PanelBody className='bPlPanelBody' title={__('Twitter', 'easy-twitter-feeds')}>
						<BorderControl label={__('Border:', 'easy-twitter-feeds')} value={border} onChange={val => setAttributes({ border: val })} defaults={{ radius: '5px' }} />

						<ShadowControl label={__('Shadow:', 'easy-twitter-feeds')} value={shadow} onChange={val => setAttributes({ shadow: val })} produce={produce} />
					</PanelBody>


					{type !== 'timeline' && <PanelBody className='bPlPanelBody' title={__('Button', 'easy-twitter-feeds')}>

						<UnitControl className='mt20' label={__('Icon Width:', 'easy-twitter-feeds')} labelPosition='left' value={icon.width} onChange={val => updateObj('button', 'icon', val, 'width')} units={[pxUnit(28)]} />

						<UnitControl className='mt20' label={__('Icon Height:', 'easy-twitter-feeds')} labelPosition='left' value={icon.height} onChange={val => updateObj('button', 'icon', val, 'height')} units={[pxUnit(20)]} />

						<Typography className='mt20' label={__('Typography:', 'easy-twitter-feeds')} value={typo} onChange={val => updateObj('button', 'typo', val)} defaults={{ fontSize: { desktop: 14 } }} />

						<ColorsControl className='mt20' label={__('Colors:', 'easy-twitter-feeds')} value={colors} onChange={val => updateObj('button', 'colors', val)} defaults={{ color: "#fff", bg: "#1d9bf0" }} />

						<br />

						<BoxControl label={__('Padding:', 'easy-twitter-feeds')} value={padding} onChange={val => updateObj('button', 'padding', val)} resetValues={{ top: "6px", right: "10px", bottom: "6px", left: "10px" }} />

						<SelectControl className='mt20' label={__('Icon Type:', 'easy-twitter-feeds')} labelPosition='left' value={button.iconsType} onChange={val => updateObj('button', 'iconsType', val)} options={twitterIcons} />
					</PanelBody>}
				</>}
			</>}</TabPanel>
		</InspectorControls>}

		<BlockControls>
			<AlignmentToolbar value={alignment} onChange={val => setAttributes({ alignment: val })} describedBy={__('Twitter Alignment')} alignmentControls={[
				{ title: __('Twitter in left', 'easy-twitter-feeds'), align: 'left', icon: 'align-left' },
				{ title: __('Twitter in center', 'easy-twitter-feeds'), align: 'center', icon: 'align-center' },
				{ title: __('Twitter in right', 'easy-twitter-feeds'), align: 'right', icon: 'align-right' }
			]} />
		</BlockControls>
	</>;
};
export default withSelect((select) => {
	const { getCurrentPostId, getCurrentPostType } = select('core/editor');
	return {
		currentPostId: getCurrentPostId(),
		currentPostType: getCurrentPostType()
	}
})(Settings);
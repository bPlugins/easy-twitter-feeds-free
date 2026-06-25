import { gridIcon, masonryIcon, sliderIcon, tickerIcon } from '../../utils/icons';
import { elementorTabIcon, gutenbergTabIcon, phpTabIcon, shortcodeTabIcon } from './icons';

const slug = 'easy-twitter-feeds';

export const dashboardInfo = (info) => {
    const { version, isPremium, hasPro, licenseActiveNonce, adminUrl, deleteDataOnUninstall = false, uninstallNonce = '' } = info;

    const proSuffix = isPremium ? ' Pro' : '';

    return {
        name: `Feeds for Twitter${proSuffix}`,
        displayName: `Feeds for Twitter${proSuffix} - Embed Social Media Posts with Live Updates`,
        description: 'Embed Twitter Timeline/Feed, Post, Video, Hashtag, Follow Button, Tweet Button easily. This plugin is lightweight but super powerful.',
        slug,
        version,
        isPremium,
        hasPro,
        displayOurPlugins: true,
        media: {
            logo: `https://ps.w.org/${slug}/assets/icon-256x256.png`,
            banner: `https://ps.w.org/${slug}/assets/banner-772x250.png`,
            thumbnail: `https://bplugins.com/wp-content/themes/b-technologies/assets/images/products/${slug}.png`,
            // proThumbnail: `https://bplugins.com/wp-content/themes/b-technologies/assets/images/products/${slug}-pro.png`,
            // video: 'https://www.youtube.com/watch?v=izJKf8Lj1xE',
            isYoutube: false
        },
        pages: {
            org: `https://wordpress.org/plugins/${slug}/`,
            // landing: `https://bplugins.com/products/${slug}/`,
            // docs: `https://bplugins.com/docs/${slug}/`,
            pricing: `https://bplugins.com/products/${slug}/pricing`,
        },
        freemius: {
            product_id: 14839,
            plan_id: 24722,
            public_key: 'pk_ba9a28a91e7b8f97d024123dad59c'
        },
        adminUrl,
        licenseActiveNonce,
        deleteDataOnUninstall,
        uninstallNonce,
        startButton: {          // ← new — drives the primary CTA button in the hero card
            label: 'Start Now',
            url: `${adminUrl}post-new.php?post_type=easy-twitter-feeds`
        }
    }
}

export const demoInfo = {
    allInOneLabel: 'See All Demos',
    allInOneLink: 'https://bplugins.com/products/easy-twitter-feeds/#demos',
    demos: [
        {
            title: 'Follow Button',
            type: 'iframe',
            url: 'https://bblockswp.com/demo/twitter-follow-button/'
        },
        {
            title: 'Tweet Button',
            type: 'iframe',
            url: 'https://bblockswp.com/demo/twitter-tweet-button/'
        },
        {
            title: 'Has Tag Button',
            type: 'iframe',
            url: 'https://bblockswp.com/demo/twitter-has-tag-button/'
        },
        {
            title: 'Single Video',
            type: 'iframe',
            url: 'https://bblockswp.com/demo/single-demo/'
        },
        {
            title: 'Single Post',
            type: 'iframe',
            url: 'https://bblockswp.com/demo/twitter-single-post/'
        },

    ]
}

export const pricingInfo = {
    logo: `https://ps.w.org/${slug}/assets/icon-256x256.png`, // Optional
    pluginId: 14839,
    planId: 24722,
    licenses: [
        1,
        3,
        null
    ],
    button: {
        label: 'Buy Now ➜'
    },
    featured: {
        selected: 3, // choose from licenses item
    }
}


export const welcomeInfo = (adminUrl) => ({
    keywords: ['Timeline', 'Follow Button', 'Tweet Button', 'Hashtag Button', 'Single Video', 'Single Post'],
    keywordsLabel: 'Choose a Feed Type',
    gettingStarted: {
        tabs: [
            {
                key: 'gutenberg',
                label: 'Gutenberg',
                icon: gutenbergTabIcon,
                steps: [
                    {
                        num: 1,
                        title: 'Add the Easy Twitter Feeds',
                        body: 'Open the block editor on any post or page. Click the <strong>+</strong> icon in the top-left corner or type <strong>/easy-twitter-feeds</strong> to find and insert the Easy Twitter Feeds block.',
                        link: { url: `${adminUrl}/post-new.php`, label: 'Open Editor' }
                    },
                    {
                        num: 2,
                        title: 'Choose a Feed Type',
                        body: 'Choose your preferred feed type below (<strong>Timeline</strong>, <strong>Follow Button</strong>, <strong>Tweet Button</strong>, <strong>Hashtag Button</strong>, <strong>Video</strong>,<strong>Single Post</strong>) to configure your slider.'
                    },

                    {
                        num: 3,
                        title: 'Publish',
                        body: 'Once everything is configured, click Publish. Make sure you have entered the <strong>Username</strong>, <strong>Id</strong>,<strong>Video ID</strong>.'
                    }
                ]
            },
            {
                key: 'shortcode',
                label: 'ShortCode',
                icon: shortcodeTabIcon,
                steps: [
                    {
                        num: 1,
                        title: 'Open ShortCode Generator',
                        body: 'Go to <strong>Easy Twitter Feeds &rsaquo; ShortCode Generator</strong> in your WordPress admin and click <strong>Add New ShortCode</strong>.',
                        link: { url: `${adminUrl}edit.php?post_type=easy-twitter-feeds`, label: 'ShortCode Generator' }
                    },
                    {
                        num: 2,
                        title: 'Select Source Type',
                        body: 'Choose your preferred feed type below (timeline, follow button, tweet button, hashtag button, single video, single post) to configure your slider.'
                    },

                    {
                        num: 3,
                        title: 'Publish & Copy the Shortcode',
                        body: 'Publish the post. Return to the ShortCode Generator list — the shortcode <code>[etf id=2943]</code> is shown in the list table. Click it to copy to clipboard.'
                    },
                    {
                        num: 4,
                        title: 'Paste Anywhere',
                        body: 'Paste the copied shortcode (e.g. <code>[etf id=2943]</code>) into any post, page, widget area, or block using the <strong>Shortcode</strong> block.'
                    }
                ]
            },
            {
                key: 'elementor',
                label: 'Elementor',
                icon: elementorTabIcon,
                steps: [
                    {
                        num: 1,
                        title: 'Create a ShortCode',
                        body: 'Go to <strong>Easy Twitter Feeds &rsaquo; ShortCode Generator</strong>, click <strong>Add New ShortCode</strong>, configure your layout and query, then publish. Note the shortcode from the list table.',
                        link: { url: `${adminUrl}edit.php?post_type=easy-twitter-feeds`, label: 'ShortCode Generator' }
                    },
                    {
                        num: 2,
                        title: 'Add a Shortcode Widget',
                        body: 'Open the Elementor editor on any page. Search for the <strong>Shortcode</strong> widget and drag it to your desired location on the canvas.'
                    },
                    {
                        num: 3,
                        title: 'Enter & Preview',
                        body: 'Type <code>[etf id=2943]</code> into the widget\'s Shortcode field (replace <em>YOUR_ID</em> with your actual post ID) and click <strong>Preview</strong> to see the posts rendered live.'
                    }
                ]
            },
            {
                key: 'php',
                label: 'Theme / PHP',
                icon: phpTabIcon,
                steps: [
                    {
                        num: 1,
                        title: 'Create a ShortCode',
                        body: 'Go to <strong>Easy Twitter Feeds &rsaquo; ShortCode Generator</strong>, click <strong>Add New ShortCode</strong>, configure your layout and query, then publish. Note the post ID shown in the list table.',
                        link: { url: `${adminUrl}edit.php?post_type=easy-twitter-feeds`, label: 'ShortCode Generator' }
                    },
                    {
                        num: 2,
                        title: 'Open Your Template',
                        body: 'Open the theme template file where you want to display the posts block — for example <code>single.php</code>, <code>page.php</code>, or a custom template part.'
                    },
                    {
                        num: 3,
                        title: 'Render via do_shortcode',
                        body: 'Add <code>&lt;?php echo do_shortcode(\'[etf id=YOUR_ID]\'); ?&gt;</code> in your template (replace <em>YOUR_ID</em> with your actual post ID) to render the block on the front end.'
                    }
                ]
            }
        ]
    },
    changelogs: [
        {
            version: '1.2.12 – 13 April, 26',
            type: 'update',
            list: [
                '<strong>New</strong> Added new modern dashboard'
            ]
        },
        {
            version: '1.2.11 – 11 April, 25',
            type: 'update',
            list: [
                '<strong>Update</strong> Some issues fixed;',
            ]
        },
        {
            version: '1.2.10 – 27 Jan, 24',
            type: 'update',
            list: [
                '<strong>Update</strong> Freemius sdk updates',
            ]
        },
        {
            version: '1.2.9 – 16 Dec, 24',
            type: 'update',
            list: [
                '<strong>Update</strong> pro feature problem fixed',
            ]
        }
    ],
    changelogsLimit: 6,
    changelogsReadMoreLabel: 'View More Changelogs',
    proFeatures: [
        'Timeline - Add Twitter Timeline.',
        'Timeline Style - Add style on Timeline feed Height, Width, Scrolling, and Theme.',
        'Follow Button - Add Twitter Follow Button.',
        'Follow Button Style - Add Button style color, Background, Font Size, and Padding.',
        'Timeline - Hide the timeline header and footer.',
        'Timeline Language: Translate the timeline to any language.',
        'Button Icon - Add Twitter’s latest icon.',
        'Tweet Button - Add Tweet Button with tweet text.',
        'Hashtag - Add a Hashtag with tweet text.',
        'Video - Add a video from any specific Twitter post.',
        'Post - Add any specific Twitter post.'
    ],
})
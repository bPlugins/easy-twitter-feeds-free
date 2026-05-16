import { gridIcon, masonryIcon, sliderIcon, tickerIcon } from '../../utils/icons';

const slug = 'easy-twitter-feeds';

export const dashboardInfo = (info) => {
    const { version, hasPro, licenseActiveNonce } = info;



    return {
        name: `Feeds for Twitter`,
        displayName: `Feeds for Twitter - Embed Social Media Posts with Live Updates`,
        description: 'Embed Twitter Timeline/Feed, Post, Video, Hashtag, Follow Button, Tweet Button easily. This plugin is lightweight but super powerful.',
        slug,
        version,
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
            docs: `https://bplugins.com/docs/${slug}/`,
            pricing: `https://bplugins.com/products/${slug}/pricing`,
        },
        freemius: {
            product_id: 14839,
            plan_id: 24722,
            public_key: 'pk_ba9a28a91e7b8f97d024123dad59c'
        },
        licenseActiveNonce,
        changelogs: [
            {
                version: '1.2.12 – 13 April, 26',
                type: 'update',
                list: [
                    'Added new modern dashboard'
                ]
            },
            {
                version: '1.2.11 – 11 April, 25',
                type: 'update',
                list: [
                    'Some issues fixed;',
                ]
            },
            {
                version: '1.2.10 – 27 Jan, 24',
                type: 'update',
                list: [
                    'Freemius sdk updates',
                ]
            },
            {
                version: '1.2.9 – 16 Dec, 24',
                type: 'update',
                list: [
                    'pro feature problem fixed',
                ]
            }
        ],
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
        startButton: {
            label: 'Start Now',
            url: `wp-admin/post-new.php?post_type=easy-twitter-feeds`
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
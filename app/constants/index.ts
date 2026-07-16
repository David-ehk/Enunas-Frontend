
// constants/index.ts
export const facebook = "/assets/icons/facebook.svg";
export const twitter = "/assets/icons/twitter.svg";
export const instagram = "/assets/icons/instagram.svg";
export const shieldTick = "/assets/icons/shieldTick.svg";
export const support = "/assets/icons/support.svg";
export const truckFast = "/assets/icons/truckFast.svg";

//2 Teil 



export const menuItems = [
    {
      title: 'Neu',
      href: '/neu',
      hasSubmenu: false
    },
    {
      title: 'Women',
      href: '/women',
      hasSubmenu: true,
      submenu: [
        { title: 'Kleider', href: '/women/kleider' },
        { title: 'Hosen', href: '/women/hosen' },
        { title: 'Tops & Shirts', href: '/women/tops' },
        { title: 'Jacken & Mäntel', href: '/women/jacken' },
        { title: 'Schuhe', href: '/women/schuhe' },
        { title: 'Accessoires', href: '/women/accessoires' }
      ]
    },
    {
      title: 'Men',
      href: '/men',
      hasSubmenu: true,
      submenu: [
        { title: 'Hemden', href: '/men/hemden' },
        { title: 'Hosen', href: '/men/hosen' },
        { title: 'T-Shirts', href: '/men/tshirts' },
        { title: 'Jacken', href: '/men/jacken' },
        { title: 'Schuhe', href: '/men/schuhe' }
      ]
    },
    {
      title: 'Bekleidung',
      href: '/bekleidung',
      hasSubmenu: true,
      submenu: [
        { title: 'Hemden', href: '/men/hemden' },
        { title: 'Hosen', href: '/men/hosen' },
        { title: 'T-Shirts', href: '/men/tshirts' },
        { title: 'Jacken', href: '/men/jacken' },
        { title: 'Schuhe', href: '/men/schuhe' }
      ]
    },
    {
      title: 'Sale',
      href: '/sale',
      hasSubmenu: false
    }
  ]


export const footerLinks = [
    {
        title: "Über uns",
        links: [
            { name: "Über uns", link: "/ueber-uns" },
            { name: "Marken & Designer", link: "/marken" },
            { name: "Teil von Enunas", link: "/bewerbung" },
            { name: "Karriere", link: "/karriere" },
        ],
    },
    {
        title: "Hilfe",
        links: [
            { name: "FAQs", link: "/faqs" },
            { name: "Sendungsverfolgung", link: "/sendungsverfolgung" },
            { name: "Lieferung & Rücksendung", link: "/lieferung-&-rücksendung" },
            { name: "Kundenservice", link: "/kundenservice" },
        ],
    },
    {
        title: "Rechtliches",
        links: [
            { name: "Impressum", link: "/Impressum" },
            { name: "AGBs", link: "/agbs" },
            { name: "Cookie-Richtlinien", link: "/cookie-richtlinien" },
            { name: "Cookie-Einstellungen", link: "/cookie-einstellungen" },
            { name: "Nutzungsbedingungen", link: "/nutzungsbedingungen" },
            { name: "Datenschutzerklärung", link: "/datenschutzerklaerung" },
        ],
    },
];
//icons müssen gewechselt werden
export const Zahlungsarten = [
    { src: facebook, alt: "facebook logo" },
    { src: twitter, alt: "twitter logo" },
    { src: instagram, alt: "instagram logo" },
];

// mehr Icons für Tiktok und Youtube (Snapchat, Pinterest, Spotify)
export const socialMedia = [
    { src: facebook, alt: "facebook logo" },
    { src: twitter, alt: "twitter logo" },
    { src: instagram, alt: "instagram logo" },
];

// constants/index.ts
export const facebook = "/assets/icons/facebook.svg";
export const twitter = "/assets/icons/twitter.svg";
export const instagram = "/assets/icons/facebook.svg";
export const shieldTick = "/assets/icons/shieldTrick.svg";
export const support = "/assets/icons/support.svg";
export const truckFast = "/assets/icons/truckFast.svg";

//2 Teil 
export const bigShoe = "/assets/icons/bigShoe.svg";
export const bigShoe1 = "/assets/icons/bigShoe1.svg";
export const bigShoe2 = "/assets/icons/bigShoe2.svg";
export const bigShoe3 = "/assets/icons/bigShoe3.svg";
export const customer1 = "/assets/icons/customer1.svg";
export const customer2 = "/assets/icons/customer2.svg";
export const shoe4 = "/assets/icons/shoe4.svg";
export const shoe5 = "/assets/icons/shoe5.svg";
export const shoe6 = "/assets/icons/shoe6.svg";
export const shoe7 = "/assets/icons/shoe7.svg";
export const thumbnailShoe1 = "/assets/icons/thumbnailShoe1.svg";
export const thumbnailShoe2 = "/assets/icons/thumbnailShoe2.svg";
export const thumbnailShoe3 = "/assets/icons/thumbnailShoe3.svg";


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

export const services = [
    {
        imgURL: truckFast,
        label: "Free shipping",
        subtext: "Enjoy seamless shopping with our complimentary shipping service."
    },
    {
        imgURL: shieldTick,
        label: "Secure Payment",
        subtext: "Experience worry-free transactions with our secure payment options."
    },
    {
        imgURL: support,
        label: "Love to help you",
        subtext: "Our dedicated team is here to assist you every step of the way."
    },
];



export const footerLinks = [
    {
        title: "Über uns",
        links: [
            { name: "About us", link: "/" },
            { name: "Marken ", link: "/" },
            { name: "Clothing Brands", link: "/" },
            { name: "Karriere", link: "/" },
          
        ],
    },
    {
        title: "Hilfe",
        links: [
            { name: "FAQs", link: "/" },
            { name: "Sendungsverfolgung", link: "/" },
            { name: "Lieferung & Rüksendung", link: "/" },
            { name: "Kundenservice", link: "/" },
            
        ],
    },
    {
        title: "Get in touch",
        links: [
            { name: "Impresum", link: "impresum" },
            { name: "AGBs", link: "agbs" },
            { name: "Cookie-Richtlinien", link: "/" },
            { name: "Cookie-Einstellungen", link: "/" },
            { name: "Nutzungsbedingungen", link: "/" },
            { name: "Datenschutzerklärung", link: "/" },
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
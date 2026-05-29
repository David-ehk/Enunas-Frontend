/* global window */
// Enunas mega-nav content. German voice, "du" form, brand names in English.
// Each category: sub-nav links + Highlights + a 2×2 editorial grid (tile 0 = video).

const IMG = {
  trendy: "img/TRENDY.jpg",
  newin: "img/NEWIN.jpg",
  t1: "img/Test1.jpg",
  t3: "img/Test3.jpg",
  t4: "img/Test4.jpg",
};

const CATEGORIES = [
  {
    key: "neu", label: "Neu", title: "Neu", kicker: "Diese Woche · 48 Stücke",
    sub: [
      { label: "Alle Neuheiten" },
      { label: "Damen", deep: true },
      { label: "Herren", deep: true },
      { label: "Schuhe" },
      { label: "Taschen" },
      { label: "Accessoires" },
    ],
    highlights: ["Herbstkollektion 2026", "Die Drop-Liste", "Wieder verfügbar"],
    tiles: [
      { video: true, kicker: "Kampagne", name: "Herbst 2026", img: IMG.trendy },
      { kicker: "Streetwear", name: "Worlds End Denim", img: IMG.newin },
      { kicker: "Neu", name: "Drop Hoodie Vol.1", img: IMG.t1 },
      { kicker: "Schuhe", name: "Neue Sneaker", img: IMG.t3 },
    ],
  },
  {
    key: "trendy", label: "Trendy", title: "Trendy", kicker: "Was gerade läuft",
    sub: [
      { label: "Bestseller" },
      { label: "Meistgesehen" },
      { label: "Editor's Picks" },
      { label: "Im Trend: Schuhe", deep: true },
      { label: "Im Trend: Taschen", deep: true },
    ],
    highlights: ["Das Berlin-Set", "Quiet Luxury", "Statement-Taschen"],
    tiles: [
      { video: true, kicker: "Im Trend", name: "Die Berlin-Uniform", img: IMG.newin },
      { kicker: "Bestseller", name: "Volume Tee", img: IMG.t1 },
      { kicker: "Editor's Pick", name: "Atelier Overcoat", img: IMG.t4 },
      { kicker: "Meistgesehen", name: "Cashmere Crew", img: IMG.t3 },
    ],
  },
  {
    key: "catalogue", label: "Catalogue", title: "Katalog", kicker: "248 Stücke · 42 Marken",
    sub: [
      { label: "Alle Kategorien" },
      { label: "Streetwear", deep: true },
      { label: "Experimental", deep: true },
      { label: "Athleisure", deep: true },
      { label: "Culture", deep: true },
    ],
    highlights: ["Nach Marke", "Nach Farbe", "Nach Preis"],
    tiles: [
      { video: true, kicker: "Der Katalog", name: "Kuratiert für dich", img: IMG.t4 },
      { kicker: "Streetwear", name: "Drop Hoodie Vol.1", img: IMG.t1 },
      { kicker: "Culture", name: "Cashmere Crew", img: IMG.trendy },
      { kicker: "Athleisure", name: "Featherweight Puffer", img: IMG.newin },
    ],
  },
  {
    key: "bekleidung", label: "Bekleidung", title: "Bekleidung", kicker: "Vom Shirt bis zum Mantel",
    sub: [
      { label: "Alle Bekleidung" },
      { label: "Tops", deep: true },
      { label: "Bottoms", deep: true },
      { label: "Kleider" },
      { label: "Outerwear", deep: true },
      { label: "Strick" },
      { label: "Denim" },
    ],
    highlights: ["Die Hosen-Edit", "Leichte Jacken", "Basics neu gedacht"],
    tiles: [
      { video: true, kicker: "Lookbook", name: "Schichten für den Herbst", img: IMG.t3 },
      { kicker: "Denim", name: "Worlds End Denim", img: IMG.newin },
      { kicker: "Tops", name: "Volume Tee, Charcoal", img: IMG.t1 },
      { kicker: "Outerwear", name: "Atelier Overcoat", img: IMG.t4 },
    ],
  },
  {
    key: "women", label: "Women", title: "Damen", kicker: "Damenmode entdecken",
    sub: [
      { label: "Damenmode entdecken" },
      { label: "Prêt-à-porter", deep: true },
      { label: "Taschen", deep: true },
      { label: "Kleinlederwaren", deep: true },
      { label: "Accessoires", deep: true },
      { label: "Schmuck", deep: true },
      { label: "Schuhe", deep: true },
    ],
    highlights: ["Herbstkollektion 2026", "Die Book Cover Kollektion", "Hochzeitsoutfits"],
    tiles: [
      { video: true, kicker: "Damen · Kampagne", name: "Herbst 2026", img: IMG.trendy },
      { kicker: "Prêt-à-porter", name: "Cashmere Crew, Crema", img: IMG.t1 },
      { kicker: "Schuhe", name: "Die Sneaker-Galerie", img: IMG.newin },
      { kicker: "Accessoires", name: "Statement-Taschen", img: IMG.t3 },
    ],
  },
  {
    key: "men", label: "Men", title: "Herren", kicker: "Herrenmode entdecken",
    sub: [
      { label: "Herrenmode entdecken" },
      { label: "Prêt-à-porter", deep: true },
      { label: "Taschen", deep: true },
      { label: "Schuhe", deep: true },
      { label: "Accessoires", deep: true },
      { label: "Grooming" },
    ],
    highlights: ["Tailoring", "Die Sneaker-Galerie", "Workwear"],
    tiles: [
      { video: true, kicker: "Herren · Kampagne", name: "Nach Sonnenuntergang", img: IMG.newin },
      { kicker: "Tailoring", name: "Atelier Overcoat", img: IMG.t4 },
      { kicker: "Prêt-à-porter", name: "Drop Hoodie Vol.1", img: IMG.t1 },
      { kicker: "Schuhe", name: "Neue Sneaker", img: IMG.t3 },
    ],
  },
  {
    key: "marken", label: "Marken", title: "Marken", kicker: "42 Ateliers · kuratiert",
    sub: [
      { label: "Alle Marken" },
      { label: "World's End", deep: true },
      { label: "Volt Atelier", deep: true },
      { label: "Marin Studio", deep: true },
      { label: "Kashmir & Co.", deep: true },
      { label: "Hexen Berlin", deep: true },
      { label: "Frantz", deep: true },
    ],
    highlights: ["Neu auf Enunas", "Nur bei uns", "Atelier-Geschichten"],
    tiles: [
      { video: true, kicker: "Atelier", name: "World's End, Kreuzberg", img: IMG.t4 },
      { kicker: "Neu", name: "Volt Atelier", img: IMG.newin },
      { kicker: "Nur bei uns", name: "Marin Studio", img: IMG.trendy },
      { kicker: "Kollektion", name: "Kashmir & Co.", img: IMG.t1 },
    ],
  },
  {
    key: "drops", label: "Drops", title: "Drops", kicker: "Limitiert · auf die Sekunde",
    sub: [
      { label: "Live jetzt" },
      { label: "Kommende Drops" },
      { label: "Vergangene Drops" },
      { label: "Erinnerung aktivieren" },
    ],
    highlights: ["Drop Vol.1", "Worlds End × Enunas", "Der Countdown"],
    tiles: [
      { video: true, kicker: "Live · endet in 02:14:08", name: "Drop Vol.1", img: IMG.t1 },
      { kicker: "Kommend", name: "Worlds End × Enunas", img: IMG.newin },
      { kicker: "Vergangen", name: "Easter Capsule", img: IMG.t3 },
      { kicker: "Bald", name: "Winter-Drop", img: IMG.t4 },
    ],
  },
  {
    key: "sale", label: "Sale", title: "Sale", kicker: "Bis −50% · nur kurze Zeit", tone: "sale",
    sub: [
      { label: "Alle Reduzierungen" },
      { label: "Damen Sale", deep: true },
      { label: "Herren Sale", deep: true },
      { label: "Schuhe Sale" },
      { label: "Letzte Chance" },
    ],
    highlights: ["Bis −50%", "Nur kurze Zeit", "Letzte Größen"],
    tiles: [
      { video: true, kicker: "Sale", name: "Bis zu 50% reduziert", img: IMG.t3 },
      { kicker: "Damen", name: "Cashmere Crew", img: IMG.t1 },
      { kicker: "Letzte Chance", name: "Featherweight Puffer", img: IMG.newin },
      { kicker: "Herren", name: "Walker Trouser", img: IMG.t4 },
    ],
  },
];

window.CATEGORIES = CATEGORIES;
window.HERO_IMG = IMG.newin;

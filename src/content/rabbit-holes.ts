import importedDiscoveries from "./rabbit-holes-imported.json";

const seedDiscoveries = [
  { id: "atlas", title: "Atlas of Space", description: "Explore the solar system and get a feel for the scale and motion of its celestial bodies.", categories: ["Interactive", "Visualizations"], url: "https://atlasof.space/", discussion: "https://news.ycombinator.com/item?id=42634787" },
  { id: "crystals", title: "Quasicrystals Playground", description: "Play with hypnotic patterns and explore the geometry of quasicrystals.", categories: ["Interactive", "Visualizations"], url: "https://hypnagogic-quasicrystals.github.io/", discussion: "https://news.ycombinator.com/item?id=49310533" },
  { id: "cursor", title: "The website that moves your cursor", description: "A playful browser experiment that makes your cursor behave a little differently.", categories: ["Interactive"], url: "https://www.attejuvonen.fi/mouse/", discussion: "https://news.ycombinator.com/item?id=26659860" },
  { id: "human", title: "Talk to Me Human", description: "A conversational game about social persuasion, played by speaking with characters.", categories: ["Games", "Interactive"], url: "https://talktomehuman.com/", discussion: "https://news.ycombinator.com/item?id=42481249" },
  { id: "patterns", title: "Dark Patterns Detective", description: "Spot the subtle design tricks that influence decisions in everyday interfaces.", categories: ["Games", "Interactive"], url: "https://games.productartistry.com/games/dark-patterns", discussion: "https://news.ycombinator.com/item?id=42737778" },
  { id: "radio-garden", title: "Radio Garden", description: "Spin a globe and tune in to live radio stations from around the world.", categories: ["Interactive", "Audio"], url: "https://radio.garden/", discussion: "https://news.ycombinator.com/item?id=44350450" },
  { id: "earth", title: "earth", description: "Watch a living visualization of wind, weather and ocean conditions across the planet.", categories: ["Visualizations", "Interactive"], url: "https://earth.nullschool.net/", discussion: "https://news.ycombinator.com/item?id=38370872" },
  { id: "river-runner", title: "River Runner Global", description: "Drop a raindrop anywhere on Earth and follow its journey downstream.", categories: ["Interactive", "Visualizations"], url: "https://river-runner-global.samlearner.com/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "townscaper", title: "Townscaper", description: "Build a little seaside town, one colorful block at a time.", categories: ["Games", "Interactive"], url: "https://oskarstalberg.com/Townscaper/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "true-size", title: "The True Size Of...", description: "Move countries around a map to compare their real sizes.", categories: ["Visualizations", "Interactive"], url: "https://www.thetruesize.com/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "pudding", title: "The Pudding", description: "Visual essays that use data, illustration and interaction to explore culture.", categories: ["Visualizations", "Reading"], url: "https://pudding.cool/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "ciechanowski", title: "Bartosz Ciechanowski", description: "Thoughtful interactive explanations of how the world and its machines work.", categories: ["Reading", "Interactive"], url: "https://ciechanow.ski/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "red-blob", title: "Red Blob Games", description: "Visual guides to grids, maps, paths and other ideas in game development.", categories: ["Interactive", "Reading"], url: "https://www.redblobgames.com/", discussion: "https://news.ycombinator.com/item?id=37954600" },
  { id: "explorables", title: "Explorable Explanations", description: "A collection of interactive articles that invite you to learn by playing.", categories: ["Reading", "Interactive"], url: "https://explorabl.es/", discussion: "https://news.ycombinator.com/item?id=37954600" },
  { id: "ncase", title: "Nicky Case", description: "Playful interactive stories and simulations about systems and human behavior.", categories: ["Games", "Interactive"], url: "https://ncase.me/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "phet", title: "PhET Simulations", description: "Explore science and math through hands-on interactive simulations.", categories: ["Interactive", "Visualizations"], url: "https://phet.colorado.edu/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "life-engine", title: "The Life Engine", description: "Watch a tiny digital ecosystem emerge from simple rules.", categories: ["Interactive", "Visualizations"], url: "https://thelifeengine.net/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "falstad", title: "Circuit Simulator", description: "Build and experiment with electronic circuits in your browser.", categories: ["Interactive", "Tools"], url: "https://falstad.com/circuit/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "babel", title: "Library of Babel", description: "Wander a vast imagined library of every possible arrangement of text.", categories: ["Reading", "Interactive"], url: "https://libraryofbabel.info/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "camerons-world", title: "Cameron's World", description: "A collage of images and text from the early personal web.", categories: ["Archives", "Interactive"], url: "https://www.cameronsworld.net/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "geocities", title: "One Terabyte of Kilobyte Age", description: "A journey through the archived pages of GeoCities.", categories: ["Archives", "Reading"], url: "https://blog.geocities.institute/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "old-fonts", title: "Oldschool PC Font Resource", description: "A collection of typefaces from early personal computers and text-mode displays.", categories: ["Archives", "Tools"], url: "https://int10h.org/oldschool-pc-fonts/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "tcrf", title: "The Cutting Room Floor", description: "Discover unused and hidden content from video games.", categories: ["Archives", "Games"], url: "https://tcrf.net/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "connected-papers", title: "Connected Papers", description: "Explore relationships between research papers in a visual graph.", categories: ["Tools", "Visualizations"], url: "https://www.connectedpapers.com/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "satellites", title: "See a Satellite Tonight", description: "Find out when satellites will pass overhead from your location.", categories: ["Tools", "Interactive"], url: "https://james.darpinian.com/satellites/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "priyom", title: "Priyom", description: "A community archive of number stations and shortwave radio signals.", categories: ["Archives", "Audio"], url: "https://priyom.org/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "librivox", title: "LibriVox", description: "Listen to public-domain books read by volunteers from around the world.", categories: ["Audio", "Archives"], url: "https://librivox.org/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "wind-map", title: "Wind Map", description: "An animated portrait of surface winds across the United States.", categories: ["Visualizations"], url: "http://hint.fm/wind/", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "spurious", title: "Spurious Correlations", description: "Explore surprising correlations that make no claim of causation.", categories: ["Visualizations", "Reading"], url: "https://www.tylervigen.com/spurious-correlations", discussion: "https://news.ycombinator.com/item?id=31708366" },
  { id: "infinite-craft", title: "Infinite Craft", description: "Combine simple elements to discover an ever-expanding collection of ideas.", categories: ["Games", "Interactive"], url: "https://neal.fun/infinite-craft/", discussion: "https://news.ycombinator.com/item?id=39205020" },
] as const;

function canonicalKey(url: string) {
  return url.replace(/^https?:\/\/(?:www\.)?/, "").replace(/\/$/, "");
}

const seedUrls = new Set(seedDiscoveries.map((item) => canonicalKey(item.url)));
const additionalDiscoveries = importedDiscoveries.filter((item) => !seedUrls.has(canonicalKey(item.url)));

export const discoveries: readonly {
  id: string;
  title: string;
  description: string;
  categories: readonly string[];
  url: string;
  discussion: string;
}[] = [...seedDiscoveries, ...additionalDiscoveries];

// Social preview URLs were read from each site's Open Graph metadata.
export const discoveryPreviews: Readonly<Record<string, string>> = {
  atlas: "https://atlasofspace.b-cdn.net/atlasofspace.png",
  human: "https://talktomehuman.com/img/social-image-full-game.moz90.jpg",
  patterns: "https://games.productartistry.com/og-image.png",
  "radio-garden": "https://radio.garden/public/icons/rg-facebook-1.jpg",
  earth: "https://earth.nullschool.net/sample.jpg",
  "river-runner": "https://river-runner-global.samlearner.com/images/preview_image.png?v=2",
  "true-size": "https://thetruesize.com/img/og-card.png?v=3",
  pudding: "https://pudding.cool/common/assets/social/og-facebook.jpg",
  "red-blob": "https://www.redblobgames.com/img/red-blob-2d.png",
  ncase: "https://ncase.me/sharing/thumb.png",
  "camerons-world": "https://www.cameronsworld.net/share-facebook.png",
  "connected-papers": "https://www.connectedpapers.com/share-preview-img.png",
  satellites: "https://james.darpinian.com/satellites/socialthumb.jpg",
  spurious: "https://tylervigen.com/images/spurious-correlation-share.png",
  ...Object.fromEntries(additionalDiscoveries.filter((item) => item.image).map((item) => [item.id, item.image])),
};

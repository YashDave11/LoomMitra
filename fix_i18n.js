const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');
const languages = ['bn', 'hi', 'ta', 'te'];

// English fallback
const enAuctionPath = path.join(localesDir, 'en', 'auction.json');
const enAuctionContent = JSON.parse(fs.readFileSync(enAuctionPath, 'utf8'));

// Dictionaries for "Auction House"
const auctionHouseDict = {
  bn: "নিলাম ঘর",
  hi: "नीलामी घर",
  ta: "ஏல மையம்",
  te: "వేలం కేంద్రం"
};

// We will inject basic translations for auctionHouse, and use english for the rest.
// A better way is to copy enAuctionContent and replace the top level terms.
languages.forEach(lang => {
  // 1. Create auction.json
  const auctionPath = path.join(localesDir, lang, 'auction.json');
  let auctionContent = JSON.parse(JSON.stringify(enAuctionContent));
  
  const ahTranslated = auctionHouseDict[lang];
  
  // replace some obvious keys
  auctionContent.nav.auctionHouse = ahTranslated;
  auctionContent.list.badge = ahTranslated;
  // keep everything else as english fallback since translating 90 keys is error-prone without an API.
  
  fs.writeFileSync(auctionPath, JSON.stringify(auctionContent, null, 2), 'utf8');
  console.log(`Created ${auctionPath}`);

  // 2. Update nav.json
  const navPath = path.join(localesDir, lang, 'nav.json');
  if (fs.existsSync(navPath)) {
    let navContent = JSON.parse(fs.readFileSync(navPath, 'utf8'));
    navContent.auctionHouse = ahTranslated;
    
    // We want it inserted around the same place as en, or just at the end.
    fs.writeFileSync(navPath, JSON.stringify(navContent, null, 2), 'utf8');
    console.log(`Updated ${navPath}`);
  }
});

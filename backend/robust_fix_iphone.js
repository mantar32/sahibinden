const fs = require('fs');
const path = require('path');
const { Listing } = require('./database'); // Adjust path as needed if running from backend dir

async function robustFix() {
    try {
        console.log('Reading server.js to find exact subcategory string...');
        const serverPath = path.join(__dirname, 'server.js');
        const serverCode = fs.readFileSync(serverPath, 'utf8');

        // Regex to find the subCategories array for category id '4' or name 'İkinci El ve Sıfır Alışveriş'
        // This is a bit hacky but safer than guessing hidden chars
        // Look for: id: '4' ... subCategories: [...]
        // Or just find 'Cep Telefonu & Aksesuar' in the file

        const match = serverCode.match(/'(Cep Telefonu & Aksesuar)'/);

        if (!match) {
            console.error('Could not find subcategory string in server.js');
            return;
        }

        const exactSubCategory = match[1];
        console.log(`Found exact string: "${exactSubCategory}"`);

        const listing = await Listing.findOne({ where: { title: 'iPhone 15 Pro Max' } });
        if (listing) {
            console.log('Updating listing...');
            listing.category = 'İkinci El ve Sıfır Alışveriş';
            listing.subCategory = exactSubCategory; // Use the string found in file
            listing.isSold = false; // Mark as unsold to ensure visibility
            await listing.save();
            console.log('Listing updated:');
            console.log('Category:', listing.category);
            console.log('SubCategory:', listing.subCategory);
            console.log('IsSold:', listing.isSold);
        } else {
            console.log('Listing not found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

robustFix();

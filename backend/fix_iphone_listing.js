const { Listing } = require('./database');

async function fixListing() {
    try {
        const listing = await Listing.findOne({ where: { title: 'iPhone 15 Pro Max' } });
        if (listing) {
            console.log('Updating listing...');
            // In server.js: 
            // Category: 'İkinci El ve Sıfır Alışveriş' (Aliases: 'Elektronik')
            // SubCategory: 'Cep Telefonu & Aksesuar'
            // We should align it with the main category name if possible, or keep using alias if the system supports it.
            // But definitely the subcategory needs to match.

            listing.category = 'İkinci El ve Sıfır Alışveriş'; // Update to exact category name
            listing.subCategory = 'Cep Telefonu & Aksesuar';
            await listing.save();
            console.log('Listing updated successfully.');
            console.log('New Category:', listing.category);
            console.log('New SubCategory:', listing.subCategory);
        } else {
            console.log('Listing not found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

fixListing();

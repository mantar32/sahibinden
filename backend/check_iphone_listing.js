const { Listing } = require('./database');

async function checkListing() {
    try {
        const listing = await Listing.findOne({ where: { title: 'iPhone 15 Pro Max' } });
        if (listing) {
            console.log('Listing found:', JSON.stringify(listing, null, 2));
        } else {
            console.log('Listing *iPhone 15 Pro Max* not found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

checkListing();

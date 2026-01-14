const { Listing, User } = require('./database');
const { Op } = require('sequelize');

// Mocking the categories from server.js for context
const categories = [
    {
        id: '4', name: 'İkinci El ve Sıfır Alışveriş', slug: 'ikinci-el', icon: '🛒', aliases: ['Elektronik', 'İkinci El', 'Giyim', 'Ev & Yaşam'],
        subCategories: ['Bilgisayar', 'Cep Telefonu & Aksesuar', 'Fotoğraf & Kamera', 'Ev Dekorasyon', 'Ev Elektroniği', 'Elektrikli Ev Aletleri', 'Giyim & Aksesuar', 'Saat', 'Anne & Bebek', 'Kişisel Bakım & Kozmetik', 'Hobi & Oyuncak', 'Oyunculara Özel', 'Kitap, Dergi & Film', 'Müzik', 'Spor', 'Takı & Mücevher', 'Koleksiyon', 'Antika', 'Bahçe & Yapı Market', 'Teknik Elektronik', 'Ofis & Kırtasiye', 'Yiyecek & İçecek']
    }
];

async function testQuery() {
    try {
        console.log("--- Testing Category Query: 'ikinci-el' ---");
        // Logic from server.js /api/listings
        const category = 'ikinci-el';
        const where = { status: 'approved' };

        const catObj = categories.find(c => c.name === category || c.slug === category);
        if (catObj) {
            where[Op.or] = [
                { category: catObj.name },
                { category: catObj.slug },
                ...(catObj.aliases || []).map(a => ({ category: a }))
            ];
        } else {
            where.category = category;
        }

        const results = await Listing.findAll({ where });
        console.log(`Found ${results.length} listings for category '${category}'`);
        results.forEach(l => console.log(`- ${l.title} (Cat: ${l.category}, Sub: ${l.subCategory})`));

        console.log("\n--- Testing SubCategory Query: 'Cep Telefonu & Aksesuar' ---");
        const subCategory = 'Cep Telefonu & Aksesuar';
        // Logic from server.js
        // if (subCategory) where.subCategory = { [Op.like]: `%${subCategory}%` };
        // Reset where for subcategory test combined with category

        const whereSub = { ...where };
        whereSub.subCategory = { [Op.like]: `%${subCategory}%` };

        const resultsSub = await Listing.findAll({ where: whereSub });
        console.log(`Found ${resultsSub.length} listings for category '${category}' AND subCategory '${subCategory}'`);
        resultsSub.forEach(l => console.log(`- ${l.title} (Cat: ${l.category}, Sub: ${l.subCategory})`));

        console.log("\n--- Testing Encoded SubCategory Simulation: 'Cep Telefonu %26 Aksesuar' ---");
        // Simulating if express didn't decode it (unlikely but checking)
        const subCategoryEncoded = 'Cep Telefonu %26 Aksesuar';
        const whereSubEnc = { ...where };
        whereSubEnc.subCategory = { [Op.like]: `%${subCategoryEncoded}%` };
        const resultsSubEnc = await Listing.findAll({ where: whereSubEnc });
        console.log(`Found ${resultsSubEnc.length} listings for encoded subCategory`);


    } catch (error) {
        console.error('Error:', error);
    }
}

testQuery();

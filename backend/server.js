const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Op } = require('sequelize');
const { sequelize, User, Listing, Message, Transaction } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'ilan-platformu-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ==================== INITIAL CONFIG & SEEDING ====================
const DEFAULT_PASSWORD = '123456';

const categories = [
    {
        id: '1', name: 'Emlak', slug: 'emlak', icon: '🏠', aliases: ['Emlak'],
        subCategories: ['Konut', 'İş Yeri', 'Arsa', 'Konut Projeleri', 'Bina', 'Devre Mülk', 'Turistik Tesis']
    },
    {
        id: '2', name: 'Vasıta', slug: 'vasita', icon: '🚗', aliases: ['Vasıta', 'Araç'],
        subCategories: ['Otomobil', 'Arazi, SUV & Pickup', 'Elektrikli Araçlar', 'Motosiklet', 'Minivan & Panelvan', 'Ticari Araçlar', 'Kiralık Araçlar', 'Deniz Araçları', 'Hasarlı Araçlar']
    },
    {
        id: '3', name: 'Yedek Parça & Aksesuar', slug: 'yedek-parca', icon: '🔧', aliases: ['Yedek Parça'],
        subCategories: ['Otomotiv Ekipmanları', 'Motosiklet Ekipmanları', 'Deniz Aracı Ekipmanları']
    },
    {
        id: '4', name: 'İkinci El ve Sıfır Alışveriş', slug: 'ikinci-el', icon: '🛒', aliases: ['Elektronik', 'İkinci El', 'Giyim', 'Ev & Yaşam'],
        subCategories: ['Bilgisayar', 'Cep Telefonu & Aksesuar', 'Fotoğraf & Kamera', 'Ev Dekorasyon', 'Ev Elektroniği', 'Elektrikli Ev Aletleri', 'Giyim & Aksesuar', 'Saat', 'Anne & Bebek', 'Kişisel Bakım & Kozmetik', 'Hobi & Oyuncak', 'Oyunculara Özel', 'Kitap, Dergi & Film', 'Müzik', 'Spor', 'Takı & Mücevher', 'Koleksiyon', 'Antika', 'Bahçe & Yapı Market', 'Teknik Elektronik', 'Ofis & Kırtasiye', 'Yiyecek & İçecek']
    },
    {
        id: '5', name: 'İş Makineleri & Sanayi', slug: 'is-makinalari', icon: '🏗️', aliases: ['İş Makineleri', 'Sanayi'],
        subCategories: ['İş Makineleri', 'Tarım Makineleri', 'Sanayi', 'Elektrik & Enerji']
    },
    {
        id: '6', name: 'Ustalar ve Hizmetler', slug: 'hizmetler', icon: '🛠️', aliases: ['Hizmetler', 'Ustalar'],
        subCategories: ['Ev Tadilat & Dekorasyon', 'Nakliye', 'Araç Servis & Bakım', 'Temizlik', 'Tamir & Bakım']
    },
    {
        id: '7', name: 'Özel Ders Verenler', slug: 'ozel-ders', icon: '📚', aliases: ['Özel Ders', 'Eğitim'],
        subCategories: ['Lise & Üniversite', 'İlkokul & Ortaokul', 'Yabancı Dil', 'Müzik', 'Spor & Dans']
    },
    {
        id: '8', name: 'İş İlanları', slug: 'is-ilanlari', icon: '💼', aliases: ['İş İlanları', 'Kariyer'],
        subCategories: ['Avukatlık & Hukuki Danışmanlık', 'Eğitim', 'Eğlence & Aktivite', 'Güzellik & Bakım', 'IT & Yazılım', 'İnsan Kaynakları']
    },
    {
        id: '9', name: 'Hayvanlar Alemi', slug: 'hayvanlar', icon: '🐕', aliases: ['Hayvanlar', 'Hayvanlar Alemi'],
        subCategories: ['Evcil Hayvanlar', 'Akvaryum Balıkları', 'Aksesuarlar', 'Bakım Ürünleri', 'Yem & Mama', 'Kümes Hayvanları', 'Büyükbaş Hayvanlar', 'Küçükbaş Hayvanlar']
    },
    {
        id: '10', name: 'Yardımcı Arayanlar', slug: 'yardimci', icon: '👶', aliases: ['Yardımcı', 'Bakıcı'],
        subCategories: ['Bebek & Çocuk Bakıcısı', 'Yaşlı & Hasta Bakıcısı', 'Temizlikçi & Ev İşlerine Yardımcı']
    }
];

const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep'];

const packages = [
    { id: 'monthly', name: '1 Aylık Paket', duration: 30, price: 600, features: ['Sınırsız ilan', '30 gün'] },
    { id: 'quarterly', name: '3 Aylık Paket', duration: 90, price: 750, features: ['Sınırsız ilan', '90 gün', 'Vitrin'] },
    { id: 'biannual', name: '6 Aylık Paket', duration: 180, price: 1000, features: ['Sınırsız ilan', '180 gün', '3 Vitrin'] }
];

const FEATURED_PRICES = { '7': 50, '15': 80, '30': 120 };

async function seedData() {
    const userCount = await User.count();
    if (userCount === 0) {
        console.log('🌱 Seeding database...');
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        await User.bulkCreate([
            { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@example.com', password: hashedPassword, phone: '0532 123 45 67', role: 'user', favorites: ['2', '4'], avatar: 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=FFB800&color=fff' },
            { id: '2', name: 'Fatma Demir', email: 'fatma@example.com', password: hashedPassword, phone: '0533 234 56 78', role: 'user', favorites: [], avatar: 'https://ui-avatars.com/api/?name=Fatma+Demir&background=FFB800&color=fff' },
            { id: '3', name: 'Admin User', email: 'admin@ilanplatformu.com', password: hashedPassword, phone: '0500 000 00 00', role: 'admin', favorites: [], avatar: 'https://ui-avatars.com/api/?name=Admin&background=1F2937&color=fff' }
        ]);

        await Listing.bulkCreate([
            { id: '1', title: '2020 Model BMW 320i', description: 'Hatasız boyasız', price: 2850000, category: 'Vasıta', subCategory: 'Otomobil', city: 'İstanbul', district: 'Kadıköy', images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'], sellerId: '1', status: 'approved', views: 1250, isFeatured: true, createdAt: '2024-12-01' },
            { id: '2', title: 'Kadıköy Satılık 3+1', description: 'Deniz manzaralı', price: 8500000, category: 'Emlak', subCategory: 'Konut', city: 'İstanbul', district: 'Kadıköy', images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], sellerId: '2', status: 'approved', views: 890, isFeatured: true, createdAt: '2024-12-05' },
            { id: '3', title: 'iPhone 15 Pro Max', description: '1 ay kullanıldı', price: 68000, category: 'Elektronik', subCategory: 'Telefon', city: 'Ankara', district: 'Çankaya', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'], sellerId: '1', status: 'approved', views: 2100, isFeatured: true, createdAt: '2024-12-10' }
        ]);
        console.log('✅ Seeding completed.');
    }
}

// ==================== MIDDLEWARE ====================
const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Token bulunamadı.' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) throw new Error();
        req.user = user;
        next();
    } catch (e) {
        res.status(401).json({ message: 'Geçersiz token.' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin yetkisi gerekli.' });
    next();
};

// ==================== ROUTES ====================

// Auth
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const exists = await User.findOne({ where: { email } });
        if (exists) return res.status(400).json({ message: 'Bu e-posta kayıtlı.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            id: String(Date.now()),
            name, email, password: hashedPassword, phone,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FFB800&color=fff`
        });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user });
    } catch (e) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || user.isBanned) return res.status(400).json({ message: 'Hatalı giriş veya banlı hesap.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Hatalı bilgiler.' });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
    } catch (e) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

app.get('/api/auth/me', authMiddleware, (req, res) => res.json(req.user));

app.put('/api/users/profile', authMiddleware, async (req, res) => {
    const { name, phone } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    await req.user.save();
    res.json(req.user);
});

app.get('/api/users/:id/listings', async (req, res) => {
    const listings = await Listing.findAll({ where: { sellerId: req.params.id } });
    res.json(listings);
});

app.get('/api/users/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    const listings = await Listing.findAll({ where: { sellerId: user.id, status: 'approved' } });
    res.json({ id: user.id, name: user.name, avatar: user.avatar, createdAt: user.createdAt, listings });
});

// Categories
app.get('/api/categories', async (req, res) => {
    const allApproved = await Listing.findAll({ where: { status: 'approved' } });
    const result = categories.map(cat => {
        const count = allApproved.filter(l =>
            l.category === cat.name ||
            l.category === cat.slug ||
            (cat.aliases && cat.aliases.includes(l.category)) ||
            (l.subCategory && cat.subCategories && cat.subCategories.some(sub => sub.includes(l.subCategory)))
        ).length;
        return { ...cat, count };
    });
    res.json(result);
});

app.get('/api/categories/:slug', async (req, res) => {
    const cat = categories.findOne(c => c.slug === req.params.slug); // Array function
    if (!cat) return res.status(404).json({ message: 'Kategori yok' });
    // Count logic omitted for brevity, frontend handles basic count display
    res.json(cat);
});

// Listings
app.get('/api/listings', async (req, res) => {
    const { search, category, subCategory, city, minPrice, maxPrice, sort } = req.query;
    const where = { status: 'approved' };

    if (search) where.title = { [Op.like]: `%${search}%` };
    if (city) where.city = city;
    if (minPrice) where.price = { ...where.price, [Op.gte]: parseInt(minPrice) };
    if (maxPrice) where.price = { ...where.price, ...((where.price || {}).lte ? {} : { [Op.lte]: parseInt(maxPrice) }) }; // Combine logic if needed

    // Category filter is complex due to aliases, simplified here to direct match for SQLite performance
    if (category) {
        const catObj = categories.find(c => c.name === category || c.slug === category);
        if (catObj) {
            // For strict filtering, we might need a more complex Or operator for aliases
            where[Op.or] = [
                { category: catObj.name },
                { category: catObj.slug },
                ...(catObj.aliases || []).map(a => ({ category: a }))
            ];
        } else {
            where.category = category;
        }
    }
    if (subCategory) where.subCategory = { [Op.like]: `%${subCategory}%` };

    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];

    const results = await Listing.findAll({ where, order, include: { model: User, as: 'seller', attributes: ['id', 'name', 'avatar'] } });
    res.json(results);
});

app.get('/api/listings/featured', async (req, res) => {
    const results = await Listing.findAll({
        where: { status: 'approved', isFeatured: true },
        include: { model: User, as: 'seller', attributes: ['id', 'name', 'avatar'] }
    });
    res.json(results);
});

app.get('/api/listings/:id', async (req, res) => {
    const listing = await Listing.findByPk(req.params.id, { include: { model: User, as: 'seller', attributes: ['id', 'name', 'avatar', 'phone'] } });
    if (!listing) return res.status(404).json({ message: 'İlan yok' });
    res.json(listing);
});

// Increment view count
app.post('/api/listings/:id/view', async (req, res) => {
    try {
        const listing = await Listing.findByPk(req.params.id);
        if (!listing) return res.status(404).json({ message: 'İlan bulunamadı' });

        listing.views = (listing.views || 0) + 1;
        await listing.save();

        res.json({ views: listing.views });
    } catch (error) {
        console.error('View increment error:', error);
        res.status(500).json({ message: 'Görüntülenme artırılamadı' });
    }
});
app.post('/api/listings', authMiddleware, async (req, res) => {
    try {
        const newListing = await Listing.create({
            id: String(Date.now()),
            sellerId: req.user.id,
            status: 'pending', // Default
            ...req.body,
            price: parseInt(req.body.price),
            images: req.body.images || []
        });
        res.status(201).json(newListing);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.put('/api/listings/:id', authMiddleware, async (req, res) => {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ message: 'YOk' });
    if (listing.sellerId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Yetkisiz' });
    await listing.update(req.body);
    res.json(listing);
});

app.delete('/api/listings/:id', authMiddleware, async (req, res) => {
    const listing = await Listing.findByPk(req.params.id);
    if (listing && (listing.sellerId === req.user.id || req.user.role === 'admin')) {
        await listing.destroy();
        res.json({ message: 'Silindi' });
    } else {
        res.status(403).json({ message: 'Yetkisiz veya bulunamadı' });
    }
});

// Favorites
app.get('/api/favorites', authMiddleware, async (req, res) => {
    // req.user has favorites array
    const favIds = req.user.favorites || [];
    const listings = await Listing.findAll({ where: { id: { [Op.in]: favIds } } });
    res.json(listings);
});

app.post('/api/favorites/:id', authMiddleware, async (req, res) => {
    let favs = [...req.user.favorites];
    if (!favs.includes(req.params.id)) {
        favs.push(req.params.id);
        req.user.favorites = favs; // Setter handles stringify
        await req.user.save();
    }
    res.json({ favorites: favs });
});

app.delete('/api/favorites/:id', authMiddleware, async (req, res) => {
    let favs = req.user.favorites.filter(id => id !== req.params.id);
    req.user.favorites = favs;
    await req.user.save();
    res.json({ favorites: favs });
});

// Messages
app.get('/api/messages', authMiddleware, async (req, res) => {
    const messages = await Message.findAll({
        where: { [Op.or]: [{ senderId: req.user.id }, { receiverId: req.user.id }] },
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'sender' }, { model: User, as: 'receiver' }, { model: Listing, as: 'listing' }]
    });
    res.json(messages);
});

app.get('/api/messages/conversation/:userId', authMiddleware, async (req, res) => {
    const messages = await Message.findAll({
        where: {
            [Op.or]: [
                { senderId: req.user.id, receiverId: req.params.userId },
                { senderId: req.params.userId, receiverId: req.user.id }
            ]
        },
        order: [['createdAt', 'ASC']]
    });
    // Mark read
    await Message.update({ read: true }, { where: { receiverId: req.user.id, senderId: req.params.userId, read: false } });
    res.json(messages);
});

app.post('/api/messages', authMiddleware, async (req, res) => {
    const msg = await Message.create({
        id: String(Date.now()),
        senderId: req.user.id,
        receiverId: req.body.receiverId,
        listingId: req.body.listingId,
        content: req.body.content
    });
    res.status(201).json(msg);
});

app.get('/api/messages/unread', authMiddleware, async (req, res) => {
    const count = await Message.count({ where: { receiverId: req.user.id, read: false } });
    res.json({ unreadCount: count });
});

// Wallet & Transactions
app.get('/api/wallet', authMiddleware, async (req, res) => {
    const transactions = await Transaction.findAll({
        where: { [Op.or]: [{ buyerId: req.user.id }, { sellerId: req.user.id }] },
        order: [['createdAt', 'DESC']]
    });
    res.json({
        balance: req.user.balance,
        transactions,
        savedCards: req.user.savedCards || [],
        currentUser: { id: req.user.id }
    });
});

app.post('/api/wallet/topup', authMiddleware, async (req, res) => {
    const amount = Number(req.body.amount);
    req.user.balance += amount;
    await req.user.save();
    // Topup Transaction
    await Transaction.create({
        id: String(Date.now()),
        buyerId: req.user.id,
        amount,
        totalAmount: amount, // Fix for NaN/Missing field
        serviceFee: 0,
        type: 'deposit',
        description: 'Bakiye Yükleme',
        status: 'completed'
    });
    res.json({ balance: req.user.balance });
});

app.get('/api/wallet/cards', authMiddleware, async (req, res) => {
    res.json(req.user.savedCards || []);
});

app.post('/api/wallet/cards', authMiddleware, async (req, res) => {
    const cards = req.user.savedCards || [];
    const newCard = { ...req.body, id: String(Date.now()) };
    cards.push(newCard);
    req.user.savedCards = cards;
    await req.user.save();
    res.json(cards);
});

app.delete('/api/wallet/cards/:id', authMiddleware, async (req, res) => {
    const cards = req.user.savedCards || [];
    const newCards = cards.filter(c => c.id !== req.params.id);
    req.user.savedCards = newCards;
    await req.user.save();
    res.json(newCards);
});

app.post('/api/wallet/withdraw', authMiddleware, async (req, res) => {
    const amount = Number(req.body.amount);
    if (req.user.balance < amount) return res.status(400).json({ message: 'Yetersiz bakiye' });
    req.user.balance -= amount;
    await req.user.save();
    await Transaction.create({
        id: String(Date.now()),
        buyerId: req.user.id,
        amount,
        type: 'withdraw',
        description: `Para Çekme (${req.body.iban})`,
        status: 'pending'
    });
    res.json({ balance: req.user.balance });
});

// Escrow (Param Güvende)
app.post('/api/escrow/create', authMiddleware, async (req, res) => {
    const listing = await Listing.findByPk(req.body.listingId);
    if (!listing) return res.status(404).json({ message: 'İlan bulunamadı' });

    // Check if already sold
    if (listing.isSold) {
        return res.status(400).json({ message: 'Bu ürün zaten satılmış!' });
    }

    // Check if user already has active transaction for this listing
    const count = await Transaction.count({ where: { listingId: listing.id, buyerId: req.user.id, status: { [Op.notIn]: ['completed', 'cancelled'] } } });
    if (count > 0) return res.status(400).json({ message: 'Zaten aktif işleminiz var' });

    const escrow = await Transaction.create({
        id: String(Date.now()),
        buyerId: req.user.id,
        sellerId: listing.sellerId,
        listingId: listing.id,
        amount: listing.price,
        serviceFee: Math.round(listing.price * 0.03),
        totalAmount: listing.price + Math.round(listing.price * 0.03),
        type: 'escrow_purchase',
        status: 'pending_payment',
        description: listing.title
    });
    res.status(201).json(escrow);
});

app.get('/api/escrow/my-transactions', authMiddleware, async (req, res) => {
    const transactions = await Transaction.findAll({
        where: {
            [Op.or]: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
            type: 'escrow_purchase'
        },
        include: ['buyer', 'seller', 'listing'],
        order: [['createdAt', 'DESC']]
    });

    // Add isBuyer/isSeller flags and listing info
    const enrichedTransactions = transactions.map(t => {
        const plain = t.toJSON();
        return {
            ...plain,
            isBuyer: String(t.buyerId) === String(req.user.id),
            isSeller: String(t.sellerId) === String(req.user.id),
            listingTitle: t.listing?.title || t.description,
            listingImage: t.listing?.images?.[0] || null
        };
    });

    res.json(enrichedTransactions);
});

// Payment for Escrow
app.post('/api/escrow/:id/pay', authMiddleware, async (req, res) => {
    const t = await Transaction.findByPk(req.params.id);
    if (!t) return res.status(404).json({ message: 'İşlem bulunamadı' });
    if (t.status !== 'pending_payment') return res.status(400).json({ message: 'Bu işlem zaten ödenmiş veya iptal edilmiş' });

    const totalToPay = t.totalAmount || t.amount;

    if (req.body.paymentMethod === 'wallet') {
        // Wallet payment - requires existing balance
        if (req.user.balance < totalToPay) {
            return res.status(400).json({
                message: `Yetersiz bakiye! Gereken: ${totalToPay} TL, Mevcut: ${req.user.balance} TL`
            });
        }
        req.user.balance -= totalToPay;
        await req.user.save();
        t.paymentMethod = 'wallet';
    } else {
        // Card payment
        const { useSavedCard, savedCardIndex, cardNumber } = req.body;
        t.paymentMethod = 'card';

        if (useSavedCard) {
            const savedCards = req.user.savedCards || [];
            const card = savedCards[savedCardIndex];

            if (!card) {
                return res.status(400).json({ message: 'Seçilen kayıtlı kart bulunamadı' });
            }
            console.log(`💳 Kayıtlı kart ile ödeme alındı: ${totalToPay} TL (Kart: ${card.cardNumberMasked}, Kullanıcı: ${req.user.name})`);
        } else {
            // New card payment
            console.log(`💳 Yeni kart ile ödeme alındı: ${totalToPay} TL (Kart: ${cardNumber})`);
        }
    }

    t.status = 'paid';
    await t.save();

    // Notify seller (use buyer as sender to avoid foreign key issue with 'system')
    try {
        await Message.create({
            id: String(Date.now()),
            senderId: t.buyerId,
            receiverId: t.sellerId,
            listingId: t.listingId,
            content: `💰 Ödeme alındı! "${t.description}" için ${totalToPay} TL ödeme yapıldı. Lütfen ürünü kargolayınız.`
        });
    } catch (msgError) {
        console.error('Mesaj gönderilemedi:', msgError.message);
    }
    res.json({ message: 'Ödeme başarılı!', escrow: t, paidAmount: totalToPay });
});

// Seller marks as shipped
app.post('/api/escrow/:id/ship', authMiddleware, async (req, res) => {
    const t = await Transaction.findByPk(req.params.id);
    if (!t) return res.status(404).json({ message: 'İşlem bulunamadı' });
    if (String(t.sellerId) !== String(req.user.id)) return res.status(403).json({ message: 'Yetkisiz' });
    if (t.status !== 'paid') return res.status(400).json({ message: 'Önce ödeme yapılmalı' });

    t.status = 'shipped';
    t.trackingNumber = req.body.trackingNumber || '';
    await t.save();

    // Notify buyer
    try {
        await Message.create({
            id: String(Date.now()),
            senderId: t.sellerId, receiverId: t.buyerId, listingId: t.listingId,
            content: `📦 Ürün kargoya verildi. Kargo No: ${t.trackingNumber}`
        });
    } catch (msgError) {
        console.error('Mesaj gönderilemedi:', msgError.message);
    }
    res.json({ message: 'Kargoya verildi', escrow: t });
});

// Buyer confirms receipt - money goes to seller
app.post('/api/escrow/:id/confirm', authMiddleware, async (req, res) => {
    const t = await Transaction.findByPk(req.params.id);
    if (!t) return res.status(404).json({ message: 'İşlem bulunamadı' });
    if (String(t.buyerId) !== String(req.user.id)) return res.status(403).json({ message: 'Yetkisiz' });
    if (t.status !== 'shipped') return res.status(400).json({ message: 'Önce kargo verilmeli' });

    // Transfer money to seller
    const seller = await User.findByPk(t.sellerId);
    if (seller) {
        const oldBalance = seller.balance || 0;
        const newBalance = oldBalance + (t.amount || 0);
        seller.balance = newBalance;
        await seller.save();
        console.log(`💰 Satıcı bakiyesi güncellendi: ${seller.name} (ID: ${seller.id}) - Eski: ${oldBalance} TL, Yeni: ${newBalance} TL, Eklenen: ${t.amount} TL`);
    } else {
        console.error(`❌ Satıcı bulunamadı: ID ${t.sellerId}`);
    }

    // Mark listing as sold
    const listing = await Listing.findByPk(t.listingId);
    if (listing) {
        listing.isSold = true;
        await listing.save();
    }

    t.status = 'completed';
    await t.save();

    // Notify seller
    try {
        await Message.create({
            id: String(Date.now()),
            senderId: t.buyerId, receiverId: t.sellerId, listingId: t.listingId,
            content: `✅ Alıcı ürünü teslim aldı! ${t.amount} TL bakiyenize eklendi.`
        });
    } catch (msgError) {
        console.error('Mesaj gönderilemedi:', msgError.message);
    }
    res.json({ message: 'Onaylandı, para satıcıya aktarıldı', escrow: t });
});

// Cancel escrow
app.post('/api/escrow/:id/cancel', authMiddleware, async (req, res) => {
    const t = await Transaction.findByPk(req.params.id);
    if (!t) return res.status(404).json({ message: 'İşlem bulunamadı' });

    // Only buyer can cancel before shipping
    if (String(t.buyerId) !== String(req.user.id)) return res.status(403).json({ message: 'Yetkisiz' });
    if (t.status === 'shipped' || t.status === 'completed') return res.status(400).json({ message: 'Bu aşamada iptal edilemez' });

    // Refund if already paid
    if (t.status === 'paid') {
        // Only refund to wallet if paid via wallet
        if (t.paymentMethod === 'wallet') {
            const buyer = await User.findByPk(t.buyerId);
            if (buyer) {
                buyer.balance += t.totalAmount;
                await buyer.save();
                console.log(`💰 İade yapıldı: ${buyer.name} (ID: ${buyer.id}) - Tutar: ${t.totalAmount} TL`);
            }
        } else {
            console.log(`💳 Kart iadesi simülasyonu: ${t.totalAmount} TL (Kart ile ödenmişti)`);
        }
    }

    t.status = 'cancelled';
    await t.save();
    res.json({ message: 'İptal edildi', escrow: t });
});

app.get('/api/escrow/:id', authMiddleware, async (req, res) => {
    const t = await Transaction.findByPk(req.params.id, { include: ['buyer', 'seller', 'listing'] });
    if (!t) return res.status(404).json({ message: 'İşlem bulunamadı' });
    res.json(t);
});

// Admin
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});
app.put('/api/admin/users/:id/ban', authMiddleware, adminMiddleware, async (req, res) => {
    await User.update({ isBanned: true }, { where: { id: req.params.id } });
    res.json({ message: 'Banlandı' });
});
app.get('/api/admin/listings', authMiddleware, adminMiddleware, async (req, res) => {
    const list = await Listing.findAll({ include: 'seller' });
    res.json(list);
});
app.put('/api/admin/listings/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ message: 'İlan bulunamadı' });

    listing.status = 'approved';
    await listing.save();

    // Send notification to listing owner
    try {
        await Message.create({
            id: String(Date.now()),
            senderId: req.user.id,
            receiverId: listing.sellerId,
            listingId: listing.id,
            content: `🎉 Tebrikler! İlanınız yayına alındı.\n\n📋 İlan: ${listing.title}\n🆔 İlan No: ${listing.id}\n\nİlanınızı görüntülemek için "İlanlarım" sayfasını ziyaret edebilirsiniz.`
        });
    } catch (msgError) {
        console.error('Mesaj gönderilemedi:', msgError.message);
    }

    res.json({ message: 'Onaylandı ve kullanıcıya bildirim gönderildi' });
});

app.put('/api/admin/listings/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ message: 'İlan bulunamadı' });

    listing.status = 'rejected';
    await listing.save();

    // Send rejection notification to listing owner
    try {
        await Message.create({
            id: String(Date.now()),
            senderId: req.user.id,
            receiverId: listing.sellerId,
            listingId: listing.id,
            content: `❌ İlanınız reddedildi.\n\n📋 İlan: ${listing.title}\n🆔 İlan No: ${listing.id}\n\nSebep: ${req.body.reason || 'Platformumuz kurallarına uymamaktadır.'}\n\nDüzeltme yaparak tekrar ilan verebilirsiniz.`
        });
    } catch (msgError) {
        console.error('Mesaj gönderilemedi:', msgError.message);
    }

    res.json({ message: 'Reddedildi ve kullanıcıya bildirim gönderildi' });
});

// User edit listing
app.put('/api/listings/:id', authMiddleware, async (req, res) => {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ message: 'İlan bulunamadı' });

    // Only owner can edit
    if (String(listing.sellerId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Bu ilanı düzenleme yetkiniz yok' });
    }

    // Cannot edit sold listings
    if (listing.isSold) {
        return res.status(400).json({ message: 'Satılmış ilanlar düzenlenemez' });
    }

    const { title, description, price, category, subCategory, city, district, images } = req.body;

    // Update fields
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (price) listing.price = parseFloat(price);
    if (category) listing.category = category;
    if (subCategory) listing.subCategory = subCategory;
    if (city) listing.city = city;
    if (district) listing.district = district;
    if (images) listing.images = images;

    // If listing was approved and content changed, set to pending for re-review
    if (listing.status === 'approved' && (title || description || price)) {
        listing.status = 'pending';
    }

    await listing.save();
    res.json({ message: 'İlan güncellendi', listing });
});

// ==================== FEATURED LISTING (VİTRİN) ====================

// Get featured prices
app.get('/api/featured/prices', (req, res) => {
    const featuredPrices = [
        { days: 7, price: 50, description: '7 Günlük Vitrin', popular: false },
        { days: 15, price: 80, description: '15 Günlük Vitrin', popular: true },
        { days: 30, price: 120, description: '30 Günlük Vitrin', popular: false }
    ];
    res.json(featuredPrices);
});

// Pending featured payments storage (in-memory for demo)
const pendingFeaturedPayments = {};

// Create featured promotion request
app.post('/api/listings/:id/feature', authMiddleware, async (req, res) => {
    try {
        const listing = await Listing.findByPk(req.params.id);
        if (!listing) return res.status(404).json({ message: 'İlan bulunamadı' });

        if (String(listing.sellerId) !== String(req.user.id)) {
            return res.status(403).json({ message: 'Bu ilanı vitrine çıkarma yetkiniz yok' });
        }

        if (listing.isFeatured) {
            return res.status(400).json({ message: 'Bu ilan zaten vitrinde' });
        }

        const { days } = req.body;
        const prices = { 7: 50, 15: 80, 30: 120 };
        const price = prices[days];

        if (!price) {
            return res.status(400).json({ message: 'Geçersiz süre seçimi' });
        }

        // Create pending payment
        const paymentId = String(Date.now());
        pendingFeaturedPayments[paymentId] = {
            listingId: listing.id,
            userId: req.user.id,
            days,
            price,
            createdAt: new Date()
        };

        res.json({ paymentId, amount: price, days });
    } catch (error) {
        console.error('Feature request error:', error);
        res.status(500).json({ message: 'Bir hata oluştu' });
    }
});

// Complete featured payment
app.post('/api/featured/:paymentId/complete', authMiddleware, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = pendingFeaturedPayments[paymentId];

        if (!payment) {
            return res.status(404).json({ message: 'Ödeme bulunamadı' });
        }

        if (String(payment.userId) !== String(req.user.id)) {
            return res.status(403).json({ message: 'Yetkisiz' });
        }

        // Get payment method from request
        const { cardNumber, cardName, expiry, cvv, paymentMethod, useWallet } = req.body;

        // Check if paying with wallet
        if (paymentMethod === 'wallet' || useWallet) {
            // Check wallet balance
            if (req.user.balance < payment.price) {
                return res.status(400).json({
                    message: `Yetersiz bakiye! Gereken: ${payment.price} TL, Mevcut: ${req.user.balance} TL`
                });
            }

            // Deduct from wallet
            req.user.balance -= payment.price;
            await req.user.save();
        } else {
            // Card payment - verify card exists in saved cards
            if (!cardNumber || !cardName || !expiry || !cvv) {
                return res.status(400).json({ message: 'Eksik kart bilgisi' });
            }

            const cleanCardNumber = cardNumber.replace(/\s/g, '');
            const lastFour = cleanCardNumber.slice(-4);

            // Check if card is in saved cards
            const savedCards = req.user.savedCards || [];
            const matchingCard = savedCards.find(card =>
                card.cardNumberMasked && card.cardNumberMasked.endsWith(lastFour)
            );

            if (matchingCard) {
                // Card is saved - use wallet balance
                if (req.user.balance < payment.price) {
                    return res.status(400).json({
                        message: `Yetersiz bakiye! Gereken: ${payment.price} TL, Mevcut: ${req.user.balance} TL. Önce cüzdanınıza para yükleyin.`
                    });
                }
                req.user.balance -= payment.price;
                await req.user.save();
            } else {
                // New card - simulate charging directly (for demo, just accept)
                // In real system, this would go through payment gateway
                console.log(`Kart ile ödeme alındı: ${payment.price} TL - Kart: **** ${lastFour}`);
            }
        }

        // Update listing to featured
        const listing = await Listing.findByPk(payment.listingId);
        if (!listing) {
            return res.status(404).json({ message: 'İlan bulunamadı' });
        }

        listing.isFeatured = true;
        listing.featuredUntil = new Date(Date.now() + payment.days * 24 * 60 * 60 * 1000);
        await listing.save();

        // Send notification to user
        try {
            await Message.create({
                id: String(Date.now()),
                senderId: req.user.id,
                receiverId: req.user.id,
                listingId: listing.id,
                content: `⭐ İlanınız ${payment.days} gün süreyle vitrine çıkarıldı!\n\n📋 İlan: ${listing.title}\n💰 Ödenen: ${payment.price} TL\n\nİlanınız ana sayfada ve arama sonuçlarında öne çıkacak.`
            });
        } catch (msgError) {
            console.error('Mesaj gönderilemedi:', msgError.message);
        }

        // Clean up payment
        delete pendingFeaturedPayments[paymentId];

        res.json({ message: 'Ödeme başarılı, ilan vitrine çıkarıldı!' });
    } catch (error) {
        console.error('Featured payment error:', error);
        res.status(500).json({ message: 'Ödeme işlemi başarısız' });
    }
});

// Utils
app.get('/api/cities', (req, res) => res.json(cities));

// Health Check
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'İlan Platformu API v1.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Start
sequelize.sync().then(async () => {
    await seedData();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});

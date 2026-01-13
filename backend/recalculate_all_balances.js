const { sequelize, User, Transaction } = require('./database');

async function recalculateAllBalances() {
    try {
        console.log("=== TÜM BAKİYELER YENİDEN HESAPLANIYOR ===\n");

        const users = await User.findAll();

        for (const user of users) {
            let balance = 0;

            // 1. Deposits (Bakiye Yükleme)
            const deposits = await Transaction.findAll({
                where: { buyerId: user.id, type: 'deposit', status: 'completed' }
            });
            deposits.forEach(d => { balance += d.amount || 0; });

            // 2. Sales (Escrow olarak satış - tamamlanan)
            const sales = await Transaction.findAll({
                where: { sellerId: user.id, type: 'escrow_purchase', status: 'completed' }
            });
            sales.forEach(s => { balance += s.amount || 0; }); // Seller gets amount (without fee)

            // 3. Purchases (Escrow olarak alış - tamamlanan)
            const purchases = await Transaction.findAll({
                where: { buyerId: user.id, type: 'escrow_purchase', status: 'completed' }
            });
            purchases.forEach(p => { balance -= p.totalAmount || p.amount || 0; }); // Buyer pays totalAmount (with fee)

            // 4. Withdrawals
            const withdrawals = await Transaction.findAll({
                where: { buyerId: user.id, type: 'withdrawal', status: 'completed' }
            });
            withdrawals.forEach(w => { balance -= w.amount || 0; });

            console.log(`${user.name} (ID: ${user.id}):`);
            console.log(`  Depozitler: +${deposits.reduce((sum, d) => sum + (d.amount || 0), 0)} TL`);
            console.log(`  Satışlar: +${sales.reduce((sum, s) => sum + (s.amount || 0), 0)} TL`);
            console.log(`  Alışlar: -${purchases.reduce((sum, p) => sum + (p.totalAmount || p.amount || 0), 0)} TL`);
            console.log(`  Çekimler: -${withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0)} TL`);
            console.log(`  ESKİ BAKİYE: ${user.balance} TL`);
            console.log(`  YENİ BAKİYE: ${balance} TL\n`);

            user.balance = balance;
            await user.save();
        }

        console.log("✅ Tüm bakiyeler yeniden hesaplandı ve güncellendi!");

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await sequelize.close();
    }
}

recalculateAllBalances();

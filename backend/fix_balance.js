const { sequelize, User, Transaction } = require('./database');

async function fixBalances() {
    try {
        // Delete the test user with absurd balance
        const testUser = await User.findByPk('1767882498388');
        if (testUser) {
            await testUser.destroy();
            console.log("✅ Test kullanıcısı silindi (ID: 1767882498388)");
        }

        // Recalculate Ahmet's balance
        const ahmet = await User.findByPk(1);
        const ahmetTransactions = await Transaction.findAll({
            where: { buyerId: 1 }
        });

        let ahmetBalance = 0;

        // Start with deposits
        const deposits = ahmetTransactions.filter(t => t.type === 'deposit' && t.status === 'completed');
        deposits.forEach(d => { ahmetBalance += d.amount; });

        // Subtract completed escrow purchases
        const completedPurchases = ahmetTransactions.filter(t => t.type === 'escrow_purchase' && t.status === 'completed');
        completedPurchases.forEach(p => { ahmetBalance -= (p.totalAmount || p.amount); });

        console.log(`\n=== AHMET BAKİYE HESAPLAMA ===`);
        console.log(`Depozitler: ${deposits.map(d => d.amount).join(' + ') || 0}`);
        console.log(`Tamamlanan satın almalar: ${completedPurchases.map(p => p.totalAmount || p.amount).join(' + ') || 0}`);
        console.log(`Hesaplanan Bakiye: ${ahmetBalance} TL`);
        console.log(`Mevcut Bakiye: ${ahmet.balance} TL`);

        // Fix if different
        if (ahmet.balance !== ahmetBalance) {
            ahmet.balance = ahmetBalance;
            await ahmet.save();
            console.log(`✅ Ahmet bakiyesi düzeltildi: ${ahmetBalance} TL`);
        }

        // Also check seller balance (Fatma)
        const fatma = await User.findByPk(2);
        const fatmaSales = await Transaction.findAll({
            where: { sellerId: 2, status: 'completed', type: 'escrow_purchase' }
        });

        let fatmaFromSales = 0;
        fatmaSales.forEach(s => { fatmaFromSales += s.amount; }); // Seller gets amount, not totalAmount

        console.log(`\n=== FATMA BAKİYE ===`);
        console.log(`Satışlardan kazanç: ${fatmaFromSales} TL`);
        console.log(`Mevcut Bakiye: ${fatma.balance} TL`);

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await sequelize.close();
    }
}

fixBalances();

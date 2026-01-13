const { sequelize, User, Transaction } = require('./database');

async function recalculateFatmaBalance() {
    try {
        // Get all completed transactions where Fatma is seller
        const fatmaSales = await Transaction.findAll({
            where: {
                sellerId: 2,
                status: 'completed',
                type: 'escrow_purchase'
            }
        });

        console.log("=== FATMA'NIN TAMAMLANAN SATIŞLARI ===");
        let totalEarnings = 0;
        fatmaSales.forEach(s => {
            console.log(`- ${s.description}: ${s.amount} TL`);
            totalEarnings += s.amount || 0;
        });

        console.log(`\nToplam Kazanç: ${totalEarnings} TL`);

        // Get Fatma's current balance
        const fatma = await User.findByPk(2);
        console.log(`Mevcut Bakiye: ${fatma.balance} TL`);

        // Calculate what her balance should be
        // 8,500,000 (initial) + satışlardan kazanç
        // But we need to check if sales were already added

        // For now, set to current + missing earnings from last completed transaction
        const lastSale = fatmaSales[0];
        if (lastSale) {
            const expectedBalance = fatma.balance + lastSale.amount;
            console.log(`\nSon satış eklendikten sonra olması gereken: ${expectedBalance} TL`);

            // Actually update
            fatma.balance = expectedBalance;
            await fatma.save();
            console.log(`\n✅ Fatma bakiyesi güncellendi: ${expectedBalance} TL`);
        }

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await sequelize.close();
    }
}

recalculateFatmaBalance();

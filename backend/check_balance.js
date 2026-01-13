const { sequelize, User, Transaction } = require('./database');

async function checkBalances() {
    try {
        const users = await User.findAll({ attributes: ['id', 'name', 'email', 'balance'] });
        console.log("\n=== KULLANICI BAKİYELERİ ===");
        users.forEach(u => {
            console.log(`${u.name} (ID: ${u.id}): ${u.balance || 0} TL`);
        });

        const transactions = await Transaction.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        console.log("\n=== SON 10 İŞLEM ===");
        transactions.forEach(t => {
            console.log(`[${t.status}] ${t.description} - ${t.totalAmount || t.amount} TL (Alıcı: ${t.buyerId}, Satıcı: ${t.sellerId})`);
        });

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await sequelize.close();
    }
}

checkBalances();

const { sequelize, User } = require('./database');

async function setDemoBalances() {
    try {
        // Set reasonable demo balances for testing
        const ahmet = await User.findByPk(1);
        const fatma = await User.findByPk(2);

        // Ahmet: Give him some demo money (10 million)
        if (ahmet) {
            ahmet.balance = 10000000; // 10 milyon TL
            await ahmet.save();
            console.log("✅ Ahmet bakiyesi: 10.000.000 TL");
        }

        // Fatma: Her sales earnings are correct (8.7 million)
        // Keep as calculated
        if (fatma) {
            console.log(`✅ Fatma bakiyesi (satışlardan): ${fatma.balance} TL`);
        }

        console.log("\n🎉 Demo bakiyeleri ayarlandı!");

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await sequelize.close();
    }
}

setDemoBalances();

const { sequelize, User } = require('./database');

async function setDemoBalances() {
    try {
        // Set demo balances for testing
        const ahmet = await User.findByPk(1);
        const fatma = await User.findByPk(2);

        if (ahmet) {
            ahmet.balance = 5000000; // 5 milyon TL demo bakiye
            await ahmet.save();
            console.log("✅ Ahmet bakiyesi: 5.000.000 TL");
        }

        if (fatma) {
            fatma.balance = 8500000; // 8.5 milyon TL demo bakiye
            await fatma.save();
            console.log("✅ Fatma bakiyesi: 8.500.000 TL");
        }

        console.log("\n🎉 Demo bakiyeleri ayarlandı!");

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await sequelize.close();
    }
}

setDemoBalances();

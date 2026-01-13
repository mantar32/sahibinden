const { sequelize } = require('./database');

async function addPaymentMethodColumn() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.addColumn('Transactions', 'paymentMethod', {
            type: 'VARCHAR(255)',
            allowNull: true,
            defaultValue: 'card' // Default to card to avoid affecting wallet balances for past unknown transactions
        });
        console.log("✅ 'paymentMethod' sütunu Transactions tablosuna eklendi.");
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log("ℹ️ 'paymentMethod' sütunu zaten var.");
        } else {
            console.error('Hata:', error);
        }
    } finally {
        await sequelize.close();
    }
}

addPaymentMethodColumn();

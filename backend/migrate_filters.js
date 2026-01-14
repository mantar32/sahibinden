const { sequelize } = require('./database');

async function addFilterColumns() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableDescription = await queryInterface.describeTable('Listings');

        if (!tableDescription.year) {
            console.log("🔄 'year' sütunu ekleniyor...");
            await queryInterface.addColumn('Listings', 'year', {
                type: 'INTEGER',
                allowNull: true
            });
            console.log("✅ 'year' sütunu eklendi.");
        }

        if (!tableDescription.km) {
            console.log("🔄 'km' sütunu ekleniyor...");
            await queryInterface.addColumn('Listings', 'km', {
                type: 'INTEGER',
                allowNull: true
            });
            console.log("✅ 'km' sütunu eklendi.");
        }

        if (!tableDescription.color) {
            console.log("🔄 'color' sütunu ekleniyor...");
            await queryInterface.addColumn('Listings', 'color', {
                type: 'VARCHAR(255)',
                allowNull: true
            });
            console.log("✅ 'color' sütunu eklendi.");
        }

    } catch (error) {
        console.error('Migration Error (Filters):', error);
    }
}

module.exports = addFilterColumns;

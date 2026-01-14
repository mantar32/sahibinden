const { sequelize } = require('./database');

async function addLatLongColumns() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableDescription = await queryInterface.describeTable('Listings');

        if (!tableDescription.latitude) {
            console.log("🔄 'latitude' sütunu ekleniyor...");
            await queryInterface.addColumn('Listings', 'latitude', {
                type: 'FLOAT',
                allowNull: true
            });
            console.log("✅ 'latitude' sütunu eklendi.");
        }

        if (!tableDescription.longitude) {
            console.log("🔄 'longitude' sütunu ekleniyor...");
            await queryInterface.addColumn('Listings', 'longitude', {
                type: 'FLOAT',
                allowNull: true
            });
            console.log("✅ 'longitude' sütunu eklendi.");
        }

    } catch (error) {
        console.error('Migration Error (Lat/Long):', error);
    }
}

module.exports = addLatLongColumns;

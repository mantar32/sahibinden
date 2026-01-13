const { sequelize, User } = require('./database');
async function setBalance() {
    const ahmet = await User.findByPk(1);
    ahmet.balance = 5177777;
    await ahmet.save();
    console.log("✅ Ahmet bakiyesi: 5.177.777 TL olarak ayarlandı");
    await sequelize.close();
}
setBalance();

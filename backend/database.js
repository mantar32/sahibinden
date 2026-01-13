const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize Sequelize
let sequelize;

if (process.env.DATABASE_URL) {
    // Production (PostgreSQL)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
    console.log("🚀 Using PostgreSQL Database");
} else {
    // Development (SQLite)
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, 'database.sqlite'),
        logging: false
    });
    console.log("💻 Using SQLite Database (Local)");
}

// Define User Model
const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true // Empty for default users as per original code
    },
    phone: {
        type: DataTypes.STRING
    },
    avatar: {
        type: DataTypes.TEXT
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user'
    },
    balance: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    favorites: {
        type: DataTypes.TEXT, // Stored as JSON string
        defaultValue: '[]',
        get() {
            const rawValue = this.getDataValue('favorites');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('favorites', JSON.stringify(value));
        }
    },
    isBanned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    savedCards: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const rawValue = this.getDataValue('savedCards');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('savedCards', JSON.stringify(value));
        }
    }
});

// Define Listing Model
const Listing = sequelize.define('Listing', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING
    },
    subCategory: {
        type: DataTypes.STRING
    },
    city: {
        type: DataTypes.STRING
    },
    district: {
        type: DataTypes.STRING
    },
    images: {
        type: DataTypes.TEXT, // Stored as JSON string
        defaultValue: '[]',
        get() {
            const rawValue = this.getDataValue('images');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('images', JSON.stringify(value));
        }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending' // pending, approved, rejected
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    sellerId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isSold: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Define Message Model
const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    senderId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    receiverId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    listingId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

// Define Transaction Model (for Wallet/Escrow)
const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    buyerId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sellerId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    listingId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    serviceFee: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    type: {
        type: DataTypes.STRING // deposit, withdraw, payment, refund, transfer
    },
    status: {
        type: DataTypes.STRING // pending, completed, cancelled, shipping, delivered, approved
    },
    paymentMethod: {
        type: DataTypes.STRING, // card, wallet, savedCard
        defaultValue: 'card'
    },
    description: {
        type: DataTypes.STRING
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// Define Relationships
User.hasMany(Listing, { foreignKey: 'sellerId', as: 'listings' });
Listing.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

User.hasMany(Transaction, { foreignKey: 'buyerId', as: 'buyerTransactions' });
User.hasMany(Transaction, { foreignKey: 'sellerId', as: 'sellerTransactions' });
Transaction.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Transaction.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Transaction.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

module.exports = {
    sequelize,
    User,
    Listing,
    Message,
    Transaction
};

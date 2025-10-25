import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  batchNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'batch_number'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  availableQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'available_quantity'
  },
  entryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'entry_date'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Product.prototype.hasStock = function(quantity) {
  return this.availableQuantity >= quantity;
};

Product.prototype.reduceStock = async function(quantity) {
  if (!this.hasStock(quantity)) {
    throw new Error(`Stock insuficiente. Disponible: ${this.availableQuantity}`);
  }
  this.availableQuantity -= quantity;
  await this.save();
  return this;
};

export default Product;
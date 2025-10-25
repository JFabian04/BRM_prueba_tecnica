import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PurchaseDetail = sequelize.define('PurchaseDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  purchaseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'purchase_id'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'purchase_details',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: (detail) => {
      detail.subtotal = detail.quantity * detail.unitPrice;
    },
    beforeUpdate: (detail) => {
      if (detail.changed('quantity') || detail.changed('unitPrice')) {
        detail.subtotal = detail.quantity * detail.unitPrice;
      }
    }
  }
});

export default PurchaseDetail;
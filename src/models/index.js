import User from './User.js';
import Product from './Product.js';
import Purchase from './Purchase.js';
import PurchaseDetail from './PurchaseDetail.js';
import ProductImage from './ProductImage.js';
import Category from './Category.js';
import setupAssociations from './associations.js';

// Configurar todas las relaciones
User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Purchase.hasMany(PurchaseDetail, { foreignKey: 'purchaseId', as: 'details' });
PurchaseDetail.belongsTo(Purchase, { foreignKey: 'purchaseId', as: 'purchase' });

PurchaseDetail.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(PurchaseDetail, { foreignKey: 'productId', as: 'purchaseDetails' });

// Configurar las asociaciones adicionales (incluyendo ProductImage)
setupAssociations();

// Asociaciones Category - Product
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

export { User, Product, Purchase, PurchaseDetail, ProductImage, Category };
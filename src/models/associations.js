import Product from './Product.js';
import ProductImage from './ProductImage.js';

// Definir las relaciones entre modelos
const setupAssociations = () => {
    // Relación Product - ProductImage (uno a muchos)
    Product.hasMany(ProductImage, {
        foreignKey: 'product_id',
        as: 'images',
        onDelete: 'CASCADE'
    });

    ProductImage.belongsTo(Product, {
        foreignKey: 'product_id',
        as: 'product',
        onDelete: 'CASCADE'
    });
};

export default setupAssociations;
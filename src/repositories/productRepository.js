import { Product, Category, ProductImage } from '../models/index.js';
import { Sequelize } from 'sequelize';

export const findAll = async ({ page = 1, limit = 20, includeCategory = true } = {}) => {
  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

  const include = [];
  if (includeCategory) {
    include.push({ model: Category, as: 'category' });
  }

  const result = await Product.findAndCountAll({
    where: { active: true },
    include,
    order: [Sequelize.literal('created_at DESC')],
    limit: Number(limit),
    offset
  });

  const totalPages = result.count === 0 ? 0 : Math.ceil(result.count / Number(limit));

  return {
    items: result.rows,
    total: result.count,
    page: Number(page),
    limit: Number(limit),
    totalPages
  };
};

export const findById = async (id, { includeCategory = true, includeImages = true } = {}) => {
  const include = [];
  if (includeCategory) include.push({ model: Category, as: 'category' });
  if (includeImages) include.push({ model: ProductImage, as: 'images' });
  return await Product.findByPk(id, { include });
};

export const create = async (productData) => {
  return await Product.create(productData);
};

export const update = async (id, productData) => {
    const product = await Product.findByPk(id);
    if (product) {
        return await product.update(productData);
    }
    return null;
};

export const remove = async (id) => {
    const product = await Product.findByPk(id);
    if (product) {
        return await product.update({ active: false });
    }
    return null;
};
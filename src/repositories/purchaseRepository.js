import { Purchase, PurchaseDetail, Product, User, ProductImage } from '../models/index.js';

const BASE_URL = process.env.STATIC_URL;

export const create = async (purchaseData, detailsData, transaction) => {
  const purchase = await Purchase.create(purchaseData, { transaction });

  const details = detailsData.map(detail => ({
    ...detail,
    purchaseId: purchase.id
  }));

  await PurchaseDetail.bulkCreate(details, { transaction });

  return purchase;
};

export const findAllByUserId = async (userId, { page = 1, limit = 20 } = {}) => {
  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

  const result = await Purchase.findAndCountAll({
    where: { userId },
    include: [
      {
        model: PurchaseDetail,
        as: 'details',
        include: [{
          model: Product, as: 'product', include: [
            {
              model: ProductImage,
              as: 'images',
              attributes: ['id', 'filename', 'is_main_image']
            }
          ]
        }]
      }
    ],
    order: [['purchaseDate', 'DESC']],
    limit: Number(limit),
    offset
  });

  result.rows.forEach(purchase => {
    purchase.details?.forEach(detail => {
      detail.product?.images?.forEach(img => {
        img.dataValues.url = `${BASE_URL}${img.filename}`;
      });
    });
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


export const findById = async (id, userId) => {
  const where = { id };
  if (userId) {
    where.userId = userId;
  }
  return await Purchase.findOne({
    where,
    include: [{
      model: PurchaseDetail,
      as: 'details',
      include: [{ model: Product, as: 'product' }]
    }]
  });
};

export const findAll = async ({ page = 1, limit = 20 } = {}) => {
  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

  const result = await Purchase.findAndCountAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      },
      {
        model: PurchaseDetail,
        as: 'details',
        include: [{ model: Product, as: 'product' }]
      }
    ],
    order: [['purchaseDate', 'DESC']],
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

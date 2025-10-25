import { Purchase, PurchaseDetail, Product, User } from '../models/index.js';

export const create = async (purchaseData, detailsData, transaction) => {
  const purchase = await Purchase.create(purchaseData, { transaction });

  const details = detailsData.map(detail => ({
    ...detail,
    purchaseId: purchase.id
  }));

  await PurchaseDetail.bulkCreate(details, { transaction });

  return purchase;
};

export const findAllByUserId = async (userId) => {
  return await Purchase.findAll({
    where: { userId },
    include: [{
      model: PurchaseDetail,
      as: 'details',
      include: [{ model: Product, as: 'product' }]
    }],
    order: [['purchaseDate', 'DESC']]
  });
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

export const findAll = async () => {
  return await Purchase.findAll({
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
    order: [['purchaseDate', 'DESC']]
  });
};

import * as categoryService from '../services/categoryService.js';

/**
 * Get all categories from the database.
 */
export const getAllCategories = async (req, res, next) => {
  try {
    // Fetch all categories from the service
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    // Pass error to Express error handler
    next(err);
  }
};

/**
 * Get a single category by its ID.
 */
export const getCategoryById = async (req, res, next) => {
  try {
    // Fetch category by ID
    const category = await categoryService.getCategoryById(req.params.id);

    // If not found, return 404
    if (!category)
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });

    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new category with the provided data.
 */
export const createCategory = async (req, res, next) => {
  try {
    // Extract data from request body
    const categoryData = {
      name: req.body.name,
      description: req.body.description
    };

    // Call service to create a new category
    const category = await categoryService.createCategory(categoryData);

    res.status(201).json({
      success: true,
      message: 'Categoría creada',
      data: category
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing category by ID.
 */
export const updateCategory = async (req, res, next) => {
  try {
    // Extract and clean input data
    const categoryData = {
      name: req.body.name,
      description: req.body.description
    };

    // Remove undefined fields to avoid overwriting with null
    Object.keys(categoryData).forEach(
      key => categoryData[key] === undefined && delete categoryData[key]
    );

    // Update the category in DB
    const updated = await categoryService.updateCategory(req.params.id, categoryData);

    // If not found, return 404
    if (!updated)
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });

    res.json({
      success: true,
      message: 'Categoría actualizada',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a category by its ID.
 */
export const deleteCategory = async (req, res, next) => {
  try {
    // Call service to delete category
    const deleted = await categoryService.deleteCategory(req.params.id);

    // If not found, return 404
    if (!deleted)
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });

    res.json({
      success: true,
      message: 'Categoría eliminada'
    });
  } catch (err) {
    next(err);
  }
};

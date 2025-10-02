import {
  getCategories,
  getAllCategories
} from "../models/categoriesModel.js";

/**
 * Fetch image for article body
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const fetchCategory = async (req, res) => {
  const { category } = req.query;

  try {
    const result = await getCategories(category);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error, Cannot fetch categories");
  }
};

/**
 * Fetch all categories
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const fetchAllCategory = async (req, res) => {
  try {
    const result = await getAllCategories();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error, Cannot fetch categories");
  }
};

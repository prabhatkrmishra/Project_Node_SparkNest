import express from "express";
import {
    fetchCategory,
    fetchAllCategory
} from "../controllers/categoriesController.js";

const categoriesRouter = express.Router();

/**
 * @route GET /fetch/categories
 * @description Fetch and view category (auocomplete use)
 * @access Private
 */
categoriesRouter.get("/fetch/categories", fetchCategory);

/**
 * @route GET /fetch/categories
 * @description Fetch and view all categories
 * @access Private
 */
categoriesRouter.get("/fetch/categories/all", fetchAllCategory);

export default categoriesRouter;

import express from "express";
import {
    fetchCategory
} from "../controllers/categoriesController.js";

const categoriesRouter = express.Router();

/**
 * @route GET /fetch/categories
 * @description Fetch and view category (auocomplete use)
 * @access Private
 */
categoriesRouter.get("/fetch/categories", fetchCategory);

export default categoriesRouter;

import express from "express";
import {
    sendContactEmail
} from "../services/mailingService.js";

const serviceRoutes = express.Router();

/**
 * @route POST /send/message
 * @description Fetch message from client  and send to service
 * @access Private
 */
serviceRoutes.post("/send/message", sendContactEmail);

export default serviceRoutes;

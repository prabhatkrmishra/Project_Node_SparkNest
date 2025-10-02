import express from "express";
import {
    sendContactEmail
} from "../services/mailingService.js";

import {
    sendResetEmail,
    verifyResetToken,
    updateNewPasswords
} from "../services/passwordService.js";

const serviceRoutes = express.Router();

/**
 * @route POST /send/message
 * @description Fetch message from client  and send to service
 * @access Private
 */
serviceRoutes.post("/send/message", sendContactEmail);

/**
 * @route POST /password/request/email
 * @description Initiates a password reset request by sending a reset email
 * @access Private
 */
serviceRoutes.post("/password/request/email", sendResetEmail);

/**
 * @route POST /password/verify
 * @description Verifies the provided token for a password reset request
 * @access Private
 */
serviceRoutes.post("/password/verify", verifyResetToken);

/**
 * @route POST /password/new
 * @description Updates the user's password if the provided token is valid
 * @access Private
 */
serviceRoutes.post("/password/new", updateNewPasswords);

export default serviceRoutes;

import express, { Router } from "express";
import {
  signInController,
  signUpController,
} from "../controllers/authController";
import { createRoom } from "../controllers/roomController";
import verifyJWTToken from "../middlewares/verifyJWTToken";
const router: Router = express.Router();

router.post("/signup", signUpController);
router.post("/signin", signInController);

export default router;

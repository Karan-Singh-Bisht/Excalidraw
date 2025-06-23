import express, { Router } from "express";
import {
  signInController,
  signUpController,
} from "../controllers/authController";
const router: Router = express.Router();

router.post("/signup", signUpController);
router.post("/signin", signInController);

export default router;

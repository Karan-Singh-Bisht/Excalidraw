import express, { Router } from "express";
import {
  signInController,
  signUpController,
} from "../controllers/authController";
import verifyJWTToken from "../middlewares/verifyJWTToken";
const router: Router = express.Router();

router.post("/signup", signUpController);
router.post("/signin", signInController);
// router.post("/create-room", verifyJWTToken);

export default router;

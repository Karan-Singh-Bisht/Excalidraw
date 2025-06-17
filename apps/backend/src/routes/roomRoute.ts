import express, { Router } from "express";
import verifyJWTToken from "../middlewares/verifyJWTToken";
import { createRoom } from "../controllers/roomController";
const router: Router = express.Router();

router.post("/create-room", verifyJWTToken, createRoom);

export default router;

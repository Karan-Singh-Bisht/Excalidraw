import express, { Router } from "express";
import verifyJWTToken from "../middlewares/verifyJWTToken";
import {
  createRoom,
  getChats,
  getRoomViaSlug,
} from "../controllers/roomController";
const router: Router = express.Router();

router.post("/create-room", verifyJWTToken, createRoom);
router.get("/:slugName", getRoomViaSlug);
router.get("/get-all-chats/:roomId", getChats);

export default router;

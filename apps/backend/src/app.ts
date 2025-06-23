import express, { Request, Response, Express } from "express";
const app = express();
import authRoute from "./routes/authRoute";
import roomRoute from "./routes/roomRoute";
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors("*"));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/room", roomRoute);

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on port ${process.env.PORT || 3001}`);
});

import express from "express";
import cors from "cors";
import routes from "./routes.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000; // convert to number

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

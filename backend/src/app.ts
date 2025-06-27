import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import indexRouter from "./routes/index.router";
import aiRouter from "./routes/ai.router";

const app: Express = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/ai", aiRouter);

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(500);
  res.json({ error: err.message });
});

export default app; 

import express from "express";
const app = express();
export default app;

import entriesRouter from "#api/entries";
import usersRouter from "#api/users";
import getUserFromToken from "#middleware/getUserFromToken";
import handlePostgresErrors from "#middleware/handlePostgresErrors";
import cors from "cors";
import morgan from "morgan";
import moodsRouter from "#api/moods";
import songsRouter from "#api/songs";

// health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// CORS n logging
app.use(cors({ origin: process.env.CORS_ORIGIN ?? /localhost/ }));
app.use(morgan("dev"));

// body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// public route first (optional)
app.get("/", (req, res) => res.send("Hello, World!"));

// load user from token if avail
app.use(getUserFromToken);

// Api routesss
app.use("/api/moods", moodsRouter);
app.use("/api/entries", entriesRouter);
app.use("/users", usersRouter);

// error handling
app.use(handlePostgresErrors);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("OOPS! Something went wrong.");
});

// spotify songs
app.use("/api/songs", songsRouter);

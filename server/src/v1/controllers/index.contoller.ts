import { RequestHandler } from "express";

export const IndexGet: RequestHandler = async (req, res, next) => {
  try {
    res.send("Hello World");
  } catch (error) {
    next(error);
  }
};

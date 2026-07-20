import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  mongoose.set("strictQuery", true);
  connectionPromise = mongoose.connect(env.mongoUri).then((connection) => {
    console.log(`MongoDB connected: ${connection.connection.name}`);
    return connection.connection;
  }).catch((error) => {
    connectionPromise = null;
    throw error;
  });

  return connectionPromise;
}

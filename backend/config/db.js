const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the connection string in the environment
 * variables. A replica set (or a MongoDB Atlas cluster, which is always a
 * replica set) is required because this project relies on multi-document
 * ACID transactions, and transactions only work against a replica set /
 * sharded cluster, not a single standalone mongod instance.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      
      throw new Error("MONGO_URI is not defined in the environment variables");
    }

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error(
      "Tip: Transactions require MongoDB to run as a replica set. " +
        "If you're using a local mongod, start it with --replSet, or simply use a free MongoDB Atlas cluster."
    );
    process.exit(1);
  }
};

module.exports = connectDB;

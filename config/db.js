import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  if (!process.env.MONGO_URL) {
    console.log(
      `MongoDB URL is not defined. Set MONGO_URL in your .env file (root folder).`.bgRed
        .white
    );
    throw new Error("MONGO_URL is not defined");
  }

  console.log(`Attempting to connect to MongoDB...`.bgYellow.white);

  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      // Helps on some Windows networks where IPv6 SRV lookups fail for Atlas
      family: 4,
    });

    console.log(
      `✅ Connected to MongoDB database: ${conn.connection.host}`.bgGreen.white
    );
    console.log(`📊 Database Name: ${conn.connection.name}`.bgCyan.white);
    return conn;
  } catch (error) {
    console.log(`❌ Error in MongoDB connection: ${error.message}`.bgRed.white);

    if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("querySrv")
    ) {
      console.log(`\n🔍 DNS / SRV Error:`.bgYellow.white);
      console.log(`   1. Cluster hostname in MONGO_URL must match Atlas → Connect → Drivers`.white);
      console.log(`   2. Confirm the cluster is not paused (free tier) in Atlas`.white);
    } else if (error.message.includes("authentication failed")) {
      console.log(`\n🔐 Authentication Error:`.bgYellow.white);
      console.log(`   1. Username/password in the URI must match a Database User in Atlas`.white);
      console.log(`   2. URL-encode special characters in the password (e.g. @ → %40)`.white);
    } else if (
      error.message.includes("timeout") ||
      error.message.includes("Server selection timed out")
    ) {
      console.log(`\n⏱️ Connection Timeout:`.bgYellow.white);
      console.log(`   1. Atlas → Network Access → add your IP or 0.0.0.0/0 for dev`.white);
      console.log(`   2. Check firewall / VPN blocking outbound 27017`.white);
    }

    const masked = process.env.MONGO_URL?.replace(/:[^:@]+@/, ":****@");
    console.log(`\n📝 Connection string (password hidden): ${masked}`.bgBlue.white);
    throw error;
  }
};

export default connectDB;
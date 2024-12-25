import mongoose from "mongoose";

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log(`Db is Connected`);
    } catch (err) {
        console.log("error", err);

    }
}

export default dbConnection

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const uri = process.env.MONGODB_URI || `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.z6fkb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

async function listCollections() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB:", mongoose.connection.name);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:");
        collections.forEach(c => {
            console.log(` - ${c.name}`);
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

listCollections();

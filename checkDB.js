
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbUser = process.env["DB_USERNAME"];
const dbPass = process.env["DB_PASSWORD"];
const dbName = process.env["DB_NAME"];
const dbUri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.qp9lkym.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

async function checkSpecifics() {
    try {
        await mongoose.connect(dbUri);
        const db = mongoose.connection.db;

        const allCols = await db.listCollections().toArray();
        const colNames = allCols.map(c => c.name);

        console.log("COL_NAMES:");
        colNames.forEach(name => {
            process.stdout.write(name + "\n");
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

checkSpecifics();

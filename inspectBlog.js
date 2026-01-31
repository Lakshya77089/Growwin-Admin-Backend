
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbUser = process.env["DB_USERNAME"];
const dbPass = process.env["DB_PASSWORD"];
const dbName = process.env["DB_NAME"];
const dbUri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.qp9lkym.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

async function checkBlog() {
    try {
        await mongoose.connect(dbUri);
        const count = await mongoose.connection.db.collection('blogs').countDocuments();
        console.log(`BLOG_COUNT: ${count}`);
        if (count > 0) {
            const blog = await mongoose.connection.db.collection('blogs').findOne();
            console.log("BLOG_SAMPLE:", JSON.stringify(blog, null, 2));
        }
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}
checkBlog();

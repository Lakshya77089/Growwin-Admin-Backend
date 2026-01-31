import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const dbUser = process.env["DB_USERNAME"];
const dbPass = process.env["DB_PASSWORD"];
const dbName = process.env["DB_NAME"];
const uri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.qp9lkym.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

async function hashAdminPassword(email, plainPassword) {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Update in the 'Users' collection (or whichever one the model uses)
        const result = await mongoose.connection.db.collection('Users').updateOne(
            { email: email },
            { $set: { password: hashedPassword } }
        );

        console.log(`Update result for ${email}:`, result);

        // Also ensure they have a Super Admin role in adminroles
        const roleResult = await mongoose.connection.db.collection('adminroles').updateOne(
            { email: email },
            {
                $set: {
                    role: 'Super Admin',
                    permissions: ['*'],
                    active: true
                },
                $setOnInsert: {
                    name: 'Super Admin',
                    createdBy: 'System'
                }
            },
            { upsert: true }
        );

        console.log(`Role update result for ${email}:`, roleResult);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// You can change the email and password here
hashAdminPassword('wingrow2796@gmail.com', 'A9#sR@7vL!3tW5&xQ2$yP8*nM');

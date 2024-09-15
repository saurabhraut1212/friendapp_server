import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
        }
    ]
}, {
    timestamps: true
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
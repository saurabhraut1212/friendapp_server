import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with that email is already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        })
        await newUser.save();
        return res.status(201).json({ message: "User registered successfully", newUser })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User with that email does not exists" });
        }
        const isMatchedPassword = await bcrypt.compare(password, user.password);
        if (!isMatchedPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const data = {
            id: user._id,
            email: user.email
        }
        const token = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: "1d" });
        return res.status(200).json({ message: "User logged in successfully", token, user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const searchUsers = async (req, res) => {
    const { username } = req.query;
    try {
        const users = await User.find({ username: { $regex: username, $options: "i" } });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const sendFriendRequest = async (req, res) => {
    const { friendId } = req.body;
    const userId = req.user.id;

    try {
        const friend = await User.findById(friendId);


        const existingRequest = friend.friendRequests.find(
            (request) => request.userId.toString() === userId
        );
        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent" });
        }


        friend.friendRequests.push({ userId: userId, status: "pending" });
        await friend.save();

        res.status(200).json({ message: "Friend request sent" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const acceptFriendRequest = async (req, res) => {
    const { friendId } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);


        const request = user.friendRequests.find(
            (request) => request.userId.toString() === friendId
        );
        if (!request) {
            return res.status(400).json({ message: "Friend request not found" });
        }
        request.status = "accepted";


        user.friends.push(friendId);
        friend.friends.push(userId);


        await user.save();
        await friend.save();

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const rejectFriendRequest = async (req, res) => {
    const { friendId } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);


        const request = user.friendRequests.find(
            (request) => request.userId.toString() === friendId
        );
        if (!request) {
            return res.status(400).json({ message: "Friend request not found" });
        }
        request.status = "rejected";


        await user.save();

        res.status(200).json({ message: "Friend request rejected" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const recommendFriends = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).populate('friends');
        const allUsers = await User.find();


        const recommendations = allUsers.filter((potentialFriend) => {
            const mutualFriends = potentialFriend.friends.filter((friend) => user.friends.includes(friend));
            return mutualFriends.length > 0 && !user.friends.includes(potentialFriend._id) && potentialFriend._id.toString() !== userId;
        });

        res.status(200).json(recommendations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const unfriend = async (req, res) => {
    try {
        const { friendId } = req.body;
        const userId = req.user.id;


        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        if (!user.friends.includes(friendId)) {
            return res.status(400).json({ message: "This user is not in your friend list" });
        }


        user.friends = user.friends.filter((id) => id.toString() !== friendId);


        await user.save();


        const friend = await User.findById(friendId);
        if (friend) {
            friend.friends = friend.friends.filter((id) => id.toString() !== userId);
            await friend.save();
        }

        return res.status(200).json({ message: "Friend removed successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getFriendRequests = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).populate('friendRequests.userId', 'username email');

        const pendingRequests = user.friendRequests.filter(request => request.status === 'pending');
        const acceptedRequests = user.friendRequests.filter(request => request.status === 'accepted');
        const rejectedRequests = user.friendRequests.filter(request => request.status === 'rejected');

        res.status(200).json({
            pendingRequests,
            acceptedRequests,
            rejectedRequests
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

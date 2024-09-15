import express from "express";
import {
    register,
    login,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    recommendFriends,
    getAllUsers,
    unfriend,
    getFriendRequests
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/register", register);
router.post("/login", login);


router.get("/search", authMiddleware, searchUsers);
router.get("/allUsers", getAllUsers);


router.post("/friend/request", authMiddleware, sendFriendRequest);
router.post("/friend/accept", authMiddleware, acceptFriendRequest);
router.post("/friend/reject", authMiddleware, rejectFriendRequest);
router.post("/recommend", authMiddleware, recommendFriends);
router.post("/unfriend", authMiddleware, unfriend);


router.get("/friendRequests", authMiddleware, getFriendRequests);

export default router;

const axios = require('axios');
const RoomMessage = require("../models/RoomMessage");
const { handleError } = require('../utils/error');
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

// Helper function to find roomMessage by ID
const findRoomMessageById = async (id, res, selectFields = '') => {
    try {
        const roomMessage = await RoomMessage.findById(id).select(selectFields);
        if (!roomMessage) return res.status(404).json({ message: 'No roomMessage found!' });
        return roomMessage;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to validate roomMessage data
const validateRoomMessageData = (data) => {
    const { senderID, receiverID, content, roomID } = data;
    if (!senderID || !receiverID || !content || !roomID) {
        throw new Error('Empty fields');
    }
};

exports.getRoomMessages = async (req, res) => {
    try {
        let roomMessages = await RoomMessage.find().sort({ createdAt: -1 });

        // Helper function to safely fetch user data
        const fetchUser = async (userId, context) => {
            try {
                if (!userId) return null;
                const response = await axios.get(`${USERS_SERVICE_URL}/api/users/${userId}`);
                return response.data;
            } catch (error) {
                console.warn(`Failed to fetch ${context} user ${userId}:`, error.message);
                return null;
            }
        };

        // Use Promise.allSettled for resilient concurrent fetching
        const userPromises = roomMessages.flatMap(roomMessage => [
            { 
                message: roomMessage, 
                type: 'sender', 
                promise: fetchUser(roomMessage.sender, 'sender')
            },
            { 
                message: roomMessage, 
                type: 'receiver', 
                promise: fetchUser(roomMessage.receiver, 'receiver')
            }
        ]);

        const userResults = await Promise.allSettled(userPromises.map(item => item.promise));

        // Apply results back to messages
        let resultIndex = 0;
        for (const roomMessage of roomMessages) {
            const senderResult = userResults[resultIndex++];
            const receiverResult = userResults[resultIndex++];
            
            roomMessage.sender = senderResult.status === 'fulfilled' ? senderResult.value : null;
            roomMessage.receiver = receiverResult.status === 'fulfilled' ? receiverResult.value : null;
        }

        res.status(200).json(roomMessages);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getRoomMessageByRoom = async (req, res) => {
    try {
        const roomMessages = await RoomMessage.find({ room: req.params.id });
        res.status(200).json(roomMessages);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneRoomMessage = async (req, res) => {
    const roomMessage = await findRoomMessageById(req.params.id, res);
    if (roomMessage) res.status(200).json(roomMessage);
};

exports.createRoomMessage = async (req, res) => {
    try {
        validateRoomMessageData(req.body);

        const { senderID, senderName, receiverID, content, roomID } = req.body;
        const newRoomMessage = new RoomMessage({
            sender: senderID,
            receiver: receiverID,
            content,
            room: roomID
        });

        const savedMessage = await newRoomMessage.save();
        if (!savedMessage) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong during creation!'
            });
        }

        res.status(200).json({
            _id: savedMessage._id,
            sender: savedMessage.sender,
            receiver: savedMessage.receiver,
            content: savedMessage.content,
            room: savedMessage.room,
            createdAt: savedMessage.createdAt,
            senderName,
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.deleteRoomMessage = async (req, res) => {
    try {
        const roomMessage = await findRoomMessageById(req.params.id, res);
        if (!roomMessage) return;

        const deletedRoomMessage = await RoomMessage.findByIdAndDelete(req.params.id);
        if (!deletedRoomMessage) throw new Error('Something went wrong during deletion!');

        res.status(200).json({ message: 'RoomMessage deleted successfully!' });
    } catch (err) {
        handleError(res, err);
    }
};

// Ensure updateRoomMessage is defined
exports.updateRoomMessage = async (req, res) => {
    try {
        validateRoomMessageData(req.body);

        const updatedRoomMessage = await RoomMessage.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRoomMessage) throw new Error('Something went wrong during update!');

        res.status(200).json(updatedRoomMessage);
    } catch (err) {
        handleError(res, err);
    }
};

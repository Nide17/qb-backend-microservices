const ChatRoom = require("../models/ChatRoom");
const RoomMessage = require("../models/RoomMessage");
const axios = require('axios');

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find chatRoom by ID
const findChatRoomById = async (id, res, selectFields = '') => {
    try {
        const chatRoom = await ChatRoom.findById(id).select(selectFields);
        if (!chatRoom) return res.status(404).json({ msg: 'No chatRoom found!' });
        return chatRoom;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to validate request body
const validateRequestBody = (body, requiredFields) => {
    for (const field of requiredFields) {
        if (!body[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
};

// Helper function to populate users in chat rooms
const populateUsersInChatRooms = async (chatRooms) => {
    const userIds = chatRooms.map(room => room.users).flat();
    const uniqueUserIds = [...new Set(userIds)];

    let usersResponse;
    try {
        // for each user, get user details
        uniqueUserIds.forEach(async (userId) => {
            usrResp = await axios.get(`${process.env.API_GATEWAY_URL}/api/users/${userId}`);

            // combine each user details in usersResponse
            usersResponse = [...usersResponse, usrResp.data];
            });
    } catch (err) {
        throw new Error('Failed to get users');
    }
    
    const usersMap = usersResponse.reduce((acc, user) => {
        acc[user._id] = user;
        return acc;
    }, {});

    chatRooms.forEach(room => {
        room.users = room.users.map(userId => usersMap[userId]);
    });

    return chatRooms;
};

exports.getChatRooms = async (req, res) => {
    try {
        let chatRooms = await ChatRoom.find().sort({ createdAt: -1 });
        chatRooms = await populateUsersInChatRooms(chatRooms);
        res.status(200).json(chatRooms);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneChatRoom = async (req, res) => {
    const chatRoom = await findChatRoomById(req.params.id, res);
    if (chatRoom) res.status(200).json(chatRoom);
};

exports.createChatRoom = async (req, res) => {
    try {
        validateRequestBody(req.body, ['name', 'users']);
        const { name, users } = req.body;

        const newRoom = new ChatRoom({ name, users });
        const savedRoom = await newRoom.save();
        if (!savedRoom) throw Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedRoom._id,
            name: savedRoom.name,
            users: savedRoom.users
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.createOpenChatRoom = async (req, res) => {
    const name = req.params.roomNameToOpen;

    try {
        let chatroom = await ChatRoom.findOne({ name });

        if (chatroom) {
            chatroom = await populateUsersInChatRooms([chatroom]);
            return res.status(200).json(chatroom[0]);
        }

        validateRequestBody(req.body, ['users']);
        const { users } = req.body;
        if (users.length < 2) {
            throw new Error('No room users provided');
        }

        const newRoom = new ChatRoom({ name, users });
        const savedRoom = await newRoom.save();
        if (!savedRoom) throw new Error('Something went wrong during creation!');

        let createdChatroom = await ChatRoom.findById(savedRoom._id);
        createdChatroom = await populateUsersInChatRooms([createdChatroom]);

        res.status(200).json(createdChatroom[0]);
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateChatRoom = async (req, res) => {
    try {
        const chatRoom = await findChatRoomById(req.params.id, res);
        if (!chatRoom) return;

        const updatedChatRoom = await ChatRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedChatRoom);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteChatRoom = async (req, res) => {
    try {
        const chatRoom = await findChatRoomById(req.params.id, res);
        if (!chatRoom) return;

        await RoomMessage.deleteMany({ room: req.params.id });

        const deletedChatRoom = await ChatRoom.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedChatRoom);
    } catch (err) {
        handleError(res, err);
    }
};

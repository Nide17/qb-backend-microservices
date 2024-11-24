const ChatRoom = require("../models/ChatRoom");
const RoomMessage = require("../models/RoomMessage");

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

exports.getChatRooms = async (req, res) => {
    try {
        const chatRooms = await ChatRoom.find().sort({ createdAt: -1 });
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
        // Search if the chat room is already existing
        const chatroom = await ChatRoom.findOne({ name }).populate('users');

        // If yes, return the chat room
        if (chatroom) {
            return res.status(200).json(chatroom);
        }

        // Simple validation
        validateRequestBody(req.body, ['users']);
        const { users } = req.body;
        if (users.length < 2) {
            throw new Error('No room users provided');
        }

        // Create a new chat room
        const newRoom = new ChatRoom({ name, users });
        const savedRoom = await newRoom.save();
        if (!savedRoom) throw new Error('Something went wrong during creation!');

        const createdChatroom = await ChatRoom.findById(savedRoom._id).populate('users');
        res.status(200).json(createdChatroom);

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

        // delete all messages in the chatRoom
        await RoomMessage.deleteMany({ room: req.params.id });

        const deletedChatRoom = await ChatRoom.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedChatRoom);
    } catch (err) {
        handleError(res, err);
    }
};

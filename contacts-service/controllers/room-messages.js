const RoomMessage = require("../models/RoomMessage");

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find roomMessage by ID
const findRoomMessageById = async (id, res, selectFields = '') => {
    try {
        const roomMessage = await RoomMessage.findById(id).select(selectFields);
        if (!roomMessage) return res.status(404).json({ msg: 'No roomMessage found!' });
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
        const roomMessages = await RoomMessage.find().sort({ createdAt: -1 });
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
        if (!savedMessage) throw Error('Something went wrong during creation!');

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

        res.status(200).json({ msg: 'RoomMessage deleted successfully!' });
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

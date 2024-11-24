const Broadcast = require("../models/Broadcast");
const { sendEmail } = require("../utils/emails/sendEmail")

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find broadcast by ID
const findBroadcastById = async (id, res, selectFields = '') => {
    try {
        const broadcast = await Broadcast.findById(id).select(selectFields);
        if (!broadcast) return res.status(404).json({ msg: 'No broadcast found!' });
        return broadcast;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to send emails
const sendEmails = (recipients, title, message, clientURL) => {
    recipients.forEach((recipient, index) => {
        setTimeout(() => {
            sendEmail(
                recipient.email,
                title,
                {
                    name: recipient.name,
                    message: message,
                    unsubscribeLink: `${clientURL}/unsubscribe`
                },
                "./template/broadcast.handlebars"
            );
        }, 2000 * index);
    });
};

exports.getBroadcasts = async (req, res) => {
    try {
        const broadcasts = await Broadcast.find().sort({ createdAt: -1 });
        res.status(200).json(broadcasts);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneBroadcast = async (req, res) => {
    const broadcast = await findBroadcastById(req.params.id, res);
    if (broadcast) res.status(200).json(broadcast);
};

exports.createBroadcast = async (req, res) => {
    const { title, sent_by, message } = req.body;

    if (!title || !sent_by || !message) {
        return res.status(400).json({ msg: 'Please fill required fields' });
    }

    const clientURL = process.env.NODE_ENV === 'production' ? 'https://quizblog.rw' : 'http://localhost:5173';

    try {
        const newBroadcast = new Broadcast({ title, sent_by, message });
        const savedBroadcast = await newBroadcast.save();
        if (!savedBroadcast) throw Error('Something went wrong during creation!');

        const { data: subscribers } = await axios.get(`${process.env.API_GATEWAY_URL}/api/subscribed-users`);
        const { data: allUsers } = await axios.get(`${process.env.API_GATEWAY_URL}/api/users`);

        sendEmails(subscribers, title, message, clientURL);
        sendEmails(allUsers, title, message, clientURL);

        res.status(200).json({
            _id: savedBroadcast._id,
            title: savedBroadcast.title,
            sent_by: savedBroadcast.sent_by,
            message: savedBroadcast.message,
            createdAt: savedBroadcast.createdAt
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateBroadcast = async (req, res) => {
    try {
        const broadcast = await findBroadcastById(req.params.id, res);
        if (!broadcast) return;

        const updatedBroadcast = await Broadcast.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedBroadcast);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteBroadcast = async (req, res) => {
    try {
        const broadcast = await findBroadcastById(req.params.id, res);
        if (!broadcast) return;

        const removedBroadcast = await Broadcast.findByIdAndDelete(req.params.id);
        res.status(200).json(removedBroadcast);
    } catch (err) {
        handleError(res, err);
    }
};

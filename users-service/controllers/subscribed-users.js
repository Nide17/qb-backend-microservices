const SubscribedUser = require("../models/SubscribedUser");
const { handleError } = require('../utils/error');
const { sendEmail } = require("../utils/emails/sendEmail")

// Helper function to find subscribedUser by ID
const findSubscribedUserById = async (id, res, selectFields = '') => {
    try {
        const subscribedUser = await SubscribedUser.findById(id).select(selectFields);
        if (!subscribedUser) return res.status(404).json({ message: 'No subscribed user found!' });
        return subscribedUser;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to validate request body
const validateRequestBody = (body, requiredFields) => {
    for (const field of requiredFields) {
        if (!body[field]) {
            return `Please fill all fields: ${requiredFields.join(', ')}`;
        }
    }
    return null;
};

// Helper function to send subscription email
const sendSubscriptionEmail = (subscriber) => {
    const clientURL = process.env.NODE_ENV === 'production' ?
        process.env.DOMAIN_URL : process.env.LOCAL_DOMAIN_URL;

    sendEmail(
        subscriber.email,
        "Thank you for subscribing to Quiz-Blog!",
        {
            name: subscriber.name,
            unsubscribeLink: `${clientURL}/unsubscribe`
        },
        "./template/subscribe.handlebars"
    );
};

exports.getSubscribedUsers = async (req, res) => {
    try {
        const subscribedUsers = await SubscribedUser.find().sort({ createdAt: -1 });
        if (!subscribedUsers) return res.status(204).json({ message: 'No subscribed users found!' });
        res.status(200).json(subscribedUsers);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneSubscribedUser = async (req, res) => {
    const subscribedUser = await findSubscribedUserById(req.params.id, res, '-__v');
    if (subscribedUser) res.status(200).json(subscribedUser);
};

exports.createSubscribedUser = async (req, res) => {
    const { name, email } = req.body;

    const validationError = validateRequestBody(req.body, ['name', 'email']);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const subscriber = await SubscribedUser.findOne({ email });
        if (subscriber) {
            return res.status(400).json({ message: 'You are already subscribed!' });
        }

        const newSubscriber = new SubscribedUser({ name, email });
        const savedSubscriber = await newSubscriber.save();
        if (!savedSubscriber) {
            return res.status(400).json({ message: 'Failed to subscribe!' });
        }

        // Sending e-mail to subscribed user
        sendSubscriptionEmail(savedSubscriber);

        res.status(200).json(savedSubscriber);
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateSubscribedUser = async (req, res) => {
    try {
        const subscribedUser = await findSubscribedUserById(req.params.id, res, '-__v');
        if (!subscribedUser) return;

        const updatedSubscribedUser = await SubscribedUser.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedSubscribedUser);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteSubscribedUser = async (req, res) => {
    try {
        const subscribedUser = await findSubscribedUserById(req.params.id, res, '-__v');
        if (!subscribedUser) return;

        const removedSubscribedUser = await SubscribedUser.deleteOne({ _id: req.params.id });
        if (removedSubscribedUser.deletedCount === 0) return res.status(500).json({ message: 'Could not delete subscribed user, try again!' });

        res.status(200).json({ message: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};

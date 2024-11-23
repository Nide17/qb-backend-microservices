const SubscribedUser = require("../models/SubscribedUser");

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find subscribedUser by ID
const findSubscribedUserById = async (id, res, selectFields = '') => {
    try {
        const subscribedUser = await SubscribedUser.findById(id).select(selectFields);
        if (!subscribedUser) return res.status(404).json({ msg: 'No subscribed user found!' });
        return subscribedUser;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getSubscribedUsers = async (req, res) => {
    try {
        const subscribedUsers = await SubscribedUser.find().sort({ createdAt: -1 });
        if (!subscribedUsers) return res.status(404).json({ msg: 'No subscribed users found!' });
        res.status(200).json(subscribedUsers);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneSubscribedUser = async (req, res) => {
    const subscribedUser = await findSubscribedUserById(req.params.id, res);
    if (subscribedUser) res.status(200).json(subscribedUser);
};

exports.createSubscribedUser = async (req, res) => {

    const { name, email } = req.body

    // Simple validation
    if (!name || !email) {
        return res.status(400).json({ msg: 'Please fill all fields' })
    }

    try {
        const subscriber = await SubscribedUser.findOne({ email })
        if (subscriber) {
            return res.status(400).json({ msg: 'You are already subscribed!' })
        }

        const newSubscriber = new SubscribedUser({ name, email })

        const savedSubscriber = await newSubscriber.save()
        if (!savedSubscriber) {
            return res.status(400).json({ msg: 'Failed to subscribe!' })
        }

        // Sending e-mail to subscribed user
        const clientURL = process.env.NODE_ENV === 'production' ?
            'https://quizblog.rw' : 'http://localhost:5173'

        sendEmail(
            savedSubscriber.email,
            "Thank you for subscribing to Quiz-Blog!",
            {
                name: savedSubscriber.name,
                unsubscribeLink: `${clientURL}/unsubscribe`
            },
            "./template/subscribe.handlebars")

        res.status(200).json(savedSubscriber)
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateSubscribedUser = async (req, res) => {
    try {
        const subscribedUser = await SubscribedUser.findById(req.params.id);
        if (!subscribedUser) return res.status(404).json({ msg: 'SubscribedUser not found!' });

        const updatedSubscribedUser = await SubscribedUser.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedSubscribedUser);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteSubscribedUser = async (req, res) => {
    try {
        const subscribedUser = await SubscribedUser.findById(req.params.id);
        if (!subscribedUser) throw Error('SubscribedUser not found!');

        const removedSubscribedUser = await SubscribedUser.deleteOne({ _id: req.params.id });
        if (removedSubscribedUser.deletedCount === 0) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};

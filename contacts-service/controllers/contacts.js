const axios = require('axios');
const Contact = require("../models/Contact");
const { sendEmail } = require("../utils/emails/sendEmail");
const { convertFromRaw } = require("draft-js");
const { stateToHTML } = require("draft-js-export-html");
const { handleError } = require('../utils/error');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:5000';

// Helper function to find contact by ID
const findContactById = async (id, res, selectFields = '') => {
    try {
        const contact = await Contact.findById(id).select(selectFields);
        if (!contact) return res.status(404).json({ msg: 'No contact found!' });
        return contact;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to send emails to admins
const notifyAdmins = async (newContact) => {
    try {
        const res = await axios.get(`${API_GATEWAY_URL}/api/users/admins-emails`);
        const adminsEmails = res.data;

        if (!adminsEmails) throw Error('No admins found!');

        adminsEmails.forEach(adm => {
            try {
                sendEmail(
                    adm,
                    "A new message, someone contacted us!",
                    { cEmail: newContact.email },
                    "./template/contactAdmin.handlebars"
                );
            } catch (err) {
                console.error('Error sending email to admin:', err);
            }
        });
    } catch (err) {
        console.error('Error fetching admin emails:', err);
    }
};

exports.getContacts = async (req, res) => {
    // Pagination
    const totalPages = await Contact.countDocuments({});
    const PAGE_SIZE = 10;
    const pageNo = parseInt(req.query.pageNo || "0");
    const query = { limit: PAGE_SIZE, skip: PAGE_SIZE * (pageNo - 1) };

    try {
        const contacts = pageNo > 0 ?
            await Contact.find({}, {}, query).sort({ contact_date: -1 }) :
            await Contact.find().sort({ contact_date: -1 });

        if (pageNo > 0) {
            return res.status(200).json({
                totalPages: Math.ceil(totalPages / PAGE_SIZE),
                contacts
            });
        } else {
            return res.status(200).json(contacts);
        }
    } catch (err) {
        handleError(res, err);
    }
};

exports.getContactsBySender = async (req, res) => {
    try {
        const contacts = await Contact.find({ sent_by: req.params.id });
        res.status(200).json(contacts);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneContact = async (req, res) => {
    const contact = await findContactById(req.params.id, res);
    if (contact) res.status(200).json(contact);
};

exports.createContact = async (req, res) => {
    try {
        const newContact = await Contact.create(req.body);
        if (!newContact) throw Error('Something went wrong!');

        // Sending e-mail to contacted user
        try {
            sendEmail(
                newContact.email,
                "Thank you for contacting Quiz-Blog!",
                { name: newContact.contact_name },
                "./template/contact.handlebars"
            );
        } catch (err) {
            console.error('Error sending email to contacted user:', err);
        }

        // Notify admins
        await notifyAdmins(newContact);

        res.status(200).json(newContact);
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateContact = async (req, res) => {
    try {
        // Convert message from raw to HTML
        const rawContent = JSON.parse(req.body.message);
        const contentState = convertFromRaw(rawContent);
        const htmlMessage = stateToHTML(contentState);

        // Update the Quiz on Contact updating
        const newMessage = await Contact.updateOne(
            { "_id": req.params.id },
            { $push: { "replies": req.body } },
            { new: true }
        );

        if (!newMessage) throw Error('Something went wrong while trying to update the contact');

        // Send Reply email
        try {
            sendEmail(
                req.body.to_contact,
                "New reply",
                {
                    name: req.body.to_contact_name,
                    question: req.body.contact_question,
                    answer: htmlMessage,
                },
                "./template/reply.handlebars"
            );
        } catch (err) {
            console.error('Error sending reply email:', err);
        }

        res.status(200).json(req.body);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const contact = await findContactById(req.params.id, res);
        if (!contact) return;

        await Contact.findByIdAndDelete(req.params.id);
        res.status(200).json({ msg: 'Contact deleted successfully' });
    } catch (err) {
        handleError(res, err);
    }
};

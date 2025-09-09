const axios = require('axios');
const Contact = require("../models/Contact");
const { sendEmail } = require("../utils/emails/sendEmail");
const { convertFromRaw } = require("draft-js");
const { stateToHTML } = require("draft-js-export-html");
const { handleError } = require('../utils/error');
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

// Helper function to find contact by ID
const findContactById = async (id, res, selectFields = '') => {
    try {
        const contact = await Contact.findById(id).select(selectFields);
        if (!contact) return res.status(404).json({ message: 'No contact found!' });
        return contact;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to send emails to admins
const notifyAdmins = async (newContact) => {
    try {
        // Helper function to safely fetch admin emails with retry on failure
        const fetchAdminEmails = async () => {
            try {
            const response = await axios.get(`${USERS_SERVICE_URL}/api/users/admins-emails`);
            return response.data;
            } catch (error) {
            console.warn(`Failed to fetch admin emails from ${USERS_SERVICE_URL}/api/users/admins-emails:`, error.message);
            // Retry after 1 minute if failed
            return new Promise((resolve) => {
                setTimeout(async () => {
                try {
                    const retryResponse = await axios.get(`${USERS_SERVICE_URL}/api/users/admins-emails`);
                    resolve(retryResponse.data);
                } catch (retryError) {
                    console.warn(`Retry failed to fetch admin emails:`, retryError.message);
                    resolve(null);
                }
                }, 60000); // 1 minute
            });
            }
        };

        const adminsEmails = await fetchAdminEmails();

        if (!adminsEmails) {
            console.warn('No admin emails available for notification');
            return;
        }

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
        if (!newContact) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong!'
            });
        }

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

        if (!newMessage) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong while trying to update the contact'
            });
        }

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
        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (err) {
        handleError(res, err);
    }
};

// Get database statistics
exports.getDatabaseStats = async (req, res) => {
    try {
        const db = Contact.db;
        
        // Get stats for contacts collection using document sampling approach
        const contactsCollection = db.collection('contacts');
        const contactsCount = await contactsCollection.countDocuments();
        const contactSample = await contactsCollection.find({}).limit(50).toArray();
        const avgContactSize = contactSample.length > 0 ? 
            contactSample.reduce((sum, doc) => sum + JSON.stringify(doc).length, 0) / contactSample.length : 0;
        const estimatedContactDataSize = contactsCount * avgContactSize;
        
        // Get aggregated contact data
        const pipeline = [
            {
                $group: {
                    _id: null,
                    totalContacts: { $sum: 1 },
                    avgMessageLength: { $avg: { $strLenCP: "$message" } },
                    repliedCount: { $sum: { $cond: [{ $ne: ["$reply", null] }, 1, 0] } }
                }
            }
        ];
        
        const aggregatedStats = await contactsCollection.aggregate(pipeline).toArray();
        const contactStats = aggregatedStats[0] || {};

        const dbStats = {
            service: 'contacts',
            timestamp: new Date().toISOString(),
            documents: contactsCount,
            totalDocuments: contactsCount,
            dataSize: estimatedContactDataSize,
            totalDataSize: estimatedContactDataSize,
            storageSize: Math.round(estimatedContactDataSize * 1.2),
            totalStorageSize: Math.round(estimatedContactDataSize * 1.2),
            indexSize: Math.round(estimatedContactDataSize * 0.1),
            totalIndexSize: Math.round(estimatedContactDataSize * 0.1),
            collections: {
                contacts: {
                    documents: contactsCount,
                    dataSize: estimatedContactDataSize,
                    avgDocumentSize: avgContactSize
                }
            },
            aggregatedStats: {
                totalContacts: contactStats.totalContacts || contactsCount,
                avgMessageLength: contactStats.avgMessageLength || 0,
                repliedCount: contactStats.repliedCount || 0,
                replyRate: contactsCount > 0 ? ((contactStats.repliedCount || 0) / contactsCount * 100).toFixed(2) + '%' : '0%'
            }
        };

        res.status(200).json(dbStats);
    } catch (err) {
        handleError(res, err);
    }
};

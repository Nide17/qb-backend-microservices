// Bring in Mongo
const mongoose = require('mongoose');
const axios = require('axios');

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const FaqSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    created_by: {
        type: Schema.Types.ObjectId,
    },
    video_links: {
        type: [
            {
                vtitle: {
                    type: String,
                    required: true
                },
                vlink: {
                    type: String,
                    required: true
                }
            }
        ]
    }
}, { timestamps: true });

FaqSchema.methods.populateCreatedBy = async function () {
    let faq = this;
    let user = null;

    if (faq.created_by) {
        try {
            user = await axios.get(`${process.env.API_GATEWAY_URL}/api/users/${faq.created_by}`);
        } catch (error) {
            user = null;
        }
    }

    faq = faq.toObject();
    faq.created_by = user && user.data && { _id: user.data._id, name: user.data.name };
    return faq;
};

module.exports = mongoose.model("Faq", FaqSchema);
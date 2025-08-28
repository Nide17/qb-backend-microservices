import * as axios from 'axios';
import * as client from 'twilio';


const { SendHtmlEmail } = require("../../utils/sendEmail")
// const twilioSID = process.env.TWILIO_ACCOUNT_SID
// const twilioToken = process.env.TWILIO_AUTH_TOKEN
// (twilioSID, twilioToken)
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:5000';

// BlogPostsView Model
import BlogPostsView from '../../models/blog-posts/BlogPostsView.js'

const from = 'whatsapp:+14155238886'; // Twilio WhatsApp Sandbox number
const numbers = ['whatsapp:+250786791577', 'whatsapp:+250738140795']

const getDailyReport = async () => {
    try {
        const today = new Date();
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const result = await BlogPostsView.aggregate([
            { $match: { createdAt: { $gte: todayDate } } },
            { $group: { _id: { blogPost: '$blogPost', country: '$country', device: '$device' }, count: { $sum: 1 } } },
            { $sort: { '_id.country': 1, '_id.device': 1 } },
            { $group: { _id: '$_id.blogPost', countries: { $push: { country: '$_id.country', device: '$_id.device', count: '$count' } }, count: { $sum: '$count' } } },
            { $sort: { '_id': 1 } },
            { $lookup: { from: 'blogposts', localField: '_id', foreignField: '_id', as: 'blogPost' } },
            { $unwind: "$blogPost" },
            { $project: { _id: 0, blogPost: '$blogPost.title', countries: 1, count: 1 } }
        ]);

        return processReportData(result);
    } catch (err) {
        console.error(err);
        return null;
    }
}

const processReportData = (result) => {
    let totalViewsCount = 0;
    const uniqueCountries = new Set();
    const uniqueCountriesCount = [];
    const uniqueDevices = new Set();
    const uniqueDevicesCount = [];
    const blogPostsViews = [];

    result.forEach(blogPost => {
        totalViewsCount += blogPost.count;
        blogPost.countries.forEach(country => {
            if (!uniqueCountries.has(country.country)) {
                uniqueCountries.add(country.country);
                uniqueCountriesCount.push({ country: country.country, count: country.count });
            } else {
                uniqueCountriesCount.find(uniqueCountry => uniqueCountry.country === country.country).count += country.count;
            }
            if (!uniqueDevices.has(country.device)) {
                uniqueDevices.add(country.device);
                uniqueDevicesCount.push({ device: country.device, count: country.count });
            } else {
                uniqueDevicesCount.find(uniqueDevice => uniqueDevice.device === country.device).count += country.count;
            }
        });
        blogPostsViews.push({ blogPost: blogPost.blogPost, count: blogPost.count });
    });

    return { totalViewsCount, uniqueCountriesCount, uniqueDevicesCount, blogPostsViews };
}

const generateReportMessage = (report, currentDate) => {
    let reportMessage = `*TODAY, ${currentDate} REPORT FOR BLOG POSTS VIEWS* \n\n`
    reportMessage += `*Total Views:* ${report?.totalViewsCount} \n\n`
    reportMessage += `*Unique Countries:* \n`
    report?.uniqueCountriesCount.forEach(country => reportMessage += `${country.country}: ${country.count} \n`);
    reportMessage += `\n*Unique Devices:* \n`
    report?.uniqueDevicesCount.forEach(device => reportMessage += `${device.device}: ${device.count} \n`);
    reportMessage += `\n*Blog Posts Views:* \n`
    report?.blogPostsViews.forEach(blogPost => reportMessage += `${blogPost.blogPost}: ${blogPost.count} \n`);

    return reportMessage;
}

const generateReportEmail = (report, currentDate) => {
    return {
        subject: `TODAY, ${currentDate} REPORT BLOG POSTS VIEWS`,
        html: `
            <h3 style="color: blue"><u>Report for ${currentDate}</u></h3>
            <h4><u>Total Views:</u> ${report?.totalViewsCount}</h4>
            <h4><u>Unique Countries:</u></h4>
            <ul>${report?.uniqueCountriesCount.map(country => `<li>${country.country}: ${country.count}</li>`).join('')}</ul>
            <h4><u>Unique Devices:</u></h4>
            <ul>${report?.uniqueDevicesCount.map(device => `<li>${device.device}: ${device.count}</li>`).join('')}</ul>
            <h4><u>Blog Posts Views:</u></h4>
            <ul>${report?.blogPostsViews.map(blogPost => `<li>${blogPost.blogPost}: ${blogPost.count}</li>`).join('')}</ul>
        `
    }
}

const sendReport = async (reportMessage, reportMessageEmail, adminsEmails) => {
    // numbers.forEach(to => {
    //     client.messages.create({ from, to, body: reportMessage })
    //         .then(message => console.log(message.sid))
    //         .catch(error => console.error(error));
    // });
    adminsEmails && adminsEmails.forEach(admEmail => SendHtmlEmail(admEmail, reportMessageEmail.subject, reportMessageEmail.html));
}

const fetchAdminEmails = async () => {
    try {
        const { data } = await axios.get(`${API_GATEWAY_URL}/api/users/admins-emails`);
        return data;
    } catch (error) {
        console.error('Error fetching admin emails:', error);
        return [];
    }
}

const scheduledReportMessage = async () => {
    const report = await getDailyReport();
    const adminsEmails = await fetchAdminEmails();

    const date = new Date();
    const currentDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const scheduleDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    const reportMessage = generateReportMessage(report, currentDate);
    const reportMessageEmail = generateReportEmail(report, currentDate);

    const interval = setInterval(async () => {
        const now = new Date();
        if (now >= scheduleDate) {
            console.log('Sending report...');
            await sendReport(reportMessage, reportMessageEmail, adminsEmails);
            clearInterval(interval);
        }
    }, 1000);
};

module.exports = scheduledReportMessage
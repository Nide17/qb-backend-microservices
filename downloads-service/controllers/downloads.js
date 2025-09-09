const axios = require('axios');
const Download = require("../models/Download");
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;
const COURSES_SERVICE_URL = process.env.COURSES_SERVICE_URL;

// Helper function to fetch related data for a download with error handling
const fetchDownloadDetails = async (download) => {
    try {
        // Use timeout to prevent hanging requests
        const axiosConfig = { 
            headers: { 'x-internal-service': 'true' },
            timeout: 5000 // 5 second timeout
        };

        const [notesResult, courseResult, chapterResult, userResult] = await Promise.allSettled([
            download.notes ? axios.get(`${COURSES_SERVICE_URL}/api/notes/${download.notes}`, axiosConfig)
                .catch(() => null) : Promise.resolve(null),
            download.course ? axios.get(`${COURSES_SERVICE_URL}/api/courses/${download.course}`, axiosConfig)
                .catch(() => null) : Promise.resolve(null),
            download.chapter ? axios.get(`${COURSES_SERVICE_URL}/api/chapters/${download.chapter}`, axiosConfig)
                .catch(() => null) : Promise.resolve(null),
            download.downloaded_by ? axios.get(`${USERS_SERVICE_URL}/api/users/${download.downloaded_by}`, axiosConfig)
                .catch(() => null) : Promise.resolve(null)
        ]);

        return {
            ...download,
            notes: notesResult.status === 'fulfilled' && notesResult.value?.data ? notesResult.value.data : null,
            course: courseResult.status === 'fulfilled' && courseResult.value?.data ? courseResult.value.data : null,
            chapter: chapterResult.status === 'fulfilled' && chapterResult.value?.data ? chapterResult.value.data : null,
            downloaded_by: userResult.status === 'fulfilled' && userResult.value?.data ? userResult.value.data : null
        };
    } catch (error) {
        console.log('Error fetching download details:', error.message);
        return {
            ...download,
            notes: download.notes ? { _id: download.notes } : null,
            course: download.course ? { _id: download.course } : null,
            chapter: download.chapter ? { _id: download.chapter } : null,
            downloaded_by: download.downloaded_by ? { _id: download.downloaded_by } : null
        };
    }
};

// Helper function to process downloads in batches to prevent memory overload
const processBatchedDownloads = async (downloads, batchSize = 10) => {
    const results = [];
    for (let i = 0; i < downloads.length; i += batchSize) {
        const batch = downloads.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(fetchDownloadDetails));
        results.push(...batchResults);
        
        // Small delay between batches to prevent overwhelming the system
        if (i + batchSize < downloads.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    return results;
};

exports.getDownloads = async (req, res) => {
    try {

    const totalPages = await Download.countDocuments({});
    var PAGE_SIZE = 20;
    var pageNo = parseInt(req.query.pageNo || "0");
    var query = {};

    query.limit = PAGE_SIZE;
    query.skip = PAGE_SIZE * (pageNo - 1);

    let downloads = pageNo > 0 ?
        await Download.find({}, {}, query).sort({ createdAt: -1 }).lean() :
        await Download.find().sort({ createdAt: -1 }).lean();

    if (!downloads) {
        return res.status(204).json({ error: 'No downloads exist' });
    }

    // Use batched processing to prevent memory overload
    const result = await processBatchedDownloads(downloads);

    if (pageNo > 0) {
        return res.status(200).json({
            totalPages: Math.ceil(totalPages / PAGE_SIZE),
            downloads: result
        });
    } else {
        return res.status(200).json({ downloads: result });
    }
    } catch (error) {
        console.log('Error getting downloads:', error.message);
        res.status(500).json({ error: 'Failed to get downloads' });
    }
};

exports.getDownloadsForNotesCreator = async (req, res) => {
    try {
        let downloads = await Download.find({}).lean();

        if (!downloads) {
            return res.status(404).json({ error: 'No downloads exist' });
        }

        // Use batched processing and filter
        const result = await processBatchedDownloads(downloads);
        const downloadsForNotes = result.filter(download => 
            download.notes && download.notes.creator === req.user._id
        );

        res.status(200).json({ downloads: downloadsForNotes });
    } catch (error) {
        console.log('Error getting downloads for notes creator:', error.message);
        res.status(500).json({ error: 'Failed to get downloads for notes creator' });
    }
};

exports.getDownloadsByUser = async (req, res) => {
    try {
        let downloads = await Download.find({ downloaded_by: req.params.id }).lean();

        if (!downloads || downloads.length === 0) {
            return res.status(404).json({ error: 'No downloads found for this user' });
        }

        const result = await processBatchedDownloads(downloads);
        res.status(200).json(result);
    } catch (error) {
        console.log('Error getting downloads by user:', error.message);
        res.status(500).json({ error: 'Failed to get downloads by user' });
    }
};

exports.createDownload = async (req, res) => {
    try {
        const { notes, chapter, course, courseCategory, downloaded_by } = req.body;
        var now = new Date();

        // Simple validation
        if (!notes || !course || !courseCategory || !downloaded_by) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const recentDownExist = await Download.find({ downloaded_by }, {}, { sort: { 'createdAt': -1 } });

        if (recentDownExist.length > 0) {
            let downDate = new Date(recentDownExist[0].createdAt);
            let seconds = Math.round((now - downDate) / 1000);

            if (seconds < 5) {
                return res.status(400).json({
                    message: 'Download with same time saved already!'
                });
            }
        }

        const newDownload = new Download({
            notes,
            chapter,
            course,
            courseCategory,
            downloaded_by
        });

        const savedDownload = await newDownload.save();
        if (!savedDownload) {
            return res.status(500).json({ error: 'Something went wrong during creation!' });
        }

        res.status(200).json({
            _id: savedDownload._id,
            notes: savedDownload.notes,
            chapter: savedDownload.chapter,
            course: savedDownload.course,
            courseCategory: savedDownload.course,
            downloaded_by: savedDownload.downloaded_by
        });
    } catch (error) {
        console.log('Error creating download:', error.message);
        res.status(500).json({ error: 'Failed to create download' });
    }
};

exports.deleteDownload = async (req, res) => {
    try {
        const download = await Download.findById(req.params.id);
        if (!download) {
            return res.status(404).json({ error: 'Download not found!' });
        }

        const removedDownload = await Download.deleteOne({ _id: req.params.id });
        if (removedDownload.deletedCount === 0) {
            return res.status(500).json({ error: 'Something went wrong while deleting!' });
        }

        res.status(200).json({ message: "Deleted successfully!" });
    } catch (error) {
        console.log('Error deleting download:', error.message);
        res.status(500).json({ error: 'Failed to delete download' });
    }
};

// Get top users by download activity (for statistics service)
exports.getTopUsersByDownloads = async (req, res) => {
    try {
        // Get top downloaders aggregation
        const topDownloadersData = await Download.aggregate([
            { $group: { _id: "$downloaded_by", totalDownloads: { $sum: 1 } } },
            { $sort: { totalDownloads: -1 } },
            { $limit: 10 }
        ]);

        if (topDownloadersData.length === 0) {
            return res.status(200).json([]);
        }

        const userIds = topDownloadersData.map(d => d._id.toString());
        
        try {
            // Fetch user details            
            const usersResponse = await axios.post(`${USERS_SERVICE_URL}/api/users/batch`, 
                { userIds }, 
                { 

                    headers: { 
                        'Content-Type': 'application/json',
                        'x-internal-service': 'true' 
                    }
                }
            );
            
            const users = usersResponse.data.users || [];
            
            const topDownloaders = topDownloadersData.map(downloadData => {
                const user = users.find(u => u._id === downloadData._id.toString()) || {};
                return {
                    _id: downloadData._id,
                    name: user.name || 'Unknown User',
                    email: user.email || '',
                    image: user.image || '',
                    totalDownloads: downloadData.totalDownloads
                };
            });

            res.status(200).json(topDownloaders);
        } catch (userError) {
            console.error('Error fetching user details for top downloaders:');
            console.error('Error message:', userError.message);
            console.error('Error response status:', userError.response?.status);
            console.error('Error response data:', userError.response?.data);
            console.error('Full error:', userError);
            
            // Return data without user details if API call fails
            const topDownloaders = topDownloadersData.map(downloadData => ({
                _id: downloadData._id,
                name: 'Unknown User',
                email: '',
                image: '',
                totalDownloads: downloadData.totalDownloads
            }));
            res.status(200).json(topDownloaders);
        }
    } catch (error) {
        console.log('Error getting top downloaders:', error.message);
        res.status(500).json({ error: 'Failed to get top downloaders' });
    }
};

// Get database statistics for downloads service
exports.getDatabaseStats = async (req, res) => {
    try {
        const db = Download.db;
        const collection = db.collection('downloads');
        
        // Get document count and estimate sizes using sampling approach
        const documentCount = await collection.countDocuments();
        const sampleDocs = await collection.find({}).limit(50).toArray();
        const avgDocSize = sampleDocs.length > 0 ? 
            sampleDocs.reduce((sum, doc) => sum + JSON.stringify(doc).length, 0) / sampleDocs.length : 0;
        const estimatedDataSize = documentCount * avgDocSize;
        const estimatedStorageSize = Math.round(estimatedDataSize * 1.2);
        const estimatedIndexSize = Math.round(estimatedDataSize * 0.1);
        
        // Get additional aggregated data
        const pipeline = [
            {
                $group: {
                    _id: null,
                    totalDownloads: { $sum: 1 },
                    recentDownloads: {
                        $sum: {
                            $cond: [
                                { $gte: ["$createdAt", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                                1,
                                0
                            ]
                        }
                    },
                    uniqueUsers: { $addToSet: "$downloaded_by" },
                    uniqueNotes: { $addToSet: "$notes" }
                }
            },
            {
                $project: {
                    totalDownloads: 1,
                    recentDownloads: 1,
                    uniqueUsersCount: { $size: "$uniqueUsers" },
                    uniqueNotesCount: { $size: "$uniqueNotes" }
                }
            }
        ];
        
        const aggregatedStats = await collection.aggregate(pipeline).toArray();
        const downloadStats = aggregatedStats[0] || {};

        const dbStats = {
            service: 'downloads',
            timestamp: new Date().toISOString(),
            documents: documentCount,
            totalDocuments: documentCount,
            dataSize: estimatedDataSize,
            totalDataSize: estimatedDataSize,
            storageSize: estimatedStorageSize,
            totalStorageSize: estimatedStorageSize,
            indexSize: estimatedIndexSize,
            totalIndexSize: estimatedIndexSize,
            avgDocumentSize: avgDocSize,
            collections: {
                downloads: {
                    documents: documentCount,
                    dataSize: estimatedDataSize,
                    avgDocumentSize: avgDocSize
                }
            },
            downloadMetrics: {
                totalDownloads: downloadStats.totalDownloads || 0,
                recentDownloads: downloadStats.recentDownloads || 0,
                uniqueUsers: downloadStats.uniqueUsersCount || 0,
                uniqueNotes: downloadStats.uniqueNotesCount || 0
            }
        };

        res.status(200).json(dbStats);
    } catch (error) {
        console.log('Error getting database stats:', error.message);
        res.status(500).json({ error: 'Failed to get database statistics' });
    }
};

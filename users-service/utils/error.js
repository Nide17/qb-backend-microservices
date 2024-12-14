// Helper function to handle errors
const handleError = (res, err, status = 400) => {
    console.log(err);
    res.status(status).json({ msg: err.message });
}

module.exports = { handleError };
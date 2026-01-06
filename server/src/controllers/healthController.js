class HealthController {
    getHealth(req, res) {
        res.status(200).json({
            status: 'success',
            message: 'Server is healthy',
        });
    }
}

module.exports = new HealthController();


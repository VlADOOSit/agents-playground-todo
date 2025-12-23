class HealthController {
  getHealth(_req, res) {
    res.json({ status: 'ok' });
  }
}

module.exports = new HealthController();

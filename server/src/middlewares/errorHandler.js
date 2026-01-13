const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
	const isAppError = err instanceof AppError;
	const statusCode = isAppError ? err.statusCode : 500;
	const message = isAppError ? err.message : 'Internal server error';

	if (!isAppError || statusCode >= 500) {
		console.error('API error', err);
	}

	const payload = {
		error: {
			message,
			statusCode,
		},
	};

	if (isAppError && err.details) {
		payload.error.details = err.details;
	}

	res.status(statusCode).json(payload);
};

module.exports = errorHandler;

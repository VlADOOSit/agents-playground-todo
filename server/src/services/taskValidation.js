const VALID_STATUSES = new Set(['TODO', 'IN_PROGRESS', 'DONE']);
const VALID_SORTS = new Set(['createdAt', 'deadline']);

const isValidDeadline = (deadline) => {
	if (deadline === undefined) {
		return true;
	}

	if (deadline === null) {
		return true;
	}

	if (typeof deadline !== 'string') {
		return false;
	}

	const trimmed = deadline.trim();
	if (!trimmed) {
		return true;
	}

	if (!trimmed.includes('T')) {
		return false;
	}

	const parsed = new Date(trimmed);
	return !Number.isNaN(parsed.getTime());
};

const normalizeDeadline = (deadline) => {
	if (deadline === undefined) {
		return undefined;
	}

	if (deadline === null) {
		return null;
	}

	const trimmed = typeof deadline === 'string' ? deadline.trim() : deadline;
	if (trimmed === '') {
		return null;
	}

	return trimmed;
};

module.exports = { VALID_STATUSES, VALID_SORTS, isValidDeadline, normalizeDeadline };

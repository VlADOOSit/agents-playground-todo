const HealthController = require('../controllers/healthController');

describe('HealthController', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('getHealth', () => {
        test('should return health status with 200 status code', () => {
            HealthController.getHealth(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Server is healthy'
            });
        });

        test('should return the correct response structure', () => {
            HealthController.getHealth(mockReq, mockRes);

            const expectedResponse = {
                status: 'success',
                message: 'Server is healthy'
            };

            expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);

            // Verify that json was called with an object containing the expected properties
            const callArgs = mockRes.json.mock.calls[0][0];
            expect(callArgs).toHaveProperty('status', 'success');
            expect(callArgs).toHaveProperty('message', 'Server is healthy');
        });
    });
});

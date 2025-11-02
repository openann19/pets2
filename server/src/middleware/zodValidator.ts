export {};// Added to mark file as a module
const z = require('zod');

function zodValidate({ body, params, query }) {
    return (req, res, next) => {
        try {
            if (body) req.body = body.parse(req.body ?? {});
            if (params) req.params = params.parse(req.params ?? {});
            if (query) req.query = query.parse(req.query ?? {});
            return next();
        } catch (err) {
            const issues = err?.issues || [];
            const errors = issues.map((i) => ({
                path: i.path?.join('.') || '',
                code: i.code,
                message: i.message,
            }));
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }
    };
}

module.exports = { zodValidate, z };

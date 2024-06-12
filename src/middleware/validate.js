import { validationResult } from "express-validator";

const Validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let error = {};
        const message = errors.array().map((err) => (error[err.param] = err.msg));
        return res.json({ status: "failed", message });
    }
    next();
};
export default Validate;
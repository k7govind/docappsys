"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = void 0;
const sanitizeInput = (value) => {
    if (!value)
        return "";
    return value.trim();
};
exports.sanitizeInput = sanitizeInput;

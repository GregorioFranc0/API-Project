class CustomError extends Error {
    constructor(message = "Internal Server Error", status = 500) {
        super(message)
        this.message = message;
        this.status = status;

    }
    throwErr() {
        throw this;
    }
}

module.exports = { CustomError };

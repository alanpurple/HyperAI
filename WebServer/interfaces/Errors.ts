export class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = "UnauthorizedError";
    }
}

export class AdminError extends Error {
    constructor(message) {
        super(message);
        this.name = "AdminError";
    }
    
    throw = () => {
        throw this
    };
}

export class ProjectError extends Error {
    constructor(message) {
        super(message);
        this.name = "ProjectError";
    }
}
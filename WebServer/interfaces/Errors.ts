export class WebError extends Error {
    constructor(message: string, name: string) {
        super(message);
        this.name = name;
    }
    
    throw = () => {
        throw this;
    };
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
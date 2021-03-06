export class WebError extends Error {
    constructor(message: string, name: string) {
        super(message);
        this.name = name;
    }
    
    throw = () => {
        throw this;
    };
}
export const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Martinie API Server",
            version: "1.0.0",
            description: "This is a REST API application made with Express. It retrieves data from Martinie",
            contact: {
                name: "Martinie",
                url: "https://martinie.infinov.com",
                email: "martinie@infinov.com"
            },
            license: {
                name: "Apache 2.0",
                url: "https://www.apache.org/licenses/LICENSE-2.0.html"
            }
        },
        host: "localhost:3000",
        basePath: "/",
        servers: [
            {
                url: `https://192.168.0.2`,
                description: "Development server"
            },
        ],
    },
    apis: [`${__dirname}/../routes/*.js`, `${__dirname}/**/*.yaml`],
}
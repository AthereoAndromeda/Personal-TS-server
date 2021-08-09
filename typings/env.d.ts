declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT?: string;
            NODE_ENV?: "development" | "production" | "test";
            SERVER_AUTH?: string;
        }
    }
}

export {};

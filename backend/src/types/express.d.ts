declare namespace Express {
    interface User {
        id: string;
        email: string;
        tenantId: string;
        role: string;
    }

    interface Request {
        user?: User;
    }
}

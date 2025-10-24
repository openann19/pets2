export interface JwtPayload {
    userId: string;
    email: string;
    exp: number;
    iat: number;
}
export declare function validateToken(token: string): Promise<JwtPayload | null>;
//# sourceMappingURL=jwt-validator.d.ts.map
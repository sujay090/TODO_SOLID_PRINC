export interface AuthTokenResponse {
    token: string;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface IAuthService {
    register(name: string, email: string, password: string): Promise<AuthTokenResponse>;
    login(email: string, password: string): Promise<AuthTokenResponse>;
}

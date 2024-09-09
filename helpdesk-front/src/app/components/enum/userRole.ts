export enum UserRole {
    ADMIN = 0,
    CLIENTE = 1,
    TECNICO = 2
}

export function getUserRoles(): string[] {
    return Object.keys(UserRole)
        .filter(key => isNaN(Number(key)))
        .map(key => key);
}

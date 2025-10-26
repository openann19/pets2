/**
 * Core type definitions for the application models
 * These are used across the application for type safety
 */
export type User = {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    status?: string;
    isEmailVerified?: boolean;
    dateOfBirth?: string | Date;
    phone?: string;
    bio?: string;
    avatar?: string;
    location?: {
        address?: string;
        coordinates?: [number, number];
    };
};
export type Pet = {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    owner: string;
    age?: number;
    photos?: string[];
};
export type Match = {
    _id: string;
    pet1: Pet;
    pet2: Pet;
    status?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
};
export type Message = {
    _id: string;
    matchId: string;
    sender: string;
    content: string;
    read: boolean;
    createdAt: string | Date;
};

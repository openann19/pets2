"use strict";
/**
 * Shared Utility Functions
 * Platform-agnostic logic for both web and mobile
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAge = calculateAge;
exports.calculateDistance = calculateDistance;
exports.calculateCompatibilityScore = calculateCompatibilityScore;
exports.formatDisplayName = formatDisplayName;
exports.formatPetAge = formatPetAge;
exports.isValidEmail = isValidEmail;
exports.generateId = generateId;
exports.formatRelativeTime = formatRelativeTime;
// Re-export logger
__exportStar(require("./logger"), exports);
// Age calculation utility
function calculateAge(dateOfBirth) {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1;
    }
    return age;
}
// Distance calculation (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
// Pet compatibility scoring
function calculateCompatibilityScore(pet1, pet2) {
    let score = 0;
    // Species match (40 points)
    if (pet1.species === pet2.species) {
        score += 40;
    }
    // Size compatibility (20 points)
    const sizeCompatibility = getSizeCompatibility(pet1.size, pet2.size);
    score += sizeCompatibility;
    // Age compatibility (20 points)
    const ageDiff = Math.abs(pet1.age - pet2.age);
    if (ageDiff <= 1)
        score += 20;
    else if (ageDiff <= 2)
        score += 15;
    else if (ageDiff <= 3)
        score += 10;
    else if (ageDiff <= 5)
        score += 5;
    // Personality match (20 points)
    const personalityOverlap = pet1.personalityTags.filter(tag => pet2.personalityTags.includes(tag)).length;
    score += Math.min(personalityOverlap * 5, 20);
    return Math.min(score, 100);
}
function getSizeCompatibility(size1, size2) {
    const sizeOrder = ['small', 'medium', 'large', 'extra-large'];
    const index1 = sizeOrder.indexOf(size1.toLowerCase());
    const index2 = sizeOrder.indexOf(size2.toLowerCase());
    if (index1 === -1 || index2 === -1)
        return 10; // Unknown sizes get moderate score
    const diff = Math.abs(index1 - index2);
    if (diff === 0)
        return 20; // Same size
    if (diff === 1)
        return 15; // Adjacent sizes
    if (diff === 2)
        return 10; // Two sizes apart
    return 5; // Very different sizes
}
// Format display name for users
function formatDisplayName(user) {
    return `${user.firstName} ${user.lastName.charAt(0)}.`;
}
// Format pet description
function formatPetAge(age) {
    if (age < 1)
        return 'Puppy/Kitten';
    if (age === 1)
        return '1 year old';
    return `${String(age)} years old`;
}
// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Generate random ID (for temporary use)
function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
// Time formatting utilities
function formatRelativeTime(date) {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);
    if (diffInSeconds < 60)
        return 'Just now';
    if (diffInSeconds < 3600)
        return `${String(Math.floor(diffInSeconds / 60))}m ago`;
    if (diffInSeconds < 86400)
        return `${String(Math.floor(diffInSeconds / 3600))}h ago`;
    if (diffInSeconds < 604800)
        return `${String(Math.floor(diffInSeconds / 86400))}d ago`;
    return messageDate.toLocaleDateString();
}
__exportStar(require("./contentFilter"), exports);
__exportStar(require("./storage"), exports);
// Note: Constants are exported from types/index.ts to avoid duplication
//# sourceMappingURL=index.js.map
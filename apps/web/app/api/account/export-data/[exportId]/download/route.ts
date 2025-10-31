/**
 * Download Data Export API Route
 * GDPR Article 20 - Right to Data Portability
 */

import type { NextRequest } from 'next/server'

;
import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../../lib/auth';
import { connectToDB } from '../../../../../lib/db';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ exportId: string }> }
) {
    try {
        // Verify authentication
        const { userId } = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const params = await context.params;
        const { exportId } = params;

        // Connect to the database
        const db = await connectToDB();

        // Get the export job
        const exportJob = await db.dataExports.findOne({ exportId });

        if (!exportJob) {
            return NextResponse.json({ error: 'Export not found' }, { status: 404 });
        }

        // Ensure the authenticated user is downloading their own export
        if (exportJob.userId !== userId) {
            return NextResponse.json(
                { error: 'You can only download your own exports' },
                { status: 403 }
            );
        }

        // Check if the export is completed
        if (exportJob.status !== 'completed') {
            return NextResponse.json(
                { error: 'Export is not yet ready for download', status: exportJob.status },
                { status: 400 }
            );
        }

        // Check if the export has expired
        if (exportJob.expiresAt && new Date() > new Date(exportJob.expiresAt)) {
            return NextResponse.json(
                { error: 'Export has expired. Please request a new export.' },
                { status: 410 }
            );
        }

        // In a real implementation, we would fetch the actual file from storage
        // and return it as a download

        // For this implementation, we'll generate a sample data file
        const userData = await generateUserDataSample(userId, exportJob.format);

        // Set appropriate headers for download
        const headers = new Headers();
        if (exportJob.format === 'json') {
            headers.set('Content-Type', 'application/json');
            headers.set('Content-Disposition', `attachment; filename="pawfectmatch-data-export-${exportId}.json"`);
        } else {
            headers.set('Content-Type', 'text/csv');
            headers.set('Content-Disposition', `attachment; filename="pawfectmatch-data-export-${exportId}.csv"`);
        }

        // Update download count
        await db.dataExports.updateOne(
            { exportId },
            { $inc: { downloadCount: 1 }, $set: { lastDownloaded: new Date() } }
        );

        return new NextResponse(userData, { headers });
    } catch (error) {
        console.error('Error downloading export:', { error });
        return NextResponse.json(
            { error: 'Failed to download export' },
            { status: 500 }
        );
    }
}

/**
 * Generate sample user data for demonstration
 */
async function generateUserDataSample(userId: string, format: 'json' | 'csv'): Promise<string> {
    const db = await connectToDB();

    // Get user profile
    const user = await db.users.findOne({ _id: userId });

    if (!user) {
        throw new Error('User not found');
    }

    // Create a sample data object
    const data = {
        profile: {
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
        },
        pets: [
            {
                id: 'pet-1',
                name: 'Buddy',
                species: 'Dog',
                breed: 'Golden Retriever',
                age: 3,
                photos: ['photo-url-1.jpg', 'photo-url-2.jpg']
            },
            {
                id: 'pet-2',
                name: 'Whiskers',
                species: 'Cat',
                breed: 'Siamese',
                age: 2,
                photos: ['photo-url-3.jpg']
            }
        ],
        matches: [
            { id: 'match-1', petId: 'pet-1', matchedWithPetId: 'other-pet-1', matchedAt: '2025-09-15T12:00:00Z' },
            { id: 'match-2', petId: 'pet-2', matchedWithPetId: 'other-pet-2', matchedAt: '2025-09-20T14:30:00Z' }
        ],
        messages: [
            { id: 'msg-1', matchId: 'match-1', sentAt: '2025-09-15T12:05:00Z', content: 'Hello!' },
            { id: 'msg-2', matchId: 'match-1', sentAt: '2025-09-15T12:10:00Z', content: 'Hi there!' },
            { id: 'msg-3', matchId: 'match-2', sentAt: '2025-09-20T14:35:00Z', content: 'Nice to meet you!' }
        ],
        preferences: {
            species: ['Dog', 'Cat'],
            ageRange: [1, 10],
            distance: 50,
            notificationSettings: {
                matches: true,
                messages: true,
                app: true,
                email: true,
                marketing: false
            }
        },
        subscription: {
            plan: 'premium',
            startDate: '2025-01-01T00:00:00Z',
            nextBillingDate: '2026-01-01T00:00:00Z',
            status: 'active'
        },
        privacySettings: {
            profileVisibility: 'everyone',
            locationSharing: true,
            activityStatus: true
        },
        locations: [
            { timestamp: '2025-10-01T10:00:00Z', latitude: 40.7128, longitude: -74.0060 },
            { timestamp: '2025-10-02T11:00:00Z', latitude: 40.7129, longitude: -74.0061 }
        ]
    };

    // Format the data according to the requested format
    if (format === 'json') {
        return JSON.stringify(data, null, 2);
    } else {
        // Simple CSV conversion for demonstration
        // In a real implementation, you'd use a proper CSV library
        return convertToCSV(data);
    }
}

/**
 * Simple conversion to CSV format
 */
function convertToCSV(data: any): string {
    // Flatten the nested structure
    const flattened: any[] = [];

    // Profile
    flattened.push({
        type: 'profile',
        id: data.profile.userId,
        email: data.profile.email,
        firstName: data.profile.firstName,
        lastName: data.profile.lastName,
        createdAt: data.profile.createdAt
    });

    // Pets
    data.pets.forEach((pet: any) => {
        flattened.push({
            type: 'pet',
            id: pet.id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            age: pet.age
        });
    });

    // Matches
    data.matches.forEach((match: any) => {
        flattened.push({
            type: 'match',
            id: match.id,
            petId: match.petId,
            matchedWithPetId: match.matchedWithPetId,
            matchedAt: match.matchedAt
        });
    });

    // Messages
    data.messages.forEach((message: any) => {
        flattened.push({
            type: 'message',
            id: message.id,
            matchId: message.matchId,
            sentAt: message.sentAt,
            content: message.content
        });
    });

    // Get all unique keys
    const allKeys = new Set<string>();
    flattened.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
    });

    // Create header row
    const keys = Array.from(allKeys);
    let csv = keys.join(',') + '\n';

    // Add data rows
    flattened.forEach(item => {
        const row = keys.map(key => {
            const value = item[key];
            // Handle commas and quotes in CSV values
            if (value === undefined || value === null) {
                return '';
            } else if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            } else {
                return String(value);
            }
        });
        csv += row.join(',') + '\n';
    });

    return csv;
}
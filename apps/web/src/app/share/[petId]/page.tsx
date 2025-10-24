/**
 * Dynamic Share Page for Pet Profiles
 * Generates OG cards for social sharing
 */
import { Metadata } from 'next'
import { logger } from '@pawfectmatch/core';
;
import { notFound } from 'next/navigation';
import { PetShareView } from '@/components/social/PetShareView';
// Generate metadata for OG cards
export async function generateMetadata({ params }) {
    try {
        const pet = await getPetData(params.petId);
        if (!pet) {
            return {
                title: 'Pet Not Found - PawfectMatch',
                description: 'This pet profile could not be found.'
            };
        }
        const title = `${pet.name} - ${pet.breed} | PawfectMatch`;
        const description = `Meet ${pet.name}, a ${pet.age}-year-old ${pet.breed} looking for friends! ${pet.bio || 'Find your perfect pet match on PawfectMatch.'}`;
        const imageUrl = pet.photos?.[0] || '/images/default-pet-og.jpg';
        const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${params.petId}`;
        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: `${pet.name} - ${pet.breed}`
                    }
                ],
                url: shareUrl,
                siteName: 'PawfectMatch',
                type: 'website'
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [imageUrl],
                creator: '@pawfectmatch'
            },
            alternates: {
                canonical: shareUrl
            }
        };
    }
    catch (error) {
        logger.error('Error generating metadata:', { error });
        return {
            title: 'PawfectMatch - Find Your Perfect Pet Match',
            description: 'Connect with pet owners and find the perfect match for your furry friend.'
        };
    }
}
// Fetch pet data
async function getPetData(petId) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets/${petId}`, {
            next: { revalidate: 300 } // Cache for 5 minutes
        });
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        return data.pet;
    }
    catch (error) {
        logger.error('Error fetching pet data:', { error });
        return null;
    }
}
export default async function SharePage({ params }) {
    const pet = await getPetData(params.petId);
    if (!pet) {
        notFound();
    }
    return <PetShareView pet={pet}/>;
}
//# sourceMappingURL=page.jsx.map
//# sourceMappingURL=page.jsx.map
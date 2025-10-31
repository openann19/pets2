import React, { useState, useEffect } from "react";
import { useTheme } from "@pawfectmatch/ui/theme/useTheme";
import { Button } from "@pawfectmatch/ui/components/Button";

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  description: string;
  imageUrl?: string;
}

export default function SwipeOrchestrator(){
  const t = useTheme();
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    // Simulate loading pets for swiping
    const timer = setTimeout(() => {
      setPets([
        {
          id: '1',
          name: 'Max',
          breed: 'Golden Retriever',
          age: '2 years old',
          description: 'Friendly and energetic dog who loves to play fetch and go for walks. Perfect companion for active families.'
        },
        {
          id: '2',
          name: 'Luna',
          breed: 'Tabby Cat',
          age: '1 year old',
          description: 'Sweet and cuddly cat who loves to purr and curl up on laps. Great for apartment living.'
        },
        {
          id: '3',
          name: 'Buddy',
          breed: 'Beagle',
          age: '3 years old',
          description: 'Adventurous and curious pup with a great sense of smell. Loves outdoor adventures and belly rubs.'
        }
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLike = () => {
    if (currentPetIndex < pets.length - 1) {
      setCurrentPetIndex(prev => prev + 1);
    } else {
      // Reset to beginning when we run out of pets
      setCurrentPetIndex(0);
    }
  };

  const handlePass = () => {
    if (currentPetIndex < pets.length - 1) {
      setCurrentPetIndex(prev => prev + 1);
    } else {
      // Reset to beginning when we run out of pets
      setCurrentPetIndex(0);
    }
  };

  const currentPet = pets[currentPetIndex];

  const containerStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    minHeight: '100vh',
    padding: '24px'
  };

  const cardStyle = {
    backgroundColor: 'var(--color-card)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
    maxWidth: '400px',
    margin: '0 auto 24px auto'
  };

  const imagePlaceholderStyle = {
    width: '100%',
    height: '250px',
    backgroundColor: 'var(--color-bg)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    border: '2px dashed rgba(255, 255, 255, 0.2)'
  };

  const petNameStyle = {
    fontSize: '28px',
    margin: '0 0 4px 0',
    fontWeight: 'bold'
  };

  const petDetailsStyle = {
    fontSize: '16px',
    margin: '0 0 16px 0',
    opacity: 0.8,
    fontWeight: '500'
  };

  const petDescriptionStyle = {
    fontSize: '16px',
    lineHeight: '1.5',
    margin: '0 0 24px 0'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const
  };

  const progressStyle = {
    textAlign: 'center' as const,
    fontSize: '14px',
    opacity: 0.6,
    marginTop: '16px'
  };

  return (
    <main style={containerStyle}>
      <div style={{maxWidth: '600px', margin: '0 auto'}}>
        <header style={{textAlign: 'center', marginBottom: '32px'}}>
          <h1 style={{
            fontSize: '32px',
            margin: '0 0 8px 0',
            fontWeight: 'bold'
          }}>
            Find Your Match
          </h1>
          <p style={{
            fontSize: '16px',
            margin: 0,
            opacity: 0.8
          }}>
            Swipe right to like, left to pass
          </p>
        </header>

        {loading ? (
          <div style={{
            ...cardStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px'
          }}>
            <div style={{fontSize: '18px'}}>Loading pets...</div>
          </div>
        ) : currentPet ? (
          <article style={cardStyle} role="region" aria-label={`Pet profile for ${currentPet.name}`}>
            <div style={imagePlaceholderStyle}>
              <div style={{fontSize: '48px', opacity: 0.5}} role="img" aria-label="Pet placeholder">🐾</div>
            </div>

            <div>
              <h2 style={petNameStyle}>{currentPet.name}</h2>
              <p style={petDetailsStyle}>
                {currentPet.breed} • {currentPet.age}
              </p>
            </div>

            <p style={petDescriptionStyle}>
              {currentPet.description}
            </p>

            <div style={buttonContainerStyle}>
              <Button
                onClick={handlePass}
                variant="secondary"
                size="lg"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: `2px solid ${t.COLORS.text}`,
                  color: t.COLORS.text,
                  minWidth: '120px'
                }}
                aria-label={`Pass on ${currentPet.name}`}
              >
                Pass ❌
              </Button>
              <Button
                onClick={handleLike}
                variant="primary"
                size="lg"
                style={{
                  backgroundColor: t.COLORS.brand,
                  minWidth: '120px'
                }}
                aria-label={`Like ${currentPet.name}`}
              >
                Like ❤️
              </Button>
            </div>
          </article>
        ) : (
          <div style={{
            ...cardStyle,
            textAlign: 'center',
            padding: '48px 24px'
          }}>
            <h2 style={{marginBottom: '16px', fontSize: '24px'}}>No more pets to swipe!</h2>
            <p style={{margin: 0, opacity: 0.7}}>
              Come back later for more furry friends to match with.
            </p>
          </div>
        )}

        {!loading && pets.length > 0 && (
          <div style={progressStyle}>
            Pet {currentPetIndex + 1} of {pets.length}
          </div>
        )}
      </div>
    </main>
  );
}

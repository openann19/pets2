import React, { useState, useEffect } from "react";
import { useTheme } from "@pawfectmatch/ui/theme/useTheme";
import { FeedList } from "@pawfectmatch/ui/components/FeedList";
import { Button } from "@pawfectmatch/ui/components/Button";

export default function HomeOrchestrator(){
  const t = useTheme();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading pets data
    const timer = setTimeout(() => {
      setPets([
        { id: '1', title: 'Max the Golden Retriever', description: 'Friendly and energetic dog looking for a loving home.' },
        { id: '2', title: 'Luna the Tabby Cat', description: 'Sweet and cuddly cat who loves to purr and play.' },
        { id: '3', title: 'Buddy the Beagle', description: 'Adventurous and curious pup who loves outdoor activities.' }
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setPets([]);
    // Simulate refresh
    setTimeout(() => {
      setPets([
        { id: '4', title: 'Bella the Bulldog', description: 'Gentle giant who loves belly rubs and naps.' },
        { id: '5', title: 'Charlie the Parrot', description: 'Colorful and intelligent bird with lots of personality.' }
      ]);
      setLoading(false);
    }, 1000);
  };

  const containerStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    minHeight: '100vh',
    padding: '24px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
    gap: '16px'
  };

  const titleStyle = {
    fontSize: '32px',
    margin: 0,
    fontWeight: 'bold'
  };

  const descriptionStyle = {
    fontSize: '18px',
    margin: '0 0 16px 0',
    opacity: 0.8,
    maxWidth: '600px'
  };

  return (
    <main style={containerStyle}>
      <div style={{maxWidth: 1200, margin: '0 auto'}}>
        <header style={headerStyle}>
          <h1 style={titleStyle}>Pet Match</h1>
          <Button onClick={handleRefresh} disabled={loading} size="md">
            {loading ? 'Loading...' : 'Refresh Pets'}
          </Button>
        </header>

        <p style={descriptionStyle}>
          Find your perfect pet companion! Browse through our curated selection of loving pets waiting for their forever homes.
        </p>

        <FeedList items={pets} loading={loading} />

        {!loading && pets.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            backgroundColor: 'var(--color-card)',
            borderRadius: '12px',
            marginTop: '24px'
          }}>
            <h2 style={{marginBottom: '16px', fontSize: '24px'}}>No pets available right now</h2>
            <p style={{margin: 0, opacity: 0.7}}>Check back later for more furry friends to match with.</p>
          </div>
        )}
      </div>
    </main>
  );
}

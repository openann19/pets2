import React from 'react';
import { Card } from './Card';
import { Text } from './Text';
import { Stack } from './Stack';

interface FeedItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

interface FeedListProps {
  items?: FeedItem[];
  loading?: boolean;
}

export function FeedList({ items = [], loading = false }: FeedListProps) {
  if (loading) {
    return (
      <Stack spacing="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} style={{ height: 120, backgroundColor: 'var(--color-card)' }}>
            <Text>Loading...</Text>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing="md">
      {items.map((item) => (
        <Card key={item.id} style={{ padding: 16 }}>
          <Stack spacing="sm">
            <Text variant="h3">{item.title}</Text>
            <Text variant="body">{item.description}</Text>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

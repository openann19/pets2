/**
 * UI Component Registry for Showcase
 * Single source of truth for component examples on both web and mobile
 */

import React from 'react';
import { View } from 'react-native';
import { Stack } from './layout/Stack';
import { Button } from './Button';
import { Text } from './Text';
import { Card } from './Card';
import { Badge } from './Badge';
import { Input } from './Input';
import { Switch } from './Switch';
import { Checkbox } from './Checkbox';
import { Avatar } from './Avatar';
import { Radio, RadioGroup } from './Radio';
import { Tag } from './Tag';
import { Divider } from './Divider';
import { Skeleton } from './Skeleton';
import { Sheet } from './Sheet';
import { Toast } from './Toast';

export type ShowcaseItem = {
  id: string;
  title: string;
  description?: string;
  demo: React.ReactNode;
  tags?: string[];
  area?: 'forms' | 'feedback' | 'navigation' | 'content' | 'data' | 'layout';
};

export const showcaseRegistry: ShowcaseItem[] = [
  {
    id: 'button',
    title: 'Button',
    description: 'Primary actions and interactions',
    demo: (
      <View>
        <Stack gap="md">
          <Stack
            direction="row"
            gap="sm"
            wrap
          >
            <Button
              testID="btn-primary"
              title="Primary"
              variant="primary"
              onPress={() => {}}
            />
            <Button
              testID="btn-secondary"
              title="Secondary"
              variant="secondary"
              onPress={() => {}}
            />
            <Button
              testID="btn-outline"
              title="Outline"
              variant="outline"
              onPress={() => {}}
            />
            <Button
              testID="btn-ghost"
              title="Ghost"
              variant="ghost"
              onPress={() => {}}
            />
            <Button
              testID="btn-danger"
              title="Danger"
              variant="danger"
              onPress={() => {}}
            />
          </Stack>
          <Stack
            direction="row"
            gap="sm"
            wrap
          >
            <Button
              testID="btn-sm"
              title="Small"
              size="sm"
              onPress={() => {}}
            />
            <Button
              testID="btn-md"
              title="Medium"
              size="md"
              onPress={() => {}}
            />
            <Button
              testID="btn-lg"
              title="Large"
              size="lg"
              onPress={() => {}}
            />
            <Button
              testID="btn-loading"
              title="Loading"
              loading
              onPress={() => {}}
            />
            <Button
              testID="btn-disabled"
              title="Disabled"
              disabled
              onPress={() => {}}
            />
          </Stack>
        </Stack>
      </View>
    ),
    tags: ['core', 'interactive'],
    area: 'forms',
  },
  {
    id: 'input',
    title: 'Input',
    description: 'Text fields and form inputs',
    demo: (
      <Stack gap="md">
        <Input
          testID="input-default"
          placeholder="Default input"
        />
        <Input
          testID="input-label"
          label="Label"
          placeholder="With label"
        />
        <Input
          testID="input-helper"
          label="With helper text"
          helperText="This is helpful information"
        />
        <Input
          testID="input-error"
          label="Error state"
          error="Please fix this error"
          placeholder="Invalid input"
        />
      </Stack>
    ),
    tags: ['core', 'form'],
    area: 'forms',
  },
  {
    id: 'card',
    title: 'Card',
    description: 'Content containers and surfaces',
    demo: (
      <Stack gap="md">
        <Card
          testID="card-default"
          variant="surface"
        >
          <Text variant="h6">Default Card</Text>
          <Text variant="bodyMuted">This is a basic card with default styling</Text>
        </Card>
        <Card
          testID="card-elevated"
          variant="elevated"
        >
          <Text variant="h6">Elevated Card</Text>
          <Text variant="bodyMuted">Card with elevated shadow for emphasis</Text>
        </Card>
        <Card
          testID="card-outlined"
          variant="outlined"
        >
          <Text variant="h6">Outlined Card</Text>
          <Text variant="bodyMuted">Card with border outline</Text>
        </Card>
      </Stack>
    ),
    tags: ['core', 'layout'],
    area: 'content',
  },
  {
    id: 'badge',
    title: 'Badge',
    description: 'Labels and status indicators',
    demo: (
      <Stack
        direction="row"
        gap="sm"
        wrap
      >
        <Badge
          label="Primary"
          variant="primary"
        />
        <Badge
          label="Secondary"
          variant="secondary"
        />
        <Badge
          label="Success"
          variant="success"
        />
        <Badge
          label="Warning"
          variant="warning"
        />
        <Badge
          label="Danger"
          variant="danger"
        />
        <Badge
          label="Muted"
          variant="muted"
        />
      </Stack>
    ),
    tags: ['data', 'status'],
    area: 'data',
  },
  {
    id: 'text',
    title: 'Text',
    description: 'Typography system',
    demo: (
      <Stack gap="xs">
        <Text
          variant="h1"
          testID="text-h1"
        >
          Heading 1
        </Text>
        <Text
          variant="h2"
          testID="text-h2"
        >
          Heading 2
        </Text>
        <Text
          variant="h3"
          testID="text-h3"
        >
          Heading 3
        </Text>
        <Text
          variant="body"
          testID="text-body"
        >
          Body text for regular content
        </Text>
        <Text
          variant="bodyMuted"
          testID="text-muted"
        >
          Muted text for secondary content
        </Text>
        <Text
          variant="caption"
          testID="text-caption"
        >
          Caption for small details
        </Text>
      </Stack>
    ),
    tags: ['core', 'typography'],
    area: 'content',
  },
  {
    id: 'stack',
    title: 'Stack',
    description: 'Layout component for spacing',
    demo: (
      <Stack gap="md">
        <Stack
          direction="row"
          gap="md"
        >
          <Card
            variant="surface"
            padding="md"
          >
            <Text>Item 1</Text>
          </Card>
          <Card
            variant="surface"
            padding="md"
          >
            <Text>Item 2</Text>
          </Card>
          <Card
            variant="surface"
            padding="md"
          >
            <Text>Item 3</Text>
          </Card>
        </Stack>
        <Stack gap="sm">
          <Text variant="body">Vertical stack with gap</Text>
          <Text variant="bodyMuted">Gap sizes: xs, sm, md, lg, xl, 2xl</Text>
        </Stack>
      </Stack>
    ),
    tags: ['core', 'layout'],
    area: 'layout',
  },
  {
    id: 'switch',
    title: 'Switch',
    description: 'Toggle switches for settings',
    demo: (
      <Stack gap="md">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Switch
            testID="switch-on"
            value={true}
            onValueChange={() => {}}
          />
          <Text variant="body">Notifications</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Switch
            testID="switch-off"
            value={false}
            onValueChange={() => {}}
          />
          <Text variant="body">Dark Mode</Text>
        </View>
      </Stack>
    ),
    tags: ['core', 'form'],
    area: 'forms',
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    description: 'Multi-select checkboxes',
    demo: (
      <Stack gap="sm">
        <Checkbox
          testID="checkbox-checked"
          label="Accepted terms"
          checked={true}
          onValueChange={() => {}}
        />
        <Checkbox
          testID="checkbox-unchecked"
          label="Subscribe to newsletter"
          checked={false}
          onValueChange={() => {}}
        />
        <Checkbox
          testID="checkbox-disabled"
          label="Disabled option"
          checked={false}
          onValueChange={() => {}}
          disabled
        />
      </Stack>
    ),
    tags: ['core', 'form'],
    area: 'forms',
  },
  {
    id: 'avatar',
    title: 'Avatar',
    description: 'User profile pictures',
    demo: (
      <Stack
        direction="row"
        gap="md"
        align="center"
      >
        <Avatar
          initials="AB"
          size="xs"
        />
        <Avatar
          initials="CD"
          size="sm"
        />
        <Avatar
          initials="EF"
          size="md"
        />
        <Avatar
          initials="GH"
          size="lg"
        />
        <Avatar
          initials="IJ"
          size="xl"
        />
      </Stack>
    ),
    tags: ['core', 'content'],
    area: 'content',
  },
  {
    id: 'radio',
    title: 'Radio',
    description: 'Single-choice radio buttons',
    demo: (
      <Stack gap="sm">
        <Radio
          testID="radio-option-1"
          label="Option 1"
          value="1"
          selected={true}
          onPress={() => {}}
        />
        <Radio
          testID="radio-option-2"
          label="Option 2"
          value="2"
          selected={false}
          onPress={() => {}}
        />
      </Stack>
    ),
    tags: ['core', 'form'],
    area: 'forms',
  },
  {
    id: 'tag',
    title: 'Tag',
    description: 'Chip-style tags',
    demo: (
      <Stack
        direction="row"
        gap="xs"
        wrap
      >
        <Tag
          label="Primary"
          variant="primary"
        />
        <Tag
          label="Secondary"
          variant="secondary"
        />
        <Tag
          label="Outline"
          variant="outline"
        />
        <Tag
          label="Ghost"
          variant="ghost"
        />
        <Tag
          label="Closable"
          closable
          onClose={() => {}}
        />
      </Stack>
    ),
    tags: ['data', 'chip'],
    area: 'data',
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Section separators',
    demo: (
      <Stack
        gap="md"
        style={{ width: '100%' }}
      >
        <Text>Content above</Text>
        <Divider />
        <Text>Content below</Text>
        <Divider
          variant="dashed"
          spacing={16}
        />
        <Text>More content</Text>
      </Stack>
    ),
    tags: ['core', 'layout'],
    area: 'layout',
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    description: 'Loading placeholders',
    demo: (
      <Stack
        gap="sm"
        style={{ width: '100%' }}
      >
        <Skeleton
          width="100%"
          height={20}
        />
        <Skeleton
          width="80%"
          height={20}
        />
        <Skeleton
          width="60%"
          height={20}
        />
        <Skeleton
          variant="circle"
          width={50}
          height={50}
        />
      </Stack>
    ),
    tags: ['feedback', 'loading'],
    area: 'feedback',
  },
];

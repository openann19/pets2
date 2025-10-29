import type { Meta, StoryObj } from '@storybook/react';
import { ListItem, type ListItemProps } from '../../components/ui/v2/ListItem';
import { Card } from '../../components/ui/v2/Card';
import { Stack } from '../../components/ui/v2/layout/Stack';

const meta: Meta<typeof ListItem> = {
  title: 'UI v2/ListItem',
  component: ListItem,
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'Profile',
    subtitle: 'View your profile',
    icon: 'person-outline',
    type: 'navigation',
  },
};

export default meta;

type Story = StoryObj<typeof ListItem>;

export const Navigation: Story = {
  args: {
    onPress: () => {},
  },
};

export const Toggle: Story = {
  args: {
    icon: 'notifications-outline',
    title: 'Push notifications',
    subtitle: 'Receive activity updates',
    type: 'toggle',
    value: true,
    onValueChange: () => {},
  },
};

export const Destructive: Story = {
  args: {
    icon: 'trash-outline',
    title: 'Delete account',
    subtitle: 'This is permanent',
    destructive: true,
    type: 'action',
    onPress: () => {},
  },
};

export const Grouped: Story = {
  render: () => (
    <Card>
      <Stack spacing="md">
        <ListItem title="Profile" subtitle="View your profile" icon="person-outline" onPress={() => {}} />
        <ListItem
          title="Push Notifications"
          subtitle="Receive activity updates"
          icon="notifications-outline"
          type="toggle"
          value
          onValueChange={() => {}}
        />
        <ListItem
          title="Delete Account"
          subtitle="This is permanent"
          icon="trash-outline"
          destructive
          type="action"
          onPress={() => {}}
        />
      </Stack>
    </Card>
  ),
};

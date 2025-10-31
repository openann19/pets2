export interface DemoPremiumState {
  userId: string;
  isPremium: boolean;
  renewedAt: string;
}

const isoHoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

export const demoPremiumStates: DemoPremiumState[] = [
  { userId: 'userA', isPremium: true, renewedAt: isoHoursAgo(5) },
  { userId: 'userB', isPremium: false, renewedAt: isoHoursAgo(240) },
];
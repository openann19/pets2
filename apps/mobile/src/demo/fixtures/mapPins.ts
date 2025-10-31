export interface DemoMapPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: 'dog-park' | 'vet' | 'event';
}

export const demoMapPins: DemoMapPin[] = [
  { id: 'pin-park', lat: 37.7749, lng: -122.4194, label: 'Mission Creek Dog Park', type: 'dog-park' },
  { id: 'pin-vet', lat: 37.7849, lng: -122.4094, label: 'SOMA Veterinary Clinic', type: 'vet' },
];
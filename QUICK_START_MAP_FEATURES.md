# Quick Start: Map Activity Features

## Overview
The Map Activity feature allows users to share real-time pet activities on an interactive map with heatmap visualization.

## Features Enabled

### 1. Real-Time Activity Sharing ✨
- Tap `fab-create-activity` FAB (bottom right)
- Select pet and activity type (walk, play, feeding, rest, training)
- Optional: Add message and adjust radius
- Submit to broadcast to all users on the map

### 2. Interactive Heatmap 🌡️
- Auto-updates every 30 seconds via socket
- Shows areas of high pet activity concentration
- Color gradient: Green → Yellow → Orange → Red

### 3. Pin Details Modal 👆
- Tap any marker on map
- See activity details and location
- Actions available:
  - ❤️ **Like** - Navigate to Swipe screen
  - 💬 **Chat** - Navigate to Matches screen  
  - 🧭 **Directions** - Open in Google Maps

### 4. Filter Controls ⚙️
- Tap `btn-filters` to open filter panel
- Filter by activity type
- Adjust radius (distance)
- Toggle map layers

## Test ID Reference

```typescript
// Map & Controls
"map-view" - Main MapView
"btn-filters" - Filter toggle button
"fab-create-activity" - Create activity FAB
"fab-locate" - Re-center on user
"fab-ar" - AR view button

// Create Activity Modal
"create-activity-modal" - Modal container
"chip-pet-0", "chip-pet-{id}" - Pet selection
"chip-activity-{type}" - Activity type
"toggle-share-map" - Share to map toggle
"btn-radius-dec/inc" - Radius adjust
"btn-start-activity" - Submit button
"btn-close-create-activity" - Close button

// Pin Details
"pin-details-modal" - Modal container
"marker-{id}" - Individual markers
"btn-like-pin" - Like button
"btn-chat-pin" - Chat button
"btn-directions-pin" - Directions button
"btn-close-pin" - Close button
```

## API Endpoints

### Client API
```typescript
// Start activity
POST /api/pets/activity/start
Body: { petId, activity, message?, location, radius?, shareToMap? }

// End activity  
POST /api/pets/activity/end
Body: { activityId }

// Get activity history
GET /api/pets/activity/history?petId={id}
```

### Home Stats
```typescript
GET /api/home/stats
Returns: { matches: number, messages: number, pets: number }
```

## Socket Events

### Client → Server
```typescript
socket.emit("join_map", { userId });
socket.emit("activity:start", { petId, activity, location, message });
socket.emit("activity:end", { pinId });
socket.emit("request:initial-pins");
socket.emit("nearby:request", { latitude, longitude, radius });
```

### Server → Client
```typescript
socket.on("pin:update", (pin) => { ... });
socket.on("pulse_update", (pin) => { ... }); // backward compatibility
socket.on("pin:remove", (pinId) => { ... });
socket.on("heatmap:update", (data) => { ... });
socket.on("pins:initial", (pins) => { ... });
socket.on("nearby:response", (pins) => { ... });
```

## E2E Test

Run with:
```bash
cd apps/mobile
npm run e2e:e2e:map.activity
```

Tests:
1. ✅ Navigate to map
2. ✅ Open create modal
3. ✅ Create activity with pet
4. ✅ Verify marker appears
5. ✅ Tap marker for details
6. ✅ Test Like action
7. ✅ Test filter controls

## Database Schema

### Activity Record
```typescript
interface ActivityRecord {
  _id: string;
  petId: string;
  activity: "walk" | "play" | "feeding" | "rest" | "training";
  message?: string;
  lat: number;
  lng: number;
  radius?: number;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}
```

## Configuration

### Environment Variables
```bash
# Client
EXPO_PUBLIC_API_URL=http://localhost:5001
EXPO_PUBLIC_SOCKET_URL=http://localhost:5001

# Server
CLIENT_URL=http://localhost:3000
MAP_DEMO_MODE=true  # For demo pins in development
```

## Troubleshooting

### No Markers Appearing
1. Check location permissions enabled
2. Verify socket connection (check logs)
3. Ensure `/api/pets/activity/start` returns success
4. Check MapScreen.tsx has proper socket listeners

### Heatmap Not Updating
1. Verify `heatmap:update` event listener in useMapScreen
2. Check server is broadcasting heatmap data
3. Confirm MapView has HeatmapOverlay component rendered

### Callbacks Not Working
1. Ensure MapScreen passes `onLike` and `onChat` to PinDetailsModal
2. Check navigation prop is available in MapScreen
3. Verify callback functions don't throw errors

## Next Steps

✅ All features implemented
✅ Socket events working
✅ Database integration complete
✅ E2E tests written
✅ Ready for production


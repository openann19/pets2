/**
 * 🎯 SHARED ELEMENT TRANSITION USAGE GUIDE
 * 
 * Phase 3: Complete guide for implementing shared element transitions
 */

/**
 * ===== USAGE EXAMPLES =====
 * 
 * 1. Card → Detail Screen Transition
 * 
 * ```tsx
 * // In SwipeScreen or MatchesScreen (Source)
 * import { SharedImage, SharedView } from '@/components/shared/SharedElementComponents';
 * import { SHARED_ELEMENT_IDS } from '@/foundation/shared-element';
 * import { useSharedElementTransition } from '@/foundation/shared-element';
 * 
 * function PetCard({ pet, onPress }: { pet: Pet; onPress: () => void }) {
 *   const { navigateWithTransition } = useSharedElementTransition();
 *   
 *   const handlePress = async () => {
 *     await navigateWithTransition({
 *       imageId: `${SHARED_ELEMENT_IDS.petImage}-${pet.id}`,
 *       imageUri: pet.photos[0],
 *       navigate: onPress,
 *     });
 *   };
 *   
 *   return (
 *     <Pressable onPress={handlePress}>
 *       <SharedImage
 *         id={`${SHARED_ELEMENT_IDS.petImage}-${pet.id}`}
 *         type="source"
 *         source={{ uri: pet.photos[0] }}
 *         style={styles.cardImage}
 *       />
 *       <SharedView
 *         id={`${SHARED_ELEMENT_IDS.petName}-${pet.id}`}
 *         type="source"
 *       >
 *         <Text>{pet.name}</Text>
 *       </SharedView>
 *     </Pressable>
 *   );
 * }
 * 
 * // In PetProfileScreen (Destination)
 * function PetProfileScreen({ route }: { route: RouteProp<RootStackParamList, 'PetProfile'> }) {
 *   const { petId } = route.params;
 *   const pet = usePet(petId);
 *   
 *   return (
 *     <ScrollView>
 *       <SharedImage
 *         id={`${SHARED_ELEMENT_IDS.petImage}-${pet.id}`}
 *         type="destination"
 *         source={{ uri: pet.photos[0] }}
 *         style={styles.heroImage}
 *       />
 *       <SharedView
 *         id={`${SHARED_ELEMENT_IDS.petName}-${pet.id}`}
 *         type="destination"
 *       >
 *         <Text style={styles.detailName}>{pet.name}</Text>
 *       </SharedView>
 *     </ScrollView>
 *   );
 * }
 * ```
 * 
 * 2. Image → Full Screen Viewer
 * 
 * ```tsx
 * // In ChatScreen (Source)
 * function ChatImage({ imageUri, onPress }: { imageUri: string; onPress: () => void }) {
 *   return (
 *     <Pressable onPress={onPress}>
 *       <SharedImage
 *         id={`chat-image-${imageUri}`}
 *         type="source"
 *         source={{ uri: imageUri }}
 *         style={styles.thumbnail}
 *       />
 *     </Pressable>
 *   );
 * }
 * 
 * // In FullScreenImageViewer (Destination)
 * function FullScreenImageViewer({ imageUri }: { imageUri: string }) {
 *   return (
 *     <View style={styles.fullscreen}>
 *       <SharedImage
 *         id={`chat-image-${imageUri}`}
 *         type="destination"
 *         source={{ uri: imageUri }}
 *         style={styles.fullscreenImage}
 *       />
 *     </View>
 *   );
 * }
 * ```
 * 
 * 3. Profile Picture → Profile Screen
 * 
 * ```tsx
 * // In MatchCard (Source)
 * function MatchCard({ match }: { match: Match }) {
 *   return (
 *     <Pressable onPress={() => navigation.navigate('Profile', { userId: match.userId })}>
 *       <SharedImage
 *         id={`profile-avatar-${match.userId}`}
 *         type="source"
 *         source={{ uri: match.avatar }}
 *         style={styles.avatar}
 *       />
 *     </Pressable>
 *   );
 * }
 * 
 * // In ProfileScreen (Destination)
 * function ProfileScreen({ route }: { route: RouteProp<RootStackParamList, 'Profile'> }) {
 *   const { userId } = route.params;
 *   const user = useUser(userId);
 *   
 *   return (
 *     <View>
 *       <SharedImage
 *         id={`profile-avatar-${userId}`}
 *         type="destination"
 *         source={{ uri: user.avatar }}
 *         style={styles.profileAvatar}
 *       />
 *     </View>
 *   );
 * }
 * ```
 * 
 * ===== BEST PRACTICES =====
 * 
 * 1. **Unique IDs**: Always use unique IDs combining element type and entity ID
 *    - Good: `pet-image-${pet.id}`
 *    - Bad: `pet-image`
 * 
 * 2. **Prefetch Images**: Always prefetch destination images before navigation
 *    ```tsx
 *    await prefetchPetImage(pet.photos[0]);
 *    navigation.navigate('PetProfile', { petId: pet.id });
 *    ```
 * 
 * 3. **Consistent Sizing**: Use similar aspect ratios for source/destination
 *    - Helps prevent jarring transitions
 * 
 * 4. **Handle Interruptions**: Clear registry on navigation cancellation
 *    ```tsx
 *    const handleBack = () => {
 *      handleGestureCancellation();
 *      navigation.goBack();
 *    };
 *    ```
 * 
 * 5. **Reduced Motion**: System automatically respects reduced motion
 *    - Transitions become instant when reduced motion is enabled
 * 
 * ===== PERFORMANCE TIPS =====
 * 
 * 1. **Measure Once**: Layout measurements are cached
 * 2. **Prefetch Early**: Start prefetching on press start, not press end
 * 3. **Limit Elements**: Only transition 1-2 elements per screen for best performance
 * 4. **Use Spring**: Spring animations feel more natural than timing
 * 
 * ===== TROUBLESHOOTING =====
 * 
 * Q: Transition doesn't animate
 * A: Ensure both source and destination have matching IDs and are rendered
 * 
 * Q: Transition is janky
 * A: Check that images are prefetched and layouts are measured before transition
 * 
 * Q: Elements don't match position
 * A: Verify source and destination layouts are measured correctly
 * 
 * Q: Transition is interrupted
 * A: Ensure handleGestureCancellation() is called on back gesture
 */

export const SHARED_ELEMENT_GUIDE = {
  examples: 'See above',
  bestPractices: 'See above',
  troubleshooting: 'See above',
};

export default SHARED_ELEMENT_GUIDE;


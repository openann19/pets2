# 📸 PawfectMatch Mobile - Upload & Verification Pipeline

## Overview
What users can upload after registration and what verification processes exist.

---

## Stage 1: Permissions Required

### For Photo Uploads:
```55:66:apps/mobile/src/components/PhotoUploadComponent.tsx
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload photos.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };
```

**Permissions Needed**:
1. ✅ **Camera Roll Access** - To select photos from gallery
2. ✅ **Camera Access** - To take new photos (optional)
3. ✅ **Storage Permission** - To save uploaded photos locally before upload

---

## Stage 2: Photo Uploads (Pet Profiles)

### What Can Users Upload?

#### **Pet Photos** - Up to 6 photos per pet
```42:75:apps/mobile/src/components/PhotoUploadComponent.tsx
const PhotoUploadComponent: React.FC<PhotoUploadComponentProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 6,
  title = "Pet Photos",
}) => {
```

**Photo Upload Process**:
1. User clicks "Add Photo" button
2. System requests media library permission
3. User picks photo from gallery or takes new photo
4. Photo is selected and added to array
5. First photo becomes primary automatically
6. Photos are stored locally until pet profile is saved

**Upload Flow**:
```68:107:apps/mobile/src/components/PhotoUploadComponent.tsx
  const pickImage = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        "Photo Limit",
        `You can only upload up to ${maxPhotos} photos.`,
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsUploading(true);
    scaleValue.value = withSpring(0.95, SPRING_CONFIG);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: Photo = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          isPrimary: photos.length === 0, // First photo is primary
        };

        onPhotosChange([...photos, newPhoto]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    } finally {
      setIsUploading(false);
      scaleValue.value = withSpring(1, SPRING_CONFIG);
    }
  };
```

### Photo Upload API Call:
```104:142:apps/mobile/src/hooks/domains/profile/usePhotoManagement.ts
  const uploadPhotos = useCallback(
    async (petId: string): Promise<boolean> => {
      if (photos.length === 0) {
        Alert.alert("No photos", "Please add at least one photo");
        return false;
      }

      setIsLoading(true);

      try {
        const formData = new FormData();
        photos.forEach((photo, index) => {
          formData.append("photos", {
            uri: photo.uri,
            type: photo.type,
            name: photo.fileName || `photo_${index}.jpg`,
          } as unknown as Blob);

          if (photo.isPrimary) {
            formData.append("primaryIndex", String(index));
          }
        });

        await matchesAPI.uploadPetPhotos(petId, formData);
        logger.info("Photos uploaded successfully", {
          petId,
          photoCount: photos.length,
        });
        return true;
      } catch (err) {
        logger.error("Failed to upload photos", { error: err, petId });
        Alert.alert("Error", "Failed to upload photos. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [photos],
  );
```

**Backend API Call**:
```359:368:apps/mobile/src/services/api.ts
  // Upload pet photos
  uploadPetPhotos: async (petId: string, photos: FormData): Promise<Pet> => {
    return resolveData(
      apiClient.post<Pet>(`/pets/${petId}/photos`, photos, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      "Failed to upload photos",
    );
  },
```

---

## Stage 3: AI Photo Analysis (Automatic)

### What Happens After Upload?

Photos are **automatically analyzed** by AI when uploaded:

#### Photo Quality Analysis
```4:34:apps/mobile/src/services/aiPhotoService.ts
export interface PhotoAnalysisResult {
  labels: Array<{ name: string | undefined; confidence: number | undefined }>;
  breedCandidates: Array<{ name: string; confidence: number }>;
  quality: {
    dims: { width?: number; height?: number };
    exposure: number;
    contrast: number;
    sharpness: number;
  };
  overall: number;
  isPet: boolean;
  suggestions: string[];
}

export async function analyzePhotoFromUri(localUri: string, contentType = "image/jpeg"): Promise<PhotoAnalysisResult> {
  // Upload photo to S3
  const { data } = await api.post<{ key: string; url: string }>("/uploads/photos/presign", { contentType });
  
  await FileSystem.uploadAsync(data.url, localUri, {
    httpMethod: "PUT",
    headers: { "Content-Type": contentType },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  // Analyze the uploaded photo
  const { data: analysis } = await api.post<{ data: PhotoAnalysisResult }>("/ai/analyze-photo", { 
    s3Key: data.key 
  });
  
  return analysis;
}
```

### AI Analysis Checks:

1. **Pet Detection** - Confirms it's actually a pet photo
2. **Breed Identification** - Detects breed(s) with confidence scores
3. **Quality Scoring** - Evaluates:
   - Lighting quality
   - Clarity/sharpness
   - Exposure levels
   - Composition
4. **Health Indicators** - Assesses:
   - Coat condition
   - Eye appearance
   - Posture
   - Energy level
5. **Suggestions** - Provides recommendations for better photos

### Full AI Photo Analysis Results:
```814:841:apps/mobile/src/services/api.ts
  // Analyze pet photos
  analyzePhotos: async (
    photos: string[],
  ): Promise<{
    breed_analysis: {
      primary_breed: string;
      confidence: number;
      secondary_breeds?: Array<{ breed: string; confidence: number }>;
    };
    health_assessment: {
      age_estimate: number;
      health_score: number;
      recommendations: string[];
    };
    photo_quality: {
      overall_score: number;
      lighting_score: number;
      composition_score: number;
      clarity_score: number;
    };
    matchability_score: number;
    ai_insights: string[];
  }> => {
    return request("/ai/analyze-photos", {
      method: "POST",
      body: { photos },
    });
  },
```

---

## Stage 4: Admin Review (For Uploads)

### Upload Moderation System

**Types of Uploads Tracked**:
```30:51:apps/mobile/src/screens/admin/AdminUploadsScreen.tsx
interface Upload {
  id: string;
  userId: string;
  userName: string;
  petId?: string;
  petName?: string;
  type: "profile" | "pet" | "verification";
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  flagged: boolean;
  flagReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  metadata?: {
    fileSize: number;
    dimensions?: { width: number; height?: number };
    contentType: string;
  };
}
```

**Upload Statuses**:
- 🟡 **pending** - Waiting for admin review
- ✅ **approved** - Passed moderation
- ❌ **rejected** - Failed moderation (with reason)

**Admin Can**:
- Review all uploaded photos
- Approve or reject uploads
- Flag inappropriate content
- Provide rejection reasons
- View metadata (file size, dimensions, etc.)

---

## Stage 5: Verification System (Optional)

### What Verification Documents Are Supported?

**Verification Types**:
```25:51:apps/mobile/src/screens/admin/AdminVerificationsScreen.tsx
interface Verification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "identity" | "pet_ownership" | "veterinary" | "breeder";
  status: "pending" | "approved" | "rejected" | "requires_info";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  documents: {
    id: string;
    type:
      | "photo_id"
      | "pet_registration"
      | "vet_certificate"
      | "breeder_license"
      | "other";
    url: string;
    name: string;
  }[];
  notes?: string;
  rejectionReason?: string;
  additionalInfoRequested?: string;
  priority: "low" | "medium" | "high";
  expiresAt?: string;
}
```

### Verification Types Available:

1. **Identity Verification** (`photo_id`)
   - Government-issued ID
   - Proof of identity

2. **Pet Ownership Verification** (`pet_registration`)
   - Pet registration documents
   - Proof of ownership

3. **Veterinary Verification** (`vet_certificate`)
   - Veterinary certificates
   - Health records

4. **Breeder Verification** (`breeder_license`)
   - Breeder licenses
   - Business registration

5. **Other Documents** (`other`)
   - Custom document types

### Verification Status Flow:

```
┌─────────────────────────────────────────────────────────────┐
│                  VERIFICATION FLOW                            │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          User Submits Verification Documents                │
│  - Upload photo ID, pet registration, certificates          │
│  - Provide additional information if needed                │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     Status: pending                         │
│  Admin reviews documents                                    │
└──────────────────────┬────────────────────────────────────────┘
                       │
         ┌────────────┴────────────┐
         ▼                          ▼
┌──────────────────┐       ┌───────────────────┐
│ Status: requires_info  │       │ Status: approved  │
│ Admin requests more    │       │ Verification       │
│ information             │       │ completed!          │
└────────────┬───────────┘       └────────────────────┘
              │
              ▼
       ┌──────────────────┐
       │ Status: rejected │
       │ With reason      │
       └──────────────────┘
```

### ⚠️ Important Notes:

1. **Verification is NOT currently enforced** on the mobile app
   - No verification screen found in user-facing screens
   - Verification admin screens exist but seem to be backend/admin only
   - Users can upload photos without verification

2. **Photo Upload is Primary Feature**
   - Users can upload pet photos immediately after creating account
   - No verification required to upload photos
   - Photos go through admin review queue

3. **Optional Verification System**
   - Verification documents can be uploaded (if admin feature exists)
   - Verification status tracked in backend
   - Admin can review verification submissions

---

## Complete Upload Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER WANTS TO UPLOAD                       │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STAGE 1: Request Permissions                    │
│  System requests:                                            │
│  ✅ Camera Roll Access                                       │
│  ✅ Camera Access (optional)                                 │
│  ✅ Storage Permission                                       │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STAGE 2: Photo Selection                        │
│  User can:                                                   │
│  📸 Pick from gallery (ImagePicker)                         │
│  📷 Take new photo (Camera)                                 │
│  🎨 Edit crop & quality (auto 4:3 aspect)                   │
│  📝 Quality: 0.8 (compressed)                                │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STAGE 3: Photo Validation                      │
│  ✅ Check photo limit (max 6 per pet)                       │
│  ✅ Set primary photo (first = primary)                     │
│  ✅ Store locally in state                                  │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STAGE 4: User Submits Pet Profile              │
│  When user clicks "Create Pet Profile" button               │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STAGE 5: API Upload                             │
│  - Create pet via /pets endpoint                            │
│  - Get petId                                                 │
│  - Upload photos via /pets/{petId}/photos                   │
│  - Send multipart/form-data                                 │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STAGE 6: AI Analysis (Automatic)                │
│  🤖 AI analyzes uploaded photos                             │
│  - Detects breed with confidence                             │
│  - Assesses photo quality                                   │
│  - Checks health indicators                                  │
│  - Suggests improvements                                     │
│  - Validates it's actually a pet                              │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STAGE 7: Admin Review Queue                    │
│  Admin Dashboard shows:                                     │
│  📋 All uploads with status                                 │
│  🔍 Upload type (profile/pet/verification)                   │
│  🚩 Flagged content                                         │
│  ✅ Approve / ❌ Reject buttons                             │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Photo Status Update                       │
│  - Pending → Approved (visible to users)                   │
│  - Pending → Rejected (with reason)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

### ✅ What Users CAN Upload:
1. **Pet Photos** - Up to 6 photos per pet
2. **User Profile Photos** - For user profiles
3. **Verification Documents** (if feature enabled):
   - Photo ID
   - Pet registration
   - Veterinary certificates
   - Breeder licenses

### 🔐 Permissions Required:
1. **Camera Roll Access** - Required for photo uploads
2. **Camera Access** - Optional, for taking new photos
3. **Storage Permission** - Automatic with Expo

### 🤖 AI Analysis (Automatic):
- Breed detection
- Photo quality assessment
- Health indicator check
- Pet validation
- Improvement suggestions

### 📋 Admin Review (Automatic):
- All uploads go through moderation queue
- Admin can approve/reject photos
- Content moderation for inappropriate content
- Quality control

### ⚠️ Current State:
- **Verification is NOT enforced** - Users can upload photos without verification
- **Photo uploads are immediate** - No waiting period
- **Admin review is backend only** - Users don't see review status in mobile app
- **No user-facing verification screen** found in mobile app

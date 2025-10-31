#\!/bin/bash

# List of screens to create
SCREENS=(
  "ChatScreen:Chat with your matches"
  "PetProfileScreen:View pet profiles"
  "SettingsScreen:App settings"
  "PremiumScreen:Premium features"
  "AIBioScreen:AI-generated pet bio"
  "AICompatibilityScreen:AI compatibility analysis"
  "AIPhotoAnalyzerScreen:AI photo analysis"
  "MyPetsScreen:Your pets"
  "CreatePetScreen:Add a new pet"
  "MapScreen:Find pets on map"
  "MemoryWeaveScreen:Memory sharing"
  "StoriesScreen:Pet stories"
  "LeaderboardScreen:Top users"
  "CommunityScreen:Community features"
)

# Create each screen
for screen in "${SCREENS[@]}"; do
  name=$(echo $screen | cut -d: -f1)
  description=$(echo $screen | cut -d: -f2)
  
  cat > ${name}.tsx << SCREEN_EOF
import React from 'react';

const ${name}: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>${name}</h1>
      <p>${description}</p>
    </div>
  );
};

export default ${name};
SCREEN_EOF

done

# Create admin directory and dashboard
mkdir -p admin
cat > admin/AdminDashboard.tsx << 'ADMIN_EOF'
import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <p>Administrative controls</p>
      <div style={{ marginTop: '20px' }}>
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px' }}>
          User Management
        </div>
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px' }}>
          Analytics
        </div>
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px' }}>
          Moderation Tools
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
ADMIN_EOF

echo "All screens created successfully\!"

The Sentient Pet App: The Master Blueprint
I. Core Philosophy & Mandate
Our goal is to create an application that feels alive, tactile, and exceptionally polished. We are moving beyond a merely functional product to one that is a delight to use. This document is the single source of truth. All implementation must adhere strictly to the rules and specifications within. The provided animation prototypes serve as the "gold standard" and visual specification for the required level of quality. Deviation is not permitted.

II. Architectural Mandates (Non-Negotiable)
This is the foundation upon which everything is built. Adherence is mandatory.
Monorepo Architecture: The project must use an Nx or Turborepo monorepo with pnpm workspaces.
packages/core: For all platform-agnostic logic: Zod schemas, TypeScript types, API client instances, and Zustand state management stores.
packages/ui: For shared, headless UI logic (e.g., using react-aria).
apps/web (Next.js) & apps/mobile (React Native/Expo): For platform-specific rendering.
Configuration: Use shared tsconfig.json and ESLint configurations at the root to enforce consistency across the entire monorepo.
State Management:
Server State: React Query is mandatory for all asynchronous server state. All API calls must be wrapped in custom hooks (useMatches, useProfile).
Client State: Zustand is mandatory for all global client state (e.g., auth status, theme). Local component state should use useState or useReducer.
Form Management: React Hook Form with zodResolver is mandatory for all forms. Schemas defined in packages/core. Manual form state is forbidden.
Animation: React Native Reanimated (Mobile) and Framer Motion (Web) are the only approved animation libraries. All animations must use spring physics, not duration-based easing.
API Design: All APIs must be RESTful and adhere to the schemas defined here. The backend must be efficient, preventing client-side waterfalls.
III. Feature Implementation Blueprint
This section details the implementation of every feature required to move from the current state to a fully-realized, innovative application.

Journey 0: The Public Landing Page & Brand Identity (NEW)
Target State: To convert visitors into registered users by clearly communicating the app's unique value proposition. The page must be visually stunning, extremely fast, and perfectly responsive, serving as the "front door" to our premium experience.
Official Page Copy & Content (Mandatory)
Navigation: PawfectMatch logo, Login button, Sign Up button.
Hero Section:
Headline: Find Your Pet's Pawfect Match
Sub-headline: Connect with pet owners nearby for adoption, mating, and playdates. Our AI-powered platform makes finding the perfect companion easy and safe.
Primary CTA: Start Matching
Secondary CTA: I Have an Account
Feature Callouts Section:
Headline: Why Choose PawfectMatch?
Sub-headline: Our platform combines cutting-edge AI technology with a passionate community of pet lovers to create the best matching experience.
Features: Smart Matching, Real-Time Chat, Location-Based, Premium Features, Safe Community, Trusted Platform. (Each with its approved description).
Success Stories / Testimonials Section:
Headline: Success Stories
Content: Feature the testimonials from Sarah Johnson, Mike Chen, and Emily Rodriguez, exactly as provided.
Final CTA Section:
Headline: Ready to Find Your Pet's Perfect Match?
CTA: Get Started Now
Footer: Include Platform and Support links, the brand mission statement, and copyright information.
Ultra-Detailed Implementation:
Technology: The landing page must be built using Next.js for Server-Side Rendering (SSR) to ensure optimal SEO and fast initial load times.
Performance: All images must be optimized (e.g., converted to .webp format) and served via the Next.js <Image> component for automatic optimization. The page must achieve a Lighthouse score of 95+ on Performance.
Animation: All sections must have subtle, animated entrances using Framer Motion's whileInView prop. Interactive elements must have hover and press animations.
Journey 1: User Onboarding & Sign-Up Flow
Target State: A seamless, intelligent, and personalized onboarding experience that makes creating a rich profile effortless and delightful.
AI-Assisted Profile Creation (Priority P0)
Ultra-Detailed Implementation:
UI Flow: During onboarding, after the user names their pet, the UI will present a simple keyword input. The user can add tags like "cuddly," "loves fetch," "energetic."
Backend API: Create a new endpoint: POST /api/ai/generate-bio.
Request Body: { keywords: string[] }
Logic: The backend constructs a detailed prompt for the Gemini API: "Act as a creative copywriter for a pet social app. Write a fun, short bio (3-4 sentences) for a pet that is [keywords]. Use an enthusiastic and friendly tone. Do not use placeholder names."
Response Body: { bio: string }
Client-Side: The client calls this endpoint. While waiting, a beautiful loading animation is shown. The generated bio populates the textarea, and the user can then edit it.
Smart Photo Curation (Priority P0)
Ultra-Detailed Implementation:
UI Flow: The user uploads 3-5 photos. After upload, each photo is displayed in a "curation view."
Backend API: Create a new endpoint: POST /api/ai/analyze-photos.
Request Body: { photoUrls: string[] }
Logic: For each URL, the backend makes a call to the Gemini Vision API with the prompt: "Analyze this pet photo based on the following criteria and return a JSON object with scores from 1 to 10: { clarity: number, composition: number, isSinglePet: boolean, faceVisible: boolean }. Is this a good main profile picture?"
Response Body: { results: { url: string, scores: {...}, suggestion: string }[] }
Client-Side: The client displays the results. The photo with the highest combined score is highlighted with a "Best Photo!" badge and a subtle glowing border.
Personalized Onboarding (Priority P1)
Ultra-Detailed Implementation: After the user selects their pet's species (e.g., "Dog"), the subsequent onboarding steps are tailored. The client will conditionally render different copy and suggestions.
Example (Dog): The UI will show a tip: "Great! High-quality photos of dogs playing outside get the most attention."
Example (Cat): The UI will show: "Awesome! Well-lit photos of cats in their favorite indoor spot are always a hit."
Journey 2: Dashboard / Home Screen
Target State: A living, dynamic hub that feels personal, context-aware, and connected to the real world.
Living Dashboard (Priority P0)
Ultra-Detailed Implementation: The dashboard component will fetch data from multiple new endpoints:
GET /api/users/me/narrative-stats: Returns { title: "Weekly Pawgress", message: "You and Luna discovered 12 new friends this week!" }.
GET /api/packs/suggestions: Returns AI-generated pack suggestions.
GET /api/pulse/summary: Returns { status: "LIVE", message: "See live activity in your area" }.
The entire dashboard will be composed of these dynamic components, not hardcoded elements.
Ambient Weather Effects (Priority P1)
Ultra-Detailed Implementation:
Client-Side: On app load, the client gets the user's location and calls a weather API (e.g., OpenWeatherMap).
UI: The result is passed to a background component. This component uses AnimatePresence to cross-fade between different CSS gradients. For effects like rain or snow, it will use a lightweight particle animation library like react-tsparticles.
Journey 3: Matching, Chat & Introspection
Target State: A tactile, intelligent, and deeply engaging communication experience that helps users build and reflect on their connections.
Living Pet Avatars (Priority P1)
Ultra-Detailed Implementation: The pet's data model in the database will be extended with an idleAnimation field (e.g., { type: 'css', value: 'tail-wag' }). The MatchCard component will use this to apply a corresponding CSS animation class, bringing the avatar to life.
Dynamic Chat Header (Priority P1)
Ultra-Detailed Implementation: In the ChatPage component, the onScroll event of the message list will be tied to a useMotionValue. This value will be passed to a useTransform hook to interpolate the header's height, backdropFilter: blur(...), and the opacity of secondary elements.
Proactive UI & Mini-Apps (Priority P0)
Ultra-Detailed Implementation:
Backend: The backend uses a WebSocket connection. After a new message is saved, it is passed to an NLU model. If the model detects an intent (e.g., scheduling), the backend sends a specific WebSocket event to both clients in the chat: { event: 'suggestion', payload: { type: 'schedule', data: {...} } }.
Client: A global WebSocket listener receives this event and uses the Zustand store to update the state for the current chat, causing the "Schedule Playdate?" button to appear with a smooth animation.
Memory Weave (Priority P0)
Ultra-Detailed Implementation:
Backend: A nightly cron job runs on all conversations. It sends the entire chat transcript to the Gemini API with a prompt: "You are a relationship summarization AI. Analyze this conversation between two pet owners and identify up to 5 key milestones or memories. Return a JSON array of objects with 'title' and 'content' for each. Focus on the first message, first photo shared, and plans made." The results are stored in the database.
Client: The long-press gesture on the MatchCard is non-negotiable. This triggers the navigation to the MemoryWeavePage. The transition must use a layoutId on the card to seamlessly morph into the Memory Weave header. The 3D scroll effect must be implemented exactly as shown in the prototype, using useScroll and useTransform.
Journey 4: The Living Ecosystem
Target State: A suite of truly innovative features that transform the app into an indispensable, real-world utility and community hub.
Dynamic Social Groups ("The Pack")
Concept: AI-suggested social groups based on pet compatibility, owner interests, and real-world location.
Rationale: Fosters a true sense of community and organic social discovery. It turns a dating app model into a community-building platform.
Ultra-Detailed Implementation: The backend uses a clustering algorithm (e.g., DBSCAN) on anonymized, opted-in user location data to find dense areas of activity (like a popular dog park). It then cross-references users in that cluster with pet profiles (breed, energy level) to form and suggest a new "Pack."
Augmented Reality Discovery ("Scent Trails")
Concept: An AR mode that gamifies discovery and connects the digital app to the physical world.
Rationale: Encourages real-world activity and creates magical, game-like experiences.
Ultra-Detailed Implementation:
Tech Stack: React Native (Expo), expo-camera, expo-location, and expo-gl combined with three.js.
Backend Logic: A geospatial database (PostGIS) stores smoothed path data. The backend serves this data via a /api/trails/nearby endpoint.
Client Logic: An <GLView> is overlaid on an <Camera> view. three.js is used to render the path data as a 3D tube with a custom shader that animates a "flow" effect along the path using a time uniform (u_time).
Real-Time Collaborative Activities ("WhiskerSync")
Concept: A system for shared, real-time activities synchronized across devices.
Rationale: Creates deep engagement and transforms the app into a platform for shared experiences.
Ultra-Detailed Implementation:
Tech Stack: Use a real-time database like Firestore or a WebSocket server (Socket.io).
Synchronized Walks: A "walk" session in Firestore would have a top-level document. Each participant writes their location data to a sub-collection within that document. The app then listens for real-time updates to that collection to display all participants on a map.
The Local Pulse
Concept: A live, interactive map that serves as the central hub for the local pet community, visualizing the real-time "pulse" of pet activity, services, and safety alerts in the user's area.
Rationale: This transforms the app from a social tool into an indispensable daily utility.
Ultra-Detailed Implementation:
Tech Stack: React Native with react-native-maps and WebSockets (socket.io-client). Backend uses Node.js, Socket.io, and a geospatial database.
Backend Logic: Manage real-time updates using WebSocket rooms based on geographic grids. Aggregate anonymized location pings into a heatmap. Provide endpoints for community-validated alert submissions. Integrate with a business API like Google Places.
Client-Side Logic: A map view with toggleable layers for the activity heatmap, live group walks, community alerts, and pet-friendly places. All updates are pushed in real-time via WebSockets. Tapping any element brings up an animated detail sheet.
Pet Persona & Compatibility Matrix
Concept: An AI-driven feature that creates a rich, shareable "personality archetype" for each pet and visualizes compatibility.
Rationale: Creates a powerful new dimension for matching and a highly engaging, "sticky" feature that users will want to share. It transforms a simple profile into a dynamic, AI-generated identity.
Ultra-Detailed Implementation:
AI Persona Generation (Backend): After a pet profile is completed, a backend job gathers all data (breed, age, personality tags, AI-generated bio) and sends it to the Gemini API with a master prompt: "Analyze the following pet data: [data]. Based on this, assign a primary and secondary personality archetype from this list: [The Playful Explorer, The Cautious Cuddler, The Social Butterfly, The Independent Thinker, The Energetic Athlete]. Return a JSON object with { primaryArchetype: "...", secondaryArchetype: "...", description: "A creative 2-sentence summary of their personality.", compatibilityTips: "A short tip on what kind of friend they'd get along with." }"
UI - The Persona Card: The pet's profile page will now feature a new, beautifully designed "Persona" card. It will display the pet's primary archetype with a unique icon/illustration and the AI-generated description.
UI - The Compatibility Matrix: When viewing a potential match, a new button, "View Compatibility," will be available. Tapping this opens a modal displaying a radar chart. The chart will have axes like "Energy," "Sociability," "Independence." The app will plot both your pet's and the potential match's persona on this chart, visually showing areas of overlap and difference. Below the chart, the AI-generated compatibilityTips will be displayed.
Journey 5: Adoption & Rescue
Target State: To be the most trusted, effective, and humane platform for connecting adoptable pets with loving homes, fully integrated into our social ecosystem.
Core Adoption Infrastructure (Priority P0)
Ultra-Detailed Implementation:
New User Roles (Backend): The User model will be extended with a role field (enum: ['owner', 'shelter']).
Shelter Profiles (Backend & Frontend): Create a new database collection for ShelterProfiles. These profiles will include verification status, address, contact info, a list of their available pets, and success stories. The frontend will have a dedicated, beautifully designed ShelterProfilePage.
Adoptable Pet Profiles: The Pet model will get a new status field (enum: ['homed', 'adoptable', 'foster']). "Adoptable" profiles will have additional fields: adoptionHistory, specialNeeds, shelterId, and an applicationUrl.
Adoption Discovery Page (Frontend): Create a new main tab for "Adopt." This screen will be a dedicated discovery feed for adoptable pets. It must include advanced filters: species, breed, age, size, location, shelter, specialNeeds, and bondedPair (for pets that must be adopted together).
Advanced Adoption Tools (Priority P1)
Ultra-Detailed Implementation:
AI Application Assistant (Backend & Frontend): On a shelter's application page (or our in-app form), provide an "AI Assist" button.
Backend API: POST /api/ai/assist-application.
Request Body: { userProfile: object, petProfile: object, userNotes: string }.
Logic: The backend constructs a prompt for Gemini: "Act as a compassionate adoption assistant. A user wants to apply for [pet name]. Their notes are: '[userNotes]'. Based on their profile and the pet's needs, write a warm, sincere, and compelling paragraph for their application's 'Why do you want to adopt this pet?' section."
Virtual "Meet & Greet" (Frontend): Integrate a simple, secure video-calling SDK (like react-native-webrtc). Shelter profiles will have a "Request Virtual Meetup" button that opens a scheduling modal, allowing shelters and potential adopters to connect face-to-face.
Adoption Success Stories (Frontend): On the ShelterProfilePage and a dedicated section on the "Adopt" tab, feature successfully adopted pets. This content is user-generated (submitted by adopters) but curated by the shelters. It serves as powerful social proof and community-building content.
VI. Code Review Checklist & Error Resolution
This section addresses specific, common errors that arise when the core principles are not followed. It is a mandatory checklist for all new code.
Testing Errors: Incorrect Mocking
Error Log: TS2540: Cannot assign to 'matchesAPI' because it is a read-only property.
Solution: Must use jest.spyOn to mock the specific API method for the duration of a single test. Do not attempt to overwrite imported modules.
TypeScript Errors: Type Mismatches in Mocks & Props
Error Log: TS2322: Type 'string' is not assignable to type 'User'.
Solution: All mock data for tests must be fully typed and strictly conform to the shared TypeScript interfaces. Create complete mock objects, not just string IDs.
Form Errors: react-hook-form Misuse
Error Log: TS2322: Type '...' is not assignable to type 'ReactNode' when displaying errors.
Solution: Must access the .message property of the error object. This is provided by react-hook-form and Zod.
// DO NOT DO THIS:
// {errors.firstName && <p>{errors.firstName}</p>}

// DO THIS INSTEAD:
{errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>}


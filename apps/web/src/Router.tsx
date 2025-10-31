import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';

// Import providers from mobile app
import { ThemeProvider } from '@pawfectmatch/core';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './providers/NotificationProvider';
import { WeatherProvider } from './providers/WeatherProvider';

// Import mobile app configuration
import { queryClient } from './config/queryClient';
import i18n from './i18n';

// Import screens (we'll create these components)
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SwipeScreen from './screens/SwipeScreen';
import MatchesScreen from './screens/MatchesScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';
import PetProfileScreen from './screens/PetProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import PremiumScreen from './screens/PremiumScreen';
import AIBioScreen from './screens/AIBioScreen';
import AICompatibilityScreen from './screens/AICompatibilityScreen';
import AIPhotoAnalyzerScreen from './screens/AIPhotoAnalyzerScreen';
import MyPetsScreen from './screens/MyPetsScreen';
import CreatePetScreen from './screens/CreatePetScreen';
import MapScreen from './screens/MapScreen';
import MemoryWeaveScreen from './screens/MemoryWeaveScreen';
import StoriesScreen from './screens/StoriesScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import CommunityScreen from './screens/CommunityScreen';
import AdminDashboard from './screens/admin/AdminDashboard';

// Layout components
import AppChrome from './components/AppChrome';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NavigationGuard } from './components/NavigationGuard';
import { ProtectedRoute } from './components/ProtectedRoute';
import BottomTabNavigator from './components/BottomTabNavigator';

// Web-specific navigation components
import { WebNavigationContainer } from './components/WebNavigationContainer';

// Import types
import type { RootStackParamList } from './types/navigation';

const AppRouter = () => {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <WeatherProvider>
                  <WebNavigationContainer>
                    <NavigationGuard>
                      <AppChrome>
                        <Router>
                          <Routes>
                            {/* Authentication Routes */}
                            <Route path="/login" element={<LoginScreen />} />
                            <Route path="/register" element={<RegisterScreen />} />

                            {/* Main App Routes - Protected */}
                            <Route
                              path="/"
                              element={
                                <ProtectedRoute>
                                  <BottomTabNavigator />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/swipe"
                              element={
                                <ProtectedRoute>
                                  <SwipeScreen />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/matches"
                              element={
                                <ProtectedRoute>
                                  <MatchesScreen />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/profile"
                              element={
                                <ProtectedRoute>
                                  <ProfileScreen />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/chat"
                              element={
                                <ProtectedRoute>
                                  <ChatScreen />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/pet-profile"
                              element={
                                <ProtectedRoute>
                                  <PetProfileScreen />
                                </ProtectedRoute>
                              }
                            />

                            {/* Pet Management Routes */}
                            <Route
                              path="/my-pets"
                              element={
                                <ProtectedRoute>
                                  <MyPetsScreen />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/create-pet"
                              element={
                                <ProtectedRoute>
                                  <CreatePetScreen />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="/map" element={<MapScreen />} />

                            {/* Premium Routes */}
                            <Route path="/premium" element={<PremiumScreen />} />

                            {/* AI Feature Routes */}
                            <Route
                              path="/ai-bio"
                              element={
                                <ProtectedRoute>
                                  <AIBioScreen />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/ai-compatibility"
                              element={
                                <ProtectedRoute>
                                  <AICompatibilityScreen />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/ai-photo-analyzer"
                              element={
                                <ProtectedRoute>
                                  <AIPhotoAnalyzerScreen />
                                </ProtectedRoute>
                              }
                            />

                            {/* Settings Routes */}
                            <Route
                              path="/settings"
                              element={
                                <ProtectedRoute>
                                  <SettingsScreen />
                                </ProtectedRoute>
                              }
                            />

                            {/* Advanced Feature Routes */}
                            <Route
                              path="/memory-weave"
                              element={
                                <ProtectedRoute>
                                  <MemoryWeaveScreen />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/stories"
                              element={
                                <ProtectedRoute>
                                  <StoriesScreen />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/leaderboard"
                              element={
                                <ProtectedRoute>
                                  <LeaderboardScreen />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/community"
                              element={
                                <ProtectedRoute>
                                  <CommunityScreen />
                                </ProtectedRoute>
                              }
                            />

                            {/* Admin Routes */}
                            <Route path="/admin/*" element={<AdminDashboard />} />

                            {/* Catch all route */}
                            <Route path="*" element={<div>404 - Page Not Found</div>} />
                          </Routes>
                        </Router>
                      </AppChrome>
                    </NavigationGuard>
                  </WebNavigationContainer>
                </WeatherProvider>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
};

export default AppRouter;
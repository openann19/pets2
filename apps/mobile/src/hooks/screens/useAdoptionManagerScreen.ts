/**
 * useAdoptionManagerScreen Hook
 * Manages AdoptionManagerScreen state and interactions
 * Handles tab switching, data loading, status changes, and application actions
 */

import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { logger } from "@pawfectmatch/core";
import { adoptionAPI } from "../../services/api";
import type { RootStackScreenProps } from "../../navigation/types";

export interface PetListing {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  status: "active" | "pending" | "adopted" | "paused";
  photos: string[];
  applications: number;
  views: number;
  featured: boolean;
  listedAt: string;
}

export interface AdoptionApplication {
  id: string;
  petId: string;
  petName: string;
  applicantName: string;
  applicantEmail: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  submittedAt: string;
  experience: string;
  livingSpace: string;
  references: number;
}

interface UseAdoptionManagerScreenReturn {
  // State
  activeTab: "listings" | "applications";
  refreshing: boolean;
  showStatusModal: boolean;
  selectedPet: PetListing | null;
  isLoading: boolean;
  error: string | null;
  petListings: PetListing[];
  applications: AdoptionApplication[];
  
  // Actions
  setActiveTab: (tab: "listings" | "applications") => void;
  setShowStatusModal: (show: boolean) => void;
  setSelectedPet: (pet: PetListing | null) => void;
  
  // Handlers
  onRefresh: () => Promise<void>;
  handleTabPress: (
    tab: "listings" | "applications",
    scaleValue: ReturnType<typeof useSharedValue<number>>,
  ) => void;
  handleStatusChange: (pet: PetListing, newStatus: string) => void;
  handleApplicationAction: (
    applicationId: string,
    action: "approve" | "reject",
  ) => void;
  
  // Helpers
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  
  // Animated styles
  tabAnimatedStyle1: ReturnType<typeof useAnimatedStyle>;
  tabAnimatedStyle2: ReturnType<typeof useAnimatedStyle>;
  
  // Shared values
  tabScale1: ReturnType<typeof useSharedValue<number>>;
  tabScale2: ReturnType<typeof useSharedValue<number>>;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
  mass: 1,
};

const VALID_LISTING_STATUSES = new Set<PetListing["status"]>([
  "active",
  "pending",
  "adopted",
  "paused",
]);

const normalizeListing = (listing: unknown): PetListing => {
  const item = listing as Record<string, unknown>;
  const id = (item.id ?? item._id ?? "") as string;

  return {
    id,
    name: (item.name as string) ?? "Unknown Pet",
    species: (item.species as string) ?? "Unknown",
    breed: (item.breed as string) ?? "Unknown",
    age: typeof item.age === "number" ? item.age : 0,
    status: VALID_LISTING_STATUSES.has(item.status as PetListing["status"])
      ? (item.status as PetListing["status"])
      : "pending",
    photos: Array.isArray(item.photos)
      ? (item.photos as string[])
      : [],
    applications: typeof item.applications === "number" ? item.applications : 0,
    views: typeof item.views === "number" ? item.views : 0,
    featured: typeof item.featured === "boolean" ? item.featured : false,
    listedAt:
      typeof item.listedAt === "string"
        ? (item.listedAt as string)
        : new Date().toISOString(),
  };
};

const normalizeApplication = (application: unknown): AdoptionApplication => {
  const item = application as Record<string, unknown>;
  const status = item.status as AdoptionApplication["status"];

  return {
    id: (item.id ?? item._id ?? "") as string,
    petId: (item.petId ?? "") as string,
    petName:
      (item.petName as string) ?? ((item.pet as { name?: string })?.name ?? "Unknown"),
    applicantName:
      (item.applicantName as string) ??
      ((item.applicant as { name?: string })?.name ?? "Pending Applicant"),
    applicantEmail:
      (item.applicantEmail as string) ??
      ((item.applicant as { email?: string })?.email ?? "unknown@example.com"),
    status:
      status && ["pending", "approved", "rejected", "withdrawn"].includes(status)
        ? status
        : "pending",
    submittedAt:
      typeof item.submittedAt === "string"
        ? (item.submittedAt as string)
        : new Date().toISOString(),
    experience:
      (item.experience as string) ??
      ((item.applicationData as { experience?: string })?.experience ?? ""),
    livingSpace:
      (item.livingSpace as string) ??
      ((item.applicationData as { livingSituation?: string })?.livingSituation ?? ""),
    references:
      typeof item.references === "number"
        ? item.references
        : ((item.applicationData as { references?: number })?.references ?? 0),
  };
};

export const useAdoptionManagerScreen = (): UseAdoptionManagerScreenReturn => {
  const [activeTab, setActiveTab] = useState<"listings" | "applications">(
    "listings",
  );
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real data fetched from backend API
  const [petListings, setPetListings] = useState<PetListing[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);

  // Animated values for tab interactions
  const tabScale1 = useSharedValue(1);
  const tabScale2 = useSharedValue(1);

  const tabAnimatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: tabScale1.value }],
  }));

  const tabAnimatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: tabScale2.value }],
  }));

  // Load data when tab changes or on mount
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "listings") {
        const listingsData = await adoptionAPI.getListings();
        setPetListings(listingsData.map(normalizeListing));
      } else {
        const applicationsData = await adoptionAPI.getApplications();
        setApplications(applicationsData.map(normalizeApplication));
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load data. Please try again.";
      logger.error("Failed to load adoption data:", { error: err });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleTabPress = useCallback(
    (
      tab: "listings" | "applications",
      scaleValue: ReturnType<typeof useSharedValue<number>>,
    ) => {
      setActiveTab(tab);
      scaleValue.value = withSpring(0.95, SPRING_CONFIG, () => {
        scaleValue.value = withSpring(1, SPRING_CONFIG);
      });
    },
    [],
  );

  const handleStatusChange = useCallback((pet: PetListing, newStatus: string) => {
    setPetListings((prev) =>
      prev.map((p) =>
        p.id === pet.id
          ? { ...p, status: newStatus as PetListing["status"] }
          : p,
      ),
    );
    setShowStatusModal(false);
    setSelectedPet(null);
  }, []);

  const handleApplicationAction = useCallback(
    (
      applicationId: string,
      action: "approve" | "reject",
    ) => {
      Alert.alert(
        `${action === "approve" ? "Approve" : "Reject"} Application`,
        `Are you sure you want to ${action} this application?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: action === "approve" ? "Approve" : "Reject",
            style: action === "approve" ? "default" : "destructive",
            onPress: () => {
              setApplications((prev) =>
                prev.map((app) =>
                  app.id === applicationId
                    ? {
                        ...app,
                        status: action === "approve" ? "approved" : "rejected",
                      }
                    : app,
                ),
              );
            },
          },
        ],
      );
    },
    [],
  );

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "active":
        return "Theme.colors.status.success";
      case "pending":
        return "Theme.colors.status.warning";
      case "adopted":
        return "#8b5cf6";
      case "paused":
        return "Theme.colors.neutral[500]";
      case "approved":
        return "Theme.colors.status.success";
      case "rejected":
        return "Theme.colors.status.error";
      default:
        return "Theme.colors.neutral[500]";
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "active":
        return "✅";
      case "pending":
        return "⏳";
      case "adopted":
        return "🏠";
      case "paused":
        return "⏸️";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "❓";
    }
  }, []);

  return {
    // State
    activeTab,
    refreshing,
    showStatusModal,
    selectedPet,
    isLoading,
    error,
    petListings,
    applications,
    
    // Actions
    setActiveTab,
    setShowStatusModal,
    setSelectedPet,
    
    // Handlers
    onRefresh,
    handleTabPress,
    handleStatusChange,
    handleApplicationAction,
    getStatusColor,
    getStatusIcon,
    
    // Animated styles
    tabAnimatedStyle1,
    tabAnimatedStyle2,
    
    // Shared values for tab animations
    tabScale1,
    tabScale2,
  };
};


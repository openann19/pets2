import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { request } from '../../../../services/api';
import type { Application, ApplicationStatus } from '../types';

interface UseApplicationReviewProps {
  applicationId: string;
}

export const useApplicationReview = ({ applicationId }: UseApplicationReviewProps) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadApplication = useCallback(async () => {
    try {
      setIsLoading(true);
      const applicationData = await request<Application>(
        `/api/adoption/applications/${applicationId}`,
        {
          method: 'GET',
        },
      );
      setApplication(applicationData);
    } catch (error) {
      logger.error('Failed to load application:', { error });
      Alert.alert('Error', 'Failed to load application details');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void loadApplication();
  }, [loadApplication]);

  const updateStatus = useCallback(
    async (newStatus: ApplicationStatus) => {
      try {
        await request(`/api/adoption/applications/${applicationId}/review`, {
          method: 'POST',
          body: { status: newStatus },
        });

        if (application) {
          setApplication({ ...application, status: newStatus });
          Alert.alert('Success', `Application status updated to ${newStatus}`);
        }
      } catch (error) {
        logger.error('Failed to update application status:', { error });
        Alert.alert('Error', 'Failed to update application status');
      }
    },
    [applicationId, application],
  );

  return {
    application,
    isLoading,
    updateStatus,
    reload: loadApplication,
  };
};


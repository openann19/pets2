/**
 * Web AI Bio Page
 * Complete web implementation of AI-powered pet bio generation
 * Features: Multi-step form, photo upload, tone selection, results display
 */

import React, { useState } from 'react';
import { useWebAIBio } from '../../hooks/useWebAIBio';
import { PetInfoForm } from '../../components/ai/PetInfoForm';
import { ToneSelector } from '../../components/ai/ToneSelector';
import { BioResults } from '../../components/ai/BioResults';
import { Button } from '../../components/ui/Button';
import { AppLayout } from '../../components/layout/AppLayout';

type Step = 'info' | 'tone' | 'results';

export default function WebAIBioPage() {
  const [currentStep, setCurrentStep] = useState<Step>('info');

  const {
    // Form state
    petName,
    setPetName,
    petBreed,
    setPetBreed,
    petAge,
    setPetAge,
    petPersonality,
    setPetPersonality,
    selectedTone,
    setSelectedTone,
    selectedPhoto,
    setSelectedPhoto,

    // Generation state
    isGenerating,
    generatedBio,
    bioHistory,

    // Actions
    generateBio,
    pickImage,
    saveBio,
    clearForm,
    resetGeneration,

    // Validation
    isFormValid,
    validationErrors,
  } = useWebAIBio();

  const handleInfoSubmit = async () => {
    if (isFormValid) {
      setCurrentStep('tone');
    }
  };

  const handleToneSubmit = async () => {
    setCurrentStep('results');
    try {
      await generateBio();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleBackToTone = () => {
    setCurrentStep('tone');
    resetGeneration();
  };

  const handleBackToInfo = () => {
    setCurrentStep('info');
    resetGeneration();
  };

  const handleCreateNew = () => {
    setCurrentStep('info');
    clearForm();
    resetGeneration();
  };

  return (
    <AppLayout
      title="AI Pet Bio Generator"
      description="Create personalized pet bios with AI assistance"
    >
      <div className="min-h-screen bg-gray-50">
        {/* Progress Indicator */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'info' || currentStep === 'tone' || currentStep === 'results'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium text-gray-900">Pet Info</span>
              </div>

              <div className="flex-1 mx-4">
                <div className="h-1 bg-gray-200 rounded">
                  <div
                    className="h-1 bg-blue-600 rounded transition-all duration-300"
                    style={{
                      width: currentStep === 'info' ? '33%' :
                             currentStep === 'tone' ? '66%' : '100%'
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">Tone</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'tone' || currentStep === 'results'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
              </div>

              <div className="flex items-center space-x-4 ml-4">
                <span className="text-sm font-medium text-gray-900">Results</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'results'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="py-8">
          {currentStep === 'info' && (
            <div>
              <PetInfoForm
                petName={petName}
                onPetNameChange={setPetName}
                petBreed={petBreed}
                onPetBreedChange={setPetBreed}
                petAge={petAge}
                onPetAgeChange={setPetAge}
                petPersonality={petPersonality}
                onPetPersonalityChange={setPetPersonality}
                validationErrors={validationErrors}
                onSubmit={handleInfoSubmit}
                isSubmitting={false}
              />

              {/* Photo Upload Section */}
              <div className="max-w-2xl mx-auto p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Pet Photo (Optional)
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add a photo of your pet to help generate a more personalized bio
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {selectedPhoto ? (
                    <div className="space-y-4">
                      <img
                        src={selectedPhoto}
                        alt="Selected pet"
                        className="max-w-xs max-h-48 mx-auto rounded-lg shadow-md"
                      />
                      <Button
                        onClick={pickImage}
                        variant="ghost"
                        size="sm"
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div>
                        <Button onClick={pickImage} variant="primary">
                          Upload Pet Photo
                        </Button>
                        <p className="mt-2 text-sm text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'tone' && (
            <div>
              <ToneSelector
                selectedTone={selectedTone}
                onToneSelect={setSelectedTone}
              />

              <div className="max-w-4xl mx-auto px-6 pb-8">
                <div className="flex justify-between">
                  <Button
                    onClick={handleBackToInfo}
                    variant="ghost"
                  >
                    ← Back to Info
                  </Button>

                  <Button
                    onClick={handleToneSubmit}
                    disabled={isGenerating}
                    size="lg"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Bio →'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'results' && generatedBio && (
            <div>
              <BioResults
                generatedBio={generatedBio}
                onSave={saveBio}
                onRegenerate={handleToneSubmit}
              />

              <div className="max-w-4xl mx-auto px-6 pb-8">
                <div className="flex justify-between">
                  <Button
                    onClick={handleBackToTone}
                    variant="ghost"
                  >
                    ← Back to Tone
                  </Button>

                  <Button
                    onClick={handleCreateNew}
                    variant="primary"
                  >
                    Create New Bio
                  </Button>
                </div>

                {/* Bio History Summary */}
                {bioHistory.length > 1 && (
                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                      You've generated {bioHistory.length} bio{bioHistory.length !== 1 ? 's' : ''} so far
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

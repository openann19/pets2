'use client';
import { CameraIcon, CheckCircleIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { logger } from '@pawfectmatch/core';
;
import { useState } from 'react';
export const ProfileVerification = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [documents, setDocuments] = useState([]);
    const [personalInfo, setPersonalInfo] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
        },
        phone: '',
    });
    const [petInfo, setPetInfo] = useState({
        petName: '',
        species: '',
        breed: '',
        age: '',
        microchipNumber: '',
        vetName: '',
        vetPhone: '',
        vetAddress: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const steps = [
        { id: 'personal', title: 'Personal Information', icon: DocumentTextIcon },
        { id: 'documents', title: 'Upload Documents', icon: CameraIcon },
        { id: 'pet', title: 'Pet Information', icon: DocumentTextIcon },
        { id: 'review', title: 'Review & Submit', icon: ShieldCheckIcon },
    ];
    const documentTypes = [
        { id: 'id_front', label: 'ID Front', description: 'Front of government-issued ID' },
        { id: 'id_back', label: 'ID Back', description: 'Back of government-issued ID' },
        { id: 'pet_photo', label: 'Pet Photo', description: 'Clear photo of your pet' },
        {
            id: 'vet_certificate',
            label: 'Vet Certificate',
            description: 'Veterinary health certificate',
        },
        { id: 'adoption_papers', label: 'Adoption Papers', description: 'Pet adoption documentation' },
        {
            id: 'rescue_document',
            label: 'Rescue Document',
            description: 'Rescue organization documentation',
        },
    ];
    const handleFileUpload = async (type, file) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', type);
        try {
            const response = await fetch('/api/verification/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                const newDoc = {
                    id: result.documentId,
                    type: type,
                    url: result.url,
                    uploadedAt: new Date(),
                };
                setDocuments((prev) => [...prev.filter((d) => d.type !== type), newDoc]);
            }
        }
        catch (error) {
            logger.error('Upload failed:', { error });
        }
    };
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/verification/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personalInfo,
                    petInfo,
                    documents: documents.map((d) => ({
                        type: d.type,
                        url: d.url,
                        publicId: d.id,
                    })),
                }),
            });
            const result = await response.json();
            if (result.success) {
                onComplete?.();
            }
        }
        catch (error) {
            logger.error('Submission failed:', { error });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (<div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input type="text" value={personalInfo.firstName} onChange={(e) => setPersonalInfo((prev) => ({ ...prev, firstName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input type="text" value={personalInfo.lastName} onChange={(e) => setPersonalInfo((prev) => ({ ...prev, lastName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input type="date" value={personalInfo.dateOfBirth} onChange={(e) => setPersonalInfo((prev) => ({ ...prev, dateOfBirth: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input type="tel" value={personalInfo.phone} onChange={(e) => setPersonalInfo((prev) => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <div className="space-y-4">
                <input type="text" placeholder="Street Address" value={personalInfo.address.street} onChange={(e) => setPersonalInfo((prev) => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value },
                    }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="City" value={personalInfo.address.city} onChange={(e) => setPersonalInfo((prev) => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value },
                    }))} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>

                  <input type="text" placeholder="State" value={personalInfo.address.state} onChange={(e) => setPersonalInfo((prev) => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value },
                    }))} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>

                  <input type="text" placeholder="ZIP Code" value={personalInfo.address.zipCode} onChange={(e) => setPersonalInfo((prev) => ({
                        ...prev,
                        address: { ...prev.address, zipCode: e.target.value },
                    }))} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
                </div>
              </div>
            </div>
          </div>);
            case 1:
                return (<div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upload Documents
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentTypes.map((docType) => {
                        const uploadedDoc = documents.find((d) => d.type === docType.id);
                        return (<div key={docType.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{docType.label}</h4>
                      {uploadedDoc && <CheckCircleIcon className="h-5 w-5 text-green-500"/>}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {docType.description}
                    </p>

                    <input type="file" accept="image/*,.pdf" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file)
                                    handleFileUpload(docType.id, file);
                            }} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"/>

                    {uploadedDoc && (<div className="mt-2 text-xs text-green-600">
                        Uploaded: {uploadedDoc.uploadedAt.toLocaleDateString()}
                      </div>)}
                  </div>);
                    })}
            </div>
          </div>);
            case 2:
                return (<div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pet Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pet Name
                </label>
                <input type="text" value={petInfo.petName} onChange={(e) => setPetInfo((prev) => ({ ...prev, petName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Species
                </label>
                <select value={petInfo.species} onChange={(e) => setPetInfo((prev) => ({ ...prev, species: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                  <option value="">Select Species</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Breed
                </label>
                <input type="text" value={petInfo.breed} onChange={(e) => setPetInfo((prev) => ({ ...prev, breed: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                <input type="number" value={petInfo.age} onChange={(e) => setPetInfo((prev) => ({ ...prev, age: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Microchip Number
                </label>
                <input type="text" value={petInfo.microchipNumber} onChange={(e) => setPetInfo((prev) => ({ ...prev, microchipNumber: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Veterinarian Name
                </label>
                <input type="text" value={petInfo.vetName} onChange={(e) => setPetInfo((prev) => ({ ...prev, vetName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vet Phone
                </label>
                <input type="tel" value={petInfo.vetPhone} onChange={(e) => setPetInfo((prev) => ({ ...prev, vetPhone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vet Address
                </label>
                <input type="text" value={petInfo.vetAddress} onChange={(e) => setPetInfo((prev) => ({ ...prev, vetAddress: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>
            </div>
          </div>);
            case 3:
                return (<div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review & Submit</h3>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Personal Information
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Name:</strong> {personalInfo.firstName} {personalInfo.lastName}
                </p>
                <p>
                  <strong>DOB:</strong> {personalInfo.dateOfBirth}
                </p>
                <p>
                  <strong>Phone:</strong> {personalInfo.phone}
                </p>
                <p>
                  <strong>Address:</strong> {personalInfo.address.street},{' '}
                  {personalInfo.address.city}, {personalInfo.address.state}{' '}
                  {personalInfo.address.zipCode}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Pet Information</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Name:</strong> {petInfo.petName}
                </p>
                <p>
                  <strong>Species:</strong> {petInfo.species}
                </p>
                <p>
                  <strong>Breed:</strong> {petInfo.breed}
                </p>
                <p>
                  <strong>Age:</strong> {petInfo.age}
                </p>
                <p>
                  <strong>Microchip:</strong> {petInfo.microchipNumber}
                </p>
                <p>
                  <strong>Vet:</strong> {petInfo.vetName}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Documents Uploaded</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {documents.length > 0 ? (<ul className="space-y-1">
                    {documents.map((doc) => (<li key={doc.id} className="flex items-center">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2"/>
                        {documentTypes.find((dt) => dt.id === doc.type)?.label}
                      </li>))}
                  </ul>) : (<p>No documents uploaded</p>)}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Verification Process
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your verification will be reviewed by our team within 24-48 hours. You'll receive an
                email notification once the review is complete.
              </p>
            </div>
          </div>);
            default:
                return null;
        }
    };
    return (<div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Profile Verification
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Verify your identity and pet ownership to get a verified badge
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (<div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : 'border-gray-300 text-gray-400'}`}>
                  {isCompleted ? (<CheckCircleIcon className="h-6 w-6"/>) : (<Icon className="h-6 w-6"/>)}
                </div>

                <div className="ml-3">
                  <p className={`text-sm font-medium ${isActive ? 'text-pink-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                </div>

                {index < steps.length - 1 && (<div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}/>)}
              </div>);
        })}
        </div>
      </div>

      {/* Step Content */}
      <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        {renderStepContent()}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))} disabled={currentStep === 0} className="px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>

        <div className="flex space-x-3">
          {currentStep < steps.length - 1 ? (<button onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))} className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors">
              Next
            </button>) : (<button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : 'Submit Verification'}
            </button>)}
        </div>
      </div>
    </div>);
};
//# sourceMappingURL=ProfileVerification.jsx.map
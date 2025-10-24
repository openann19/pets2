import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
const shelterSchema = z.object({
    name: z.string().min(2, 'Shelter name must be at least 2 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    contactInfo: z.object({
        email: z.string().email('Invalid email address'),
        phone: z.string().min(10, 'Phone number must be at least 10 digits'),
        website: z.string().url('Invalid website URL').optional().or(z.literal('')),
        address: z.object({
            street: z.string().min(5, 'Street address is required'),
            city: z.string().min(2, 'City is required'),
            state: z.string().min(2, 'State is required'),
            zipCode: z.string().min(5, 'ZIP code is required'),
            country: z.string().min(2, 'Country is required'),
        }),
    }),
    operatingHours: z.object({
        monday: z.object({
            available: z.boolean(),
            times: z.array(z.string()),
        }),
        tuesday: z.object({
            available: z.boolean(),
            times: z.array(z.string()),
        }),
        wednesday: z.object({
            available: z.boolean(),
            times: z.array(z.string()),
        }),
        thursday: z.object({
            available: z.boolean(),
            times: z.array(z.string()),
        }),
        friday: z.object({
            available: z.boolean(),
            times: z.array(z.string()),
        }),
        saturday: z.object({
            available: z.boolean(),
            times: z.array(z.string()),
        }),
        sunday: z.object({
            available: z.boolean(),
            times: z.array(z.string()),
        }),
    }),
    capacity: z.object({
        max: z.number().min(1, 'Maximum capacity must be at least 1'),
    }),
    specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
    services: z.array(z.string()).min(1, 'Select at least one service'),
    socialMedia: z
        .object({
        facebook: z.string().url().optional().or(z.literal('')),
        instagram: z.string().url().optional().or(z.literal('')),
        twitter: z.string().url().optional().or(z.literal('')),
    })
        .optional(),
    policies: z.object({
        adoptionFee: z.number().min(0).optional(),
        applicationProcess: z.string().optional(),
        homeVisitRequired: z.boolean(),
        referencesRequired: z.number().min(0),
        ageRestrictions: z
            .object({
            minAge: z.number().min(18).optional(),
            maxAge: z.number().optional(),
        })
            .optional(),
    }),
});
const SPECIALIZATION_OPTIONS = [
    'dogs',
    'cats',
    'birds',
    'rabbits',
    'small_animals',
    'rescue',
    'foster',
    'rehabilitation',
    'senior_pets',
    'special_needs',
    'exotic_animals',
    'farm_animals',
];
const SERVICE_OPTIONS = [
    'adoption',
    'foster',
    'medical_care',
    'behavioral_training',
    'grooming',
    'boarding',
    'emergency_care',
    'vaccinations',
    'spay_neuter',
    'microchipping',
];
export const ShelterRegistration = ({ onSubmit, initialData }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationStep, setVerificationStep] = useState('basic');
    const { register, handleSubmit, watch, setValue, formState: { errors }, } = useForm({
        resolver: zodResolver(shelterSchema),
        defaultValues: {
            specializations: [],
            services: [],
            policies: {
                homeVisitRequired: false,
                referencesRequired: 2,
            },
            operatingHours: {
                monday: { available: true, times: ['9:00 AM - 6:00 PM'] },
                tuesday: { available: true, times: ['9:00 AM - 6:00 PM'] },
                wednesday: { available: true, times: ['9:00 AM - 6:00 PM'] },
                thursday: { available: true, times: ['9:00 AM - 6:00 PM'] },
                friday: { available: true, times: ['9:00 AM - 6:00 PM'] },
                saturday: { available: false, times: [] },
                sunday: { available: false, times: [] },
            },
            ...initialData,
        },
    });
    const watchedSpecializations = watch('specializations') || [];
    const watchedServices = watch('services') || [];
    const handleSpecializationToggle = (specialization) => {
        const current = watchedSpecializations;
        const updated = current.includes(specialization)
            ? current.filter((s) => s !== specialization)
            : [...current, specialization];
        setValue('specializations', updated);
    };
    const handleServiceToggle = (service) => {
        const current = watchedServices;
        const updated = current.includes(service)
            ? current.filter((s) => s !== service)
            : [...current, service];
        setValue('services', updated);
    };
    const onFormSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (verificationStep === 'basic') {
        return (<Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500"/>
            Shelter Registration - Basic Information
          </CardTitle>
          <CardDescription>
            Provide basic information about your shelter. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(() => setVerificationStep('documents'))} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shelter Name *</Label>
                <Input id="name" {...register('name')} placeholder="Happy Tails Animal Shelter"/>
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...register('contactInfo.website')} placeholder="https://www.happytails.org"/>
                {errors.contactInfo?.website && (<p className="text-sm text-red-500">{errors.contactInfo.website.message}</p>)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" {...register('description')} placeholder="Tell us about your shelter, its mission, and the animals you serve..." rows={4}/>
              {errors.description && (<p className="text-sm text-red-500">{errors.description.message}</p>)}
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register('contactInfo.email')} placeholder="contact@happytails.org"/>
                  {errors.contactInfo?.email && (<p className="text-sm text-red-500">{errors.contactInfo.email.message}</p>)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" {...register('contactInfo.phone')} placeholder="(555) 123-4567"/>
                  {errors.contactInfo?.phone && (<p className="text-sm text-red-500">{errors.contactInfo.phone.message}</p>)}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h4 className="font-medium">Address *</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input id="street" {...register('contactInfo.address.street')} placeholder="123 Main Street"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register('contactInfo.address.city')} placeholder="Anytown"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...register('contactInfo.address.state')} placeholder="CA"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input id="zipCode" {...register('contactInfo.address.zipCode')} placeholder="12345"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...register('contactInfo.address.country')} placeholder="United States"/>
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Maximum Capacity *</Label>
              <Input id="maxCapacity" type="number" {...register('capacity.max', { valueAsNumber: true })} placeholder="50"/>
              {errors.capacity?.max && (<p className="text-sm text-red-500">{errors.capacity.max.message}</p>)}
            </div>

            {/* Specializations */}
            <div className="space-y-3">
              <Label>Specializations *</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATION_OPTIONS.map((spec) => (<Badge key={spec} variant={watchedSpecializations.includes(spec) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => handleSpecializationToggle(spec)}>
                    {spec.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>))}
              </div>
              {errors.specializations && (<p className="text-sm text-red-500">{errors.specializations.message}</p>)}
            </div>

            {/* Services */}
            <div className="space-y-3">
              <Label>Services Offered *</Label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((service) => (<Badge key={service} variant={watchedServices.includes(service) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => handleServiceToggle(service)}>
                    {service.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>))}
              </div>
              {errors.services && <p className="text-sm text-red-500">{errors.services.message}</p>}
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Media (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input id="facebook" {...register('socialMedia.facebook')} placeholder="https://facebook.com/happytails"/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" {...register('socialMedia.instagram')} placeholder="https://instagram.com/happytails"/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input id="twitter" {...register('socialMedia.twitter')} placeholder="https://twitter.com/happytails"/>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Continue to Documents'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>);
    }
    if (verificationStep === 'documents') {
        return (<Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500"/>
            Shelter Registration - Verification Documents
          </CardTitle>
          <CardDescription>
            Upload required documents to verify your shelter's legitimacy and credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4"/>
              <AlertDescription>
                All documents are required for verification. Your application will be reviewed
                within 3-5 business days.
              </AlertDescription>
            </Alert>

            {/* Document Upload Sections */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Business License or Non-Profit Status *</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Upload your business license, 501(c)(3) certification, or other proof of legal
                  status.
                </p>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2"/>
                  Choose File
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Insurance Certificate *</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Upload proof of liability insurance covering animal care operations.
                </p>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2"/>
                  Choose File
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Facility Photos *</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Upload at least 5 photos showing your facility, animal housing, and common areas.
                </p>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2"/>
                  Choose Files (Multiple)
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setVerificationStep('basic')}>
                Back
              </Button>
              <Button onClick={() => setVerificationStep('review')}>Continue to Review</Button>
            </div>
          </div>
        </CardContent>
      </Card>);
    }
    // Review step
    return (<Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500"/>
          Shelter Registration - Review & Submit
        </CardTitle>
        <CardDescription>
          Review your information and submit your shelter registration for verification.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4"/>
            <AlertDescription>
              Your shelter will be listed as "Pending Verification" until our team reviews your
              documents. This process typically takes 3-5 business days.
            </AlertDescription>
          </Alert>

          {/* Summary of entered information would go here */}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setVerificationStep('documents')}>
              Back
            </Button>
            <Button onClick={handleSubmit(onFormSubmit)} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>);
};
//# sourceMappingURL=ShelterRegistration.jsx.map
//# sourceMappingURL=ShelterRegistration.jsx.map
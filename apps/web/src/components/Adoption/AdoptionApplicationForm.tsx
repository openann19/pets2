import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Plus, Minus, AlertCircle } from 'lucide-react';
/**
 * Adoption Application Schema
 * Defines the validation rules for the adoption application form
 * The actual TypeScript type is inferred from this schema as AdoptionApplicationFormData
 */
const adoptionApplicationSchema = z.object({
    personalInfo: z.object({
        firstName: z.string().min(2, 'First name is required'),
        lastName: z.string().min(2, 'Last name is required'),
        email: z.string().email('Invalid email address'),
        phone: z.string().min(10, 'Phone number must be at least 10 digits'),
        dateOfBirth: z.string().min(1, 'Date of birth is required'),
        occupation: z.string().optional(),
        householdSize: z.number().min(1, 'Household size must be at least 1'),
        hasChildren: z.boolean(),
        childrenAges: z.array(z.number()).optional(),
    }),
    livingSituation: z.object({
        residenceType: z.enum(['house', 'apartment', 'condo', 'mobile_home', 'other']),
        ownership: z.enum(['own', 'rent', 'lease', 'other']),
        yardType: z.enum(['fenced', 'unfenced', 'no_yard', 'shared']).optional(),
        landlordPermission: z.boolean().optional(),
        movePlans: z.string().optional(),
    }),
    petExperience: z.object({
        hasOwnedPets: z.boolean(),
        currentPets: z
            .array(z.object({
            name: z.string().min(1, 'Pet name is required'),
            species: z.string().min(1, 'Species is required'),
            age: z.number().min(0, 'Age must be positive'),
            vaccinated: z.boolean(),
            spayedNeutered: z.boolean(),
        }))
            .optional(),
        previousPets: z
            .array(z.object({
            name: z.string().min(1, 'Pet name is required'),
            species: z.string().min(1, 'Species is required'),
            ownedFor: z.number().min(0, 'Years owned must be positive'),
            reasonForChange: z.string().min(1, 'Reason is required'),
        }))
            .optional(),
        petPreferences: z.object({
            species: z.array(z.string()).min(1, 'Select at least one preferred species'),
            size: z.array(z.string()).min(1, 'Select at least one preferred size'),
            ageRange: z.object({
                min: z.number().min(0),
                max: z.number().min(1),
            }),
            specialNeeds: z.boolean(),
        }),
    }),
    lifestyle: z.object({
        dailySchedule: z.string().min(10, 'Please provide more detail about your daily schedule'),
        exercisePlan: z.string().min(10, 'Please describe your exercise plans for the pet'),
        aloneTime: z.string().min(1, 'Please specify how long the pet would be alone'),
        vacationPlans: z.string().min(1, 'Please describe your vacation plans'),
        budget: z.object({
            monthlyPetBudget: z.number().min(0, 'Budget must be positive'),
            emergencyFund: z.boolean(),
        }),
    }),
    references: z
        .array(z.object({
        name: z.string().min(2, 'Reference name is required'),
        relationship: z.string().min(2, 'Relationship is required'),
        phone: z.string().min(10, 'Phone number is required'),
        email: z.string().email().optional().or(z.literal('')),
        knownFor: z.number().min(0, 'Years known must be positive'),
    }))
        .min(2, 'At least 2 references are required'),
});
export const AdoptionApplicationForm = ({ petId: _petId, shelterId: _shelterId, onSubmit, initialData, }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;
    const { register, handleSubmit, watch, setValue, control, formState: { errors }, } = useForm({
        resolver: zodResolver(adoptionApplicationSchema),
        defaultValues: {
            personalInfo: {
                householdSize: 1,
                hasChildren: false,
                childrenAges: [],
            },
            livingSituation: {
                residenceType: 'house',
                ownership: 'own',
            },
            petExperience: {
                hasOwnedPets: false,
                currentPets: [],
                previousPets: [],
                petPreferences: {
                    species: [],
                    size: [],
                    ageRange: { min: 0, max: 10 },
                    specialNeeds: false,
                },
            },
            lifestyle: {
                budget: {
                    monthlyPetBudget: 100,
                    emergencyFund: false,
                },
            },
            references: [
                { name: '', relationship: '', phone: '', email: '', knownFor: 0 },
                { name: '', relationship: '', phone: '', email: '', knownFor: 0 },
            ],
            ...initialData,
        },
    });
    const { fields: currentPetFields, append: appendCurrentPet, remove: removeCurrentPet, } = useFieldArray({
        control,
        name: 'petExperience.currentPets',
    });
    const { fields: previousPetFields, append: appendPreviousPet, remove: removePreviousPet, } = useFieldArray({
        control,
        name: 'petExperience.previousPets',
    });
    const { fields: referenceFields, append: appendReference, remove: removeReference, } = useFieldArray({
        control,
        name: 'references',
    });
    const watchedHasChildren = watch('personalInfo.hasChildren');
    const watchedHasOwnedPets = watch('petExperience.hasOwnedPets');
    const watchedResidenceType = watch('livingSituation.residenceType');
    const watchedOwnership = watch('livingSituation.ownership');
    const watchedSpeciesPrefs = watch('petExperience.petPreferences.species') || [];
    const watchedSizePrefs = watch('petExperience.petPreferences.size') || [];
    const handleSpeciesToggle = (species) => {
        const current = watchedSpeciesPrefs;
        const updated = current.includes(species)
            ? current.filter((s) => s !== species)
            : [...current, species];
        setValue('petExperience.petPreferences.species', updated);
    };
    const handleSizeToggle = (size) => {
        const current = watchedSizePrefs;
        const updated = current.includes(size) ? current.filter((s) => s !== size) : [...current, size];
        setValue('petExperience.petPreferences.size', updated);
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
    const renderStepIndicator = () => (<div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (<React.Fragment key={step}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {step}
          </div>
          {step < totalSteps && (<div className={`w-12 h-1 ${step < currentStep ? 'bg-blue-500' : 'bg-gray-200'}`}/>)}
        </React.Fragment>))}
    </div>);
    if (currentStep === 1) {
        return (<Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500"/>
            Adoption Application - Personal Information
          </CardTitle>
          <CardDescription>Step 1 of 5: Tell us about yourself and your household.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}
          <form onSubmit={handleSubmit(() => setCurrentStep(2))} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" {...register('personalInfo.firstName')} placeholder="John"/>
                {errors.personalInfo?.firstName && (<p className="text-sm text-red-500">{errors.personalInfo.firstName.message}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" {...register('personalInfo.lastName')} placeholder="Doe"/>
                {errors.personalInfo?.lastName && (<p className="text-sm text-red-500">{errors.personalInfo.lastName.message}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register('personalInfo.email')} placeholder="john.doe@example.com"/>
                {errors.personalInfo?.email && (<p className="text-sm text-red-500">{errors.personalInfo.email.message}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" {...register('personalInfo.phone')} placeholder="(555) 123-4567"/>
                {errors.personalInfo?.phone && (<p className="text-sm text-red-500">{errors.personalInfo.phone.message}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input id="dateOfBirth" type="date" {...register('personalInfo.dateOfBirth')}/>
                {errors.personalInfo?.dateOfBirth && (<p className="text-sm text-red-500">{errors.personalInfo.dateOfBirth.message}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" {...register('personalInfo.occupation')} placeholder="Software Engineer"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="householdSize">Household Size *</Label>
                <Input id="householdSize" type="number" {...register('personalInfo.householdSize', { valueAsNumber: true })} placeholder="2"/>
                {errors.personalInfo?.householdSize && (<p className="text-sm text-red-500">
                    {errors.personalInfo.householdSize.message}
                  </p>)}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Checkbox checked={watchedHasChildren} onChange={(checked) => setValue('personalInfo.hasChildren', !!checked)}/>
                  <span>Do you have children in your household?</span>
                </Label>
              </div>
            </div>

            {watchedHasChildren && (<div className="space-y-2">
                <Label>Children's Ages</Label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((age) => (<Badge key={age} variant={watch('personalInfo.childrenAges')?.includes(age) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => {
                        const current = watch('personalInfo.childrenAges') || [];
                        const updated = current.includes(age)
                            ? current.filter((a) => a !== age)
                            : [...current, age];
                        setValue('personalInfo.childrenAges', updated);
                    }}>
                      {age}
                    </Badge>))}
                </div>
              </div>)}

            <div className="flex justify-end">
              <Button type="submit">Continue to Living Situation</Button>
            </div>
          </form>
        </CardContent>
      </Card>);
    }
    if (currentStep === 2) {
        return (<Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Living Situation</CardTitle>
          <CardDescription>Step 2 of 5: Tell us about where you live.</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}
          <form onSubmit={handleSubmit(() => setCurrentStep(3))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="residenceType">Type of Residence *</Label>
                <Select value={watchedResidenceType} onValueChange={(value) => setValue('livingSituation.residenceType', value)}>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="mobile_home">Mobile Home</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownership">Ownership Status *</Label>
                <Select value={watchedOwnership} onValueChange={(value) => setValue('livingSituation.ownership', value)}>
                  <SelectItem value="own">Own</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="lease">Lease</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </Select>
              </div>

              {(watchedResidenceType === 'house' || watchedResidenceType === 'condo') && (<div className="space-y-2">
                  <Label htmlFor="yardType">Yard Type</Label>
                  <Select value={watch('livingSituation.yardType') || ''} onValueChange={(value) => setValue('livingSituation.yardType', value)}>
                    <SelectItem value="fenced">Fenced</SelectItem>
                    <SelectItem value="unfenced">Unfenced</SelectItem>
                    <SelectItem value="no_yard">No Yard</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                  </Select>
                </div>)}

              {watchedOwnership === 'rent' && (<div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Checkbox checked={watch('livingSituation.landlordPermission') || false} onChange={(checked) => setValue('livingSituation.landlordPermission', !!checked)}/>
                    <span>Do you have landlord permission to have pets?</span>
                  </Label>
                </div>)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="movePlans">Future Move Plans</Label>
              <Textarea id="movePlans" {...register('livingSituation.movePlans')} placeholder="Do you plan to move in the next year? Any changes to your living situation?" rows={3}/>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button type="submit">Continue to Pet Experience</Button>
            </div>
          </form>
        </CardContent>
      </Card>);
    }
    if (currentStep === 3) {
        return (<Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Pet Experience & Preferences</CardTitle>
          <CardDescription>
            Step 3 of 5: Tell us about your experience with pets and what you're looking for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}
          <form onSubmit={handleSubmit(() => setCurrentStep(4))} className="space-y-6">
            <div className="space-y-4">
              <Label className="flex items-center space-x-2">
                <Checkbox checked={watchedHasOwnedPets} onCheckedChange={(checked) => setValue('petExperience.hasOwnedPets', !!checked)}/>
                <span>Have you owned pets before?</span>
              </Label>
            </div>

            {watchedHasOwnedPets && (<>
                {/* Current Pets */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Current Pets</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendCurrentPet({
                    name: '',
                    species: '',
                    age: 0,
                    vaccinated: false,
                    spayedNeutered: false,
                })}>
                      <Plus className="h-4 w-4 mr-2"/>
                      Add Current Pet
                    </Button>
                  </div>

                  {currentPetFields.map((field, index) => (<Card key={field.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Pet Name</Label>
                          <Input {...register(`petExperience.currentPets.${index}.name`)} placeholder="Buddy"/>
                        </div>
                        <div className="space-y-2">
                          <Label>Species</Label>
                          <Input {...register(`petExperience.currentPets.${index}.species`)} placeholder="Dog"/>
                        </div>
                        <div className="space-y-2">
                          <Label>Age</Label>
                          <Input type="number" {...register(`petExperience.currentPets.${index}.age`, {
                    valueAsNumber: true,
                })} placeholder="3"/>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Label className="flex items-center space-x-2">
                            <Checkbox checked={watch(`petExperience.currentPets.${index}.vaccinated`) || false} onChange={(checked) => setValue(`petExperience.currentPets.${index}.vaccinated`, !!checked)}/>
                            <span>Vaccinated</span>
                          </Label>
                          <Label className="flex items-center space-x-2">
                            <Checkbox checked={watch(`petExperience.currentPets.${index}.spayedNeutered`) || false} onChange={(checked) => setValue(`petExperience.currentPets.${index}.spayedNeutered`, !!checked)}/>
                            <span>Spayed/Neutered</span>
                          </Label>
                        </div>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => removeCurrentPet(index)}>
                        <Minus className="h-4 w-4 mr-2"/>
                        Remove Pet
                      </Button>
                    </Card>))}
                </div>

                {/* Previous Pets */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Previous Pets</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendPreviousPet({
                    name: '',
                    species: '',
                    ownedFor: 0,
                    reasonForChange: '',
                })}>
                      <Plus className="h-4 w-4 mr-2"/>
                      Add Previous Pet
                    </Button>
                  </div>

                  {previousPetFields.map((field, index) => (<Card key={field.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Pet Name</Label>
                          <Input {...register(`petExperience.previousPets.${index}.name`)} placeholder="Max"/>
                        </div>
                        <div className="space-y-2">
                          <Label>Species</Label>
                          <Input {...register(`petExperience.previousPets.${index}.species`)} placeholder="Cat"/>
                        </div>
                        <div className="space-y-2">
                          <Label>Years Owned</Label>
                          <Input type="number" {...register(`petExperience.previousPets.${index}.ownedFor`, {
                    valueAsNumber: true,
                })} placeholder="5"/>
                        </div>
                        <div className="space-y-2">
                          <Label>Reason for Change</Label>
                          <Input {...register(`petExperience.previousPets.${index}.reasonForChange`)} placeholder="Moved to apartment"/>
                        </div>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => removePreviousPet(index)}>
                        <Minus className="h-4 w-4 mr-2"/>
                        Remove Pet
                      </Button>
                    </Card>))}
                </div>
              </>)}

            {/* Pet Preferences */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Pet Preferences</Label>

              <div className="space-y-3">
                <Label>Preferred Species *</Label>
                <div className="flex flex-wrap gap-2">
                  {['dog', 'cat', 'bird', 'rabbit', 'other'].map((species) => (<Badge key={species} variant={watchedSpeciesPrefs.includes(species) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => handleSpeciesToggle(species)}>
                      {species.charAt(0).toUpperCase() + species.slice(1)}
                    </Badge>))}
                </div>
                {errors.petExperience?.petPreferences?.species && (<p className="text-sm text-red-500">
                    {errors.petExperience.petPreferences.species.message}
                  </p>)}
              </div>

              <div className="space-y-3">
                <Label>Preferred Size *</Label>
                <div className="flex flex-wrap gap-2">
                  {['tiny', 'small', 'medium', 'large', 'extra-large'].map((size) => (<Badge key={size} variant={watchedSizePrefs.includes(size) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => handleSizeToggle(size)}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Badge>))}
                </div>
                {errors.petExperience?.petPreferences?.size && (<p className="text-sm text-red-500">
                    {errors.petExperience.petPreferences.size.message}
                  </p>)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Age</Label>
                  <Input type="number" {...register('petExperience.petPreferences.ageRange.min', {
            valueAsNumber: true,
        })} placeholder="0"/>
                </div>
                <div className="space-y-2">
                  <Label>Maximum Age</Label>
                  <Input type="number" {...register('petExperience.petPreferences.ageRange.max', {
            valueAsNumber: true,
        })} placeholder="10"/>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Checkbox checked={watch('petExperience.petPreferences.specialNeeds') || false} onCheckedChange={(checked) => setValue('petExperience.petPreferences.specialNeeds', !!checked)}/>
                  <span>Open to pets with special needs</span>
                </Label>
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button type="submit">Continue to Lifestyle</Button>
            </div>
          </form>
        </CardContent>
      </Card>);
    }
    if (currentStep === 4) {
        return (<Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Lifestyle & References</CardTitle>
          <CardDescription>
            Step 4 of 5: Tell us about your lifestyle and provide references.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}
          <form onSubmit={handleSubmit(() => setCurrentStep(5))} className="space-y-6">
            {/* Lifestyle */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dailySchedule">Daily Schedule *</Label>
                <Textarea id="dailySchedule" {...register('lifestyle.dailySchedule')} placeholder="Describe your typical daily routine, including work hours, exercise, and time at home..." rows={3}/>
                {errors.lifestyle?.dailySchedule && (<p className="text-sm text-red-500">{errors.lifestyle.dailySchedule.message}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="exercisePlan">Exercise Plan *</Label>
                <Textarea id="exercisePlan" {...register('lifestyle.exercisePlan')} placeholder="How will you exercise and play with the pet? What activities do you have planned?" rows={3}/>
                {errors.lifestyle?.exercisePlan && (<p className="text-sm text-red-500">{errors.lifestyle.exercisePlan.message}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="aloneTime">Time Pet Will Be Alone *</Label>
                <Textarea id="aloneTime" {...register('lifestyle.aloneTime')} placeholder="How many hours per day will the pet be left alone? What arrangements will you make?" rows={2}/>
                {errors.lifestyle?.aloneTime && (<p className="text-sm text-red-500">{errors.lifestyle.aloneTime.message}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vacationPlans">Vacation Plans *</Label>
                <Textarea id="vacationPlans" {...register('lifestyle.vacationPlans')} placeholder="How will you care for the pet during vacations or travel?" rows={2}/>
                {errors.lifestyle?.vacationPlans && (<p className="text-sm text-red-500">{errors.lifestyle.vacationPlans.message}</p>)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyBudget">Monthly Pet Budget *</Label>
                  <Input id="monthlyBudget" type="number" {...register('lifestyle.budget.monthlyPetBudget', { valueAsNumber: true })} placeholder="200"/>
                  {errors.lifestyle?.budget?.monthlyPetBudget && (<p className="text-sm text-red-500">
                      {errors.lifestyle.budget.monthlyPetBudget.message}
                    </p>)}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Checkbox checked={watch('lifestyle.budget.emergencyFund') || false} onCheckedChange={(checked) => setValue('lifestyle.budget.emergencyFund', !!checked)}/>
                    <span>Do you have an emergency fund for unexpected vet costs?</span>
                  </Label>
                </div>
              </div>
            </div>

            {/* References */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">References * (Minimum 2)</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => appendReference({
                name: '',
                relationship: '',
                phone: '',
                email: '',
                knownFor: 0,
            })}>
                  <Plus className="h-4 w-4 mr-2"/>
                  Add Reference
                </Button>
              </div>

              {referenceFields.map((field, index) => (<Card key={field.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input {...register(`references.${index}.name`)} placeholder="Jane Smith"/>
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Input {...register(`references.${index}.relationship`)} placeholder="Neighbor, Friend, Veterinarian"/>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input {...register(`references.${index}.phone`)} placeholder="(555) 123-4567"/>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" {...register(`references.${index}.email`)} placeholder="jane@example.com"/>
                    </div>
                    <div className="space-y-2">
                      <Label>Years Known</Label>
                      <Input type="number" {...register(`references.${index}.knownFor`, { valueAsNumber: true })} placeholder="5"/>
                    </div>
                  </div>
                  {referenceFields.length > 2 && (<Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => removeReference(index)}>
                      <Minus className="h-4 w-4 mr-2"/>
                      Remove Reference
                    </Button>)}
                </Card>))}

              {errors.references && (<p className="text-sm text-red-500">{errors.references.message}</p>)}
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button type="submit">Continue to Review</Button>
            </div>
          </form>
        </CardContent>
      </Card>);
    }
    // Step 5 - Review and Submit
    return (<Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Review & Submit Application</CardTitle>
        <CardDescription>
          Step 5 of 5: Review your application and submit it to the shelter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStepIndicator()}
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4"/>
            <AlertDescription>
              By submitting this application, you agree to the shelter's adoption policies and
              understand that all applications are subject to approval. The shelter may contact your
              references and conduct a home visit.
            </AlertDescription>
          </Alert>

          {/* Application Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Application Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Name:</strong> {watch('personalInfo.firstName')}{' '}
                {watch('personalInfo.lastName')}
              </div>
              <div>
                <strong>Email:</strong> {watch('personalInfo.email')}
              </div>
              <div>
                <strong>Phone:</strong> {watch('personalInfo.phone')}
              </div>
              <div>
                <strong>Household Size:</strong> {watch('personalInfo.householdSize')}
              </div>
              <div>
                <strong>Residence:</strong> {watch('livingSituation.residenceType')} (
                {watch('livingSituation.ownership')})
              </div>
              <div>
                <strong>References:</strong> {referenceFields.length}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setCurrentStep(4)}>
              Back
            </Button>
            <Button onClick={handleSubmit(onFormSubmit)} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>);
};
//# sourceMappingURL=AdoptionApplicationForm.jsx.map
//# sourceMappingURL=AdoptionApplicationForm.jsx.map
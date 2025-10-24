import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
export const PetExperienceSection = ({ form, onNext, onBack, watchedHasOwnedPets, watchedSpeciesPrefs, watchedSizePrefs, onSpeciesToggle, onSizeToggle, }) => {
    const { register, setValue, watch, control, formState: { errors }, } = form;
    const { fields: currentPetFields, append: appendCurrentPet, remove: removeCurrentPet, } = useFieldArray({
        control,
        name: 'petExperience.currentPets',
    });
    const { fields: previousPetFields, append: appendPreviousPet, remove: removePreviousPet, } = useFieldArray({
        control,
        name: 'petExperience.previousPets',
    });
    return (<div className="space-y-6">
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
                      <Checkbox {...register(`petExperience.currentPets.${index}.vaccinated`)}/>
                      <span>Vaccinated</span>
                    </Label>
                    <Label className="flex items-center space-x-2">
                      <Checkbox {...register(`petExperience.currentPets.${index}.spayedNeutered`)}/>
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
            {['dog', 'cat', 'bird', 'rabbit', 'other'].map((species) => (<Badge key={species} variant={watchedSpeciesPrefs.includes(species) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => onSpeciesToggle(species)}>
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
            {['tiny', 'small', 'medium', 'large', 'extra-large'].map((size) => (<Badge key={size} variant={watchedSizePrefs.includes(size) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => onSizeToggle(size)}>
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
            <Input type="number" {...register('petExperience.petPreferences.ageRange.min', { valueAsNumber: true })} placeholder="0"/>
          </div>
          <div className="space-y-2">
            <Label>Maximum Age</Label>
            <Input type="number" {...register('petExperience.petPreferences.ageRange.max', { valueAsNumber: true })} placeholder="10"/>
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
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" onClick={onNext}>
          Continue to Lifestyle
        </Button>
      </div>
    </div>);
};
//# sourceMappingURL=PetExperienceSection.jsx.map
//# sourceMappingURL=PetExperienceSection.jsx.map
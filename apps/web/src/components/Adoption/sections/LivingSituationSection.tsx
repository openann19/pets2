import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
export const LivingSituationSection = ({ form, onNext, onBack, watchedResidenceType, watchedOwnership, }) => {
    const { register, setValue, watch } = form;
    return (<div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="residenceType">Type of Residence *</Label>
          <Select value={watchedResidenceType} onValueChange={(value) => setValue('livingSituation.residenceType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select residence type"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="mobile_home">Mobile Home</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownership">Ownership Status *</Label>
          <Select value={watchedOwnership} onValueChange={(value) => setValue('livingSituation.ownership', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select ownership status"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="own">Own</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="lease">Lease</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(watchedResidenceType === 'house' || watchedResidenceType === 'condo') && (<div className="space-y-2">
            <Label htmlFor="yardType">Yard Type</Label>
            <Select value={watch('livingSituation.yardType') || ''} onValueChange={(value) => setValue('livingSituation.yardType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select yard type"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fenced">Fenced</SelectItem>
                <SelectItem value="unfenced">Unfenced</SelectItem>
                <SelectItem value="no_yard">No Yard</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
              </SelectContent>
            </Select>
          </div>)}

        {watchedOwnership === 'rent' && (<div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Checkbox checked={watch('livingSituation.landlordPermission') || false} onCheckedChange={(checked) => setValue('livingSituation.landlordPermission', !!checked)}/>
              <span>Do you have landlord permission to have pets?</span>
            </Label>
          </div>)}
      </div>

      <div className="space-y-2">
        <Label htmlFor="movePlans">Future Move Plans</Label>
        <Textarea id="movePlans" {...register('livingSituation.movePlans')} placeholder="Do you plan to move in the next year? Any changes to your living situation?" rows={3}/>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" onClick={onNext}>
          Continue to Pet Experience
        </Button>
      </div>
    </div>);
};
//# sourceMappingURL=LivingSituationSection.jsx.map
//# sourceMappingURL=LivingSituationSection.jsx.map
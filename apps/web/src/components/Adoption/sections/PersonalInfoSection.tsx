import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
export const PersonalInfoSection = ({ form, onNext, watchedHasChildren, }) => {
    const { register, setValue, watch, formState: { errors }, } = form;
    return (<div className="space-y-6">
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
          {errors.personalInfo?.householdSize && (<p className="text-sm text-red-500">{errors.personalInfo.householdSize.message}</p>)}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Checkbox checked={watchedHasChildren} onCheckedChange={(checked) => setValue('personalInfo.hasChildren', !!checked)}/>
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
        <Button type="submit" onClick={onNext}>
          Continue to Living Situation
        </Button>
      </div>
    </div>);
};
//# sourceMappingURL=PersonalInfoSection.jsx.map
//# sourceMappingURL=PersonalInfoSection.jsx.map
import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
export const LifestyleSection = ({ form, onNext, onBack }) => {
    const { register, setValue, watch, control, formState: { errors }, } = form;
    const { fields: referenceFields, append: appendReference, remove: removeReference, } = useFieldArray({
        control,
        name: 'references',
    });
    return (<div className="space-y-6">
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
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => removeReference(index)}>
              <Minus className="h-4 w-4 mr-2"/>
              Remove Reference
            </Button>
          </Card>))}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" onClick={onNext}>
          Continue to Review
        </Button>
      </div>
    </div>);
};
//# sourceMappingURL=LifestyleSection.jsx.map
//# sourceMappingURL=LifestyleSection.jsx.map
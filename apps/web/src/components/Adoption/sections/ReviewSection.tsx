import React from 'react';
import { Button } from '@/components/ui/button';
const Card = ({ children, className = '' }) => (<div className={`rounded-lg border bg-white shadow-sm ${className}`}>{children}</div>);
const CardHeader = ({ children }) => <div className="p-6 pb-4">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>;
const CardContent = ({ children }) => <div className="p-6 pt-0">{children}</div>;
import { AdoptionApplicationFormData } from '../AdoptionApplicationForm';
// Simple icon components since lucide-react is not available
const CheckCircle = ({ className }) => (<svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
  </svg>);
const AlertCircle = ({ className }) => (<svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
  </svg>);
// Simple Alert component since it's not available in the ui package
const Alert = ({ variant, children }) => (<div className={`p-4 rounded-lg border ${variant === 'destructive'
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
    {children}
  </div>);
const AlertDescription = ({ children }) => <div>{children}</div>;
export const ReviewSection = ({ form, onBack, onSubmit, isSubmitting }) => {
    const { watch, formState: { errors }, } = form;
    const formData = watch();
    const hasErrors = Object.keys(errors).length > 0;
    return (<div className="space-y-6">
      {hasErrors && (<Alert variant="destructive">
          <AlertCircle className="h-4 w-4"/>
          <AlertDescription>
            Please review and fix the errors in your application before submitting.
          </AlertDescription>
        </Alert>)}

      {/* Personal Information Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500"/>
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Name:</strong> {formData.personalInfo.firstName}{' '}
            {formData.personalInfo.lastName}
          </p>
          <p>
            <strong>Email:</strong> {formData.personalInfo.email}
          </p>
          <p>
            <strong>Phone:</strong> {formData.personalInfo.phone}
          </p>
          <p>
            <strong>Household Size:</strong> {formData.personalInfo.householdSize}
          </p>
          {formData.personalInfo.hasChildren && (<p>
              <strong>Children's Ages:</strong> {formData.personalInfo.childrenAges?.join(', ')}
            </p>)}
        </CardContent>
      </Card>

      {/* Living Situation Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500"/>
            Living Situation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Residence Type:</strong> {formData.livingSituation.residenceType}
          </p>
          <p>
            <strong>Ownership:</strong> {formData.livingSituation.ownership}
          </p>
          {formData.livingSituation.yardType && (<p>
              <strong>Yard Type:</strong> {formData.livingSituation.yardType}
            </p>)}
          {formData.livingSituation.movePlans && (<p>
              <strong>Move Plans:</strong> {formData.livingSituation.movePlans}
            </p>)}
        </CardContent>
      </Card>

      {/* Pet Experience Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500"/>
            Pet Experience & Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Has Owned Pets:</strong> {formData.petExperience.hasOwnedPets ? 'Yes' : 'No'}
          </p>
          {formData.petExperience.hasOwnedPets && (<>
              <p>
                <strong>Current Pets:</strong> {formData.petExperience.currentPets?.length || 0}
              </p>
              <p>
                <strong>Previous Pets:</strong> {formData.petExperience.previousPets?.length || 0}
              </p>
            </>)}
          <div>
            <strong>Preferred Species:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.petExperience.petPreferences.species.map((species) => (<Badge key={species} variant="secondary">
                  {species}
                </Badge>))}
            </div>
          </div>
          <div>
            <strong>Preferred Sizes:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.petExperience.petPreferences.size.map((size) => (<Badge key={size} variant="secondary">
                  {size}
                </Badge>))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500"/>
            Lifestyle & References
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Monthly Budget:</strong> ${formData.lifestyle.budget.monthlyPetBudget}
          </p>
          <p>
            <strong>Emergency Fund:</strong>{' '}
            {formData.lifestyle.budget.emergencyFund ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>References:</strong> {formData.references.length}
          </p>
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4"/>
        <AlertDescription>
          Please review all information above. Once submitted, your application will be reviewed by
          our adoption team.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" onClick={onSubmit} disabled={isSubmitting || hasErrors}>
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </div>);
};
//# sourceMappingURL=ReviewSection.jsx.map
//# sourceMappingURL=ReviewSection.jsx.map
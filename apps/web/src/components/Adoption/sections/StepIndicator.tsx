import React from 'react';
export const StepIndicator = ({ currentStep, totalSteps }) => (<div className="flex items-center justify-center mb-8">
    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (<React.Fragment key={step}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
          {step}
        </div>
        {step < totalSteps && (<div className={`w-12 h-1 ${step < currentStep ? 'bg-blue-500' : 'bg-gray-200'}`}/>)}
      </React.Fragment>))}
  </div>);
//# sourceMappingURL=StepIndicator.jsx.map
//# sourceMappingURL=StepIndicator.jsx.map
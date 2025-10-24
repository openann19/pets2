import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Heart, CheckCircle, AlertCircle, TrendingUp, Users, Calendar, Star, } from 'lucide-react';
export const AIAdoptionAssistant = ({ application, pet, onCompatibilityUpdate, onRecommendationAction, }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [compatibilityScore, setCompatibilityScore] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [riskFactors, setRiskFactors] = useState([]);
    const [interviewQuestions, setInterviewQuestions] = useState([]);
    useEffect(() => {
        // Simulate AI analysis
        analyzeCompatibility();
    }, [application, pet]);
    const analyzeCompatibility = async () => {
        setIsAnalyzing(true);
        // Simulate AI processing time
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Mock AI analysis based on application and pet data
        const mockAnalysis = generateMockAnalysis(application, pet);
        setCompatibilityScore(mockAnalysis.compatibility_score);
        setAnalysis(mockAnalysis);
        setRecommendations(mockAnalysis.recommendation ? [mockAnalysis.recommendation] : []);
        setRiskFactors(mockAnalysis.factors.filter((factor) => factor.includes('risk') || factor.includes('concern')));
        setInterviewQuestions(mockAnalysis.interview_questions || []);
        if (onCompatibilityUpdate) {
            onCompatibilityUpdate(mockAnalysis);
        }
        setIsAnalyzing(false);
    };
    const generateMockAnalysis = (app, pet) => {
        // This would be replaced with actual AI/ML analysis
        const baseScore = Math.random() * 40 + 60; // 60-100 range
        let score = baseScore;
        // Adjust score based on various factors
        if (app.petExperience.hasOwnedPets)
            score += 5;
        if (app.livingSituation.residenceType === 'house')
            score += 3;
        if (app.livingSituation.yardType === 'fenced')
            score += 2;
        if (app.lifestyle.budget.emergencyFund)
            score += 3;
        if (app.references.length >= 3)
            score += 2;
        // Species preference match
        if (app.petExperience.petPreferences.species.includes(pet.species))
            score += 5;
        // Size preference match
        if (app.petExperience.petPreferences.size.includes(pet.size))
            score += 3;
        // Age range match
        const ageInRange = pet.age >= app.petExperience.petPreferences.ageRange.min &&
            pet.age <= app.petExperience.petPreferences.ageRange.max;
        if (ageInRange)
            score += 2;
        // Clamp score between 0-100
        score = Math.max(0, Math.min(100, score));
        const factors = [];
        // Positive factors
        if (app.petExperience.hasOwnedPets) {
            factors.push('Applicant has prior pet ownership experience');
        }
        if (app.livingSituation.residenceType === 'house') {
            factors.push('Suitable living environment for pet');
        }
        if (app.lifestyle.budget.emergencyFund) {
            factors.push('Emergency fund available for unexpected costs');
        }
        // Risk factors
        if (!app.petExperience.hasOwnedPets) {
            factors.push('First-time pet owner - may need additional education');
        }
        if (app.livingSituation.residenceType === 'apartment' &&
            !app.livingSituation.landlordPermission) {
            factors.push('Potential landlord permission concerns for apartment living');
        }
        if (app.lifestyle.budget.monthlyPetBudget < 150) {
            factors.push('Budget may be insufficient for proper pet care');
        }
        if (app.references.length < 2) {
            factors.push('Limited references provided');
        }
        let recommendation = '';
        if (score >= 85) {
            recommendation = 'Strong match - recommend approval with standard home visit';
        }
        else if (score >= 70) {
            recommendation = 'Good match - recommend approval with additional screening';
        }
        else if (score >= 55) {
            recommendation = 'Moderate match - schedule virtual meetup to assess further';
        }
        else {
            recommendation = 'Poor match - additional information or rejection recommended';
        }
        const interviewQuestions = [
            'Can you tell us more about your daily routine and how the pet would fit in?',
            'What experience do you have with pets requiring similar care to this one?',
            'How would you handle potential behavioral challenges?',
            'What is your long-term plan for this pet?',
            'How would you introduce this pet to your current household?',
        ];
        return {
            compatibility_score: Math.round(score),
            factors,
            recommendation,
            interview_questions: interviewQuestions,
        };
    };
    const getCompatibilityColor = (score) => {
        if (score >= 80)
            return 'text-green-600';
        if (score >= 60)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    const getCompatibilityBadge = (score) => {
        if (score >= 80)
            return { variant: 'default', text: 'Excellent Match' };
        if (score >= 60)
            return { variant: 'secondary', text: 'Good Match' };
        return { variant: 'destructive', text: 'Poor Match' };
    };
    if (isAnalyzing) {
        return (<Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 text-blue-500 animate-pulse mx-auto"/>
            <div>
              <h3 className="text-lg font-semibold">AI Analysis in Progress</h3>
              <p className="text-gray-600">Analyzing compatibility between applicant and pet...</p>
            </div>
            <Progress value={75} className="w-64 mx-auto"/>
          </div>
        </CardContent>
      </Card>);
    }
    if (!compatibilityScore || !analysis) {
        return (<Card>
        <CardContent className="py-12">
          <Alert>
            <AlertCircle className="h-4 w-4"/>
            <AlertDescription>
              Unable to perform AI analysis. Please try again or proceed with manual review.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>);
    }
    const badge = getCompatibilityBadge(compatibilityScore);
    return (<div className="space-y-6">
      {/* Compatibility Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500"/>
            AI Compatibility Analysis
          </CardTitle>
          <CardDescription>AI-powered assessment of applicant-pet compatibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getCompatibilityColor(compatibilityScore)}`}>
                {compatibilityScore}%
              </div>
              <Badge variant={badge.variant} className="mt-2">
                {badge.text}
              </Badge>
            </div>

            <Progress value={compatibilityScore} className="w-full"/>

            <div className="text-center text-sm text-gray-600">Compatibility Score</div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500"/>
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (<Alert key={index}>
                <CheckCircle className="h-4 w-4"/>
                <AlertDescription>{rec}</AlertDescription>
              </Alert>))}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button onClick={() => onRecommendationAction?.('approve')} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2"/>
                Approve Application
              </Button>
              <Button onClick={() => onRecommendationAction?.('schedule_meetup')} variant="outline">
                <Calendar className="h-4 w-4 mr-2"/>
                Schedule Meetup
              </Button>
              <Button onClick={() => onRecommendationAction?.('request_more_info')} variant="outline">
                <Users className="h-4 w-4 mr-2"/>
                Request More Info
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Positive Factors */}
            <div>
              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4"/>
                Positive Factors
              </h4>
              <ul className="space-y-1">
                {analysis.factors
            .filter((factor) => !factor.includes('risk') &&
            !factor.includes('concern') &&
            !factor.includes('Limited'))
            .map((factor, index) => (<li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <Star className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0"/>
                      {factor}
                    </li>))}
              </ul>
            </div>

            {/* Risk Factors */}
            {riskFactors.length > 0 && (<div>
                <h4 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4"/>
                  Areas of Concern
                </h4>
                <ul className="space-y-1">
                  {riskFactors.map((factor, index) => (<li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <AlertCircle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0"/>
                      {factor}
                    </li>))}
                </ul>
              </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Interview Questions */}
      {interviewQuestions.length > 0 && (<Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500"/>
              Suggested Interview Questions
            </CardTitle>
            <CardDescription>
              AI-generated questions to ask during the interview or meetup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interviewQuestions.map((question, index) => (<div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="text-sm italic">"{question}"</p>
                </div>))}
            </div>
          </CardContent>
        </Card>)}

      {/* Application Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Applicant:</strong> {application.personalInfo.firstName}{' '}
              {application.personalInfo.lastName}
            </div>
            <div>
              <strong>Pet:</strong> {pet.name} ({pet.species})
            </div>
            <div>
              <strong>Experience:</strong>{' '}
              {application.petExperience.hasOwnedPets ? 'Has pet experience' : 'First-time owner'}
            </div>
            <div>
              <strong>Household:</strong> {application.personalInfo.householdSize} people
              {application.personalInfo.hasChildren && `, with children`}
            </div>
            <div>
              <strong>Residence:</strong> {application.livingSituation.residenceType}
              {application.livingSituation.ownership === 'rent' && ' (rented)'}
            </div>
            <div>
              <strong>Budget:</strong> ${application.lifestyle.budget.monthlyPetBudget}/month
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
};
//# sourceMappingURL=AIAdoptionAssistant.jsx.map
//# sourceMappingURL=AIAdoptionAssistant.jsx.map
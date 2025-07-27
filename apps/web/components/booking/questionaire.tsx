'use client'
import React, { useState } from 'react';


const DentalQuestionnaire = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    purpose: '',
    preferences: [],
    lastVisit: '',
    timePreference: '',
    urgency: '',
    hasInsurance: '',
    insuranceProvider: '',
    willBook: '',
    barriers: [],
    governmentInsurance: ''
  });

  const totalSteps = 11;
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const questions = {
    1: {
      title: "What is the main purpose of your visit?",
      options: [
        { id: 'checkup', label: 'Checkup & Cleaning', icon: '🦷' },
        { id: 'procedure', label: 'Specific Procedure', icon: '🔧' },
        { id: 'emergency', label: 'Dental Emergency', icon: '🚨' },
        { id: 'opinion', label: 'Second Opinion', icon: '📋' }
      ],
      type: 'single'
    },
    2: {
      title: "What I'm looking for in a dentist is...",
      options: [
        { id: 'nearby', label: 'Nearby Location' },
        { id: 'insurance', label: 'Accepts My Insurance' },
        { id: 'rated', label: 'Top Rated' },
        { id: 'flexible', label: 'Schedule Flexibility' },
        { id: 'modern', label: 'Modern Clinic' },
        { id: 'experienced', label: 'Highly Experienced' }
      ],
      type: 'multiple'
    },
    3: {
      title: "When was the last time you saw a dentist?",
      options: [
        { id: 'recent', label: 'Less Than A Year' },
        { id: 'medium', label: '1-3 Years' },
        { id: 'long', label: '3+ Years' },
        { id: 'never', label: 'Never Seen One' }
      ],
      type: 'single'
    },
    4: {
      title: "What time works best for your visit?",
      options: [
        { id: 'morning', label: 'Morning 8am-12pm' },
        { id: 'afternoon', label: 'Afternoon 12pm-5pm' },
        { id: 'evening', label: 'Evening After 5pm' },
        { id: 'weekend', label: 'Weekends Sat-Sun' }
      ],
      type: 'single'
    },
    5: {
      title: "How soon would you like to receive care?",
      options: [
        { id: 'asap', label: 'As Soon As Possible' },
        { id: 'week', label: 'Within A Week' },
        { id: 'weeks', label: '1-2 Weeks' },
        { id: 'later', label: 'More Than 2 Weeks' }
      ],
      type: 'single'
    },
    6: {
      title: "Do you have dental insurance?",
      options: [
        { id: 'yes', label: 'Yes I have insurance', icon: '🦷✅' },
        { id: 'no', label: 'No I don\'t have insurance', icon: '🦷❌' }
      ],
      type: 'single'
    },
    7: {
      title: "Who is your dental insurance provider?",
      options: [
        { id: 'manulife', label: 'Manulife', logo: '🏢' },
        { id: 'sunlife', label: 'Sun Life', logo: '☀️' },
        { id: 'canadalife', label: 'Canada Life', logo: '🍁' },
        { id: 'bluecross', label: 'Blue Cross', logo: '➕' },
        { id: 'ia', label: 'Industrial Alliance', logo: '🏭' },
        { id: 'desjardins', label: 'Desjardins', logo: '🔷' },
        { id: 'greenshield', label: 'Green Shield', logo: '🛡️' },
        { id: 'cdcp', label: 'CDCP', logo: '🏥' },
        { id: 'other', label: 'Other', logo: '❓' }
      ],
      type: 'single'
    },
    8: {
      title: "If we found you a dentist that matches all of your criteria, are you willing to book an appointment?",
      options: [
        { id: 'yes', label: 'Yes', icon: '✅' },
        { id: 'no', label: 'No', icon: '❌' }
      ],
      type: 'single'
    },
    9: {
      title: "What's holding you back?",
      subtitle: "We may be able to provide you with more information or help out in the future.",
      options: [
        { id: 'insurance', label: 'Waiting for insurance benefit to renew' },
        { id: 'partner', label: 'I need to check with my partner first' },
        { id: 'time', label: 'Don\'t have the time' },
        { id: 'notlooking', label: 'Not looking for a dentist right now' },
        { id: 'other', label: 'Other' }
      ],
      type: 'multiple'
    },
    10: {
      title: "Are you using any government insurance to pay for your visit?",
      options: [
        { id: 'yes', label: 'Yes', subtitle: 'I\'ll use a social assistance program' },
        { id: 'no', label: 'No', subtitle: 'I\'ll pay out of pocket' }
      ],
      type: 'single'
    }
  };

  const handleOptionSelect = (optionId, isMultiple = false) => {
    if (isMultiple) {
      const currentPrefs = formData.preferences || [];
      const newPrefs = currentPrefs.includes(optionId)
        ? currentPrefs.filter(id => id !== optionId)
        : [...currentPrefs, optionId];
      
      setFormData(prev => ({
        ...prev,
        preferences: newPrefs
      }));
    } else {
      // Update appropriate field based on current step
      const fieldMap = {
        1: 'purpose',
        3: 'lastVisit',
        4: 'timePreference',
        5: 'urgency',
        6: 'hasInsurance',
        7: 'insuranceProvider',
        8: 'willBook',
        10: 'governmentInsurance'
      };
      
      const field = fieldMap[currentStep];
      if (field) {
        setFormData(prev => ({
          ...prev,
          [field]: optionId
        }));
      }
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle form completion
      console.log('Form completed:', formData);
      alert('Thank you! We\'ll find the perfect dentist for you.');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.purpose;
      case 2: return formData.preferences.length > 0;
      case 3: return formData.lastVisit;
      case 4: return formData.timePreference;
      case 5: return formData.urgency;
      case 6: return formData.hasInsurance;
      case 7: return formData.hasInsurance === 'no' || formData.insuranceProvider;
      case 8: return formData.willBook;
      case 9: return formData.willBook === 'yes' || formData.barriers.length > 0;
      case 10: return formData.governmentInsurance;
      default: return true;
    }
  };

  // Skip step 7 if no insurance
  const getNextStep = () => {
    if (currentStep === 6 && formData.hasInsurance === 'no') {
      return 8;
    }
    if (currentStep === 8 && formData.willBook === 'yes') {
      return 10;
    }
    return currentStep + 1;
  };

  const getPrevStep = () => {
    if (currentStep === 8 && formData.hasInsurance === 'no') {
      return 6;
    }
    if (currentStep === 10 && formData.willBook === 'yes') {
      return 8;
    }
    return currentStep - 1;
  };

  const currentQuestion = questions[currentStep];
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div 
          className="bg-pink-500 h-2 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          
          {/* Question Title */}
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {currentQuestion.title}
            </h1>
            {currentQuestion.subtitle && (
              <p className="text-gray-600 text-lg">
                {currentQuestion.subtitle}
              </p>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {currentQuestion.options.map((option) => {
              const isSelected = currentQuestion.type === 'multiple' 
                ? formData.preferences.includes(option.id)
                : formData[{
                    1: 'purpose',
                    3: 'lastVisit', 
                    4: 'timePreference',
                    5: 'urgency',
                    6: 'hasInsurance',
                    7: 'insuranceProvider',
                    8: 'willBook',
                    10: 'governmentInsurance'
                  }[currentStep]] === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id, currentQuestion.type === 'multiple')}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg
                    ${isSelected 
                      ? 'border-pink-500 bg-pink-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  {/* Icon or Logo */}
                  {(option.icon || option.logo) && (
                    <div className="text-3xl mb-3">
                      {option.icon || option.logo}
                    </div>
                  )}
                  
                  {/* Label */}
                  <div className="font-semibold text-gray-900 mb-1">
                    {option.label}
                  </div>
                  
                  {/* Subtitle */}
                  {option.subtitle && (
                    <div className="text-sm text-gray-600">
                      {option.subtitle}
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                BACK
              </button>
            )}
            
            {canProceed() && (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors flex items-center gap-2"
              >
                {currentStep === totalSteps ? 'COMPLETE' : 'NEXT'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Step Indicator */}
          <div className="text-center mt-8 text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentalQuestionnaire;
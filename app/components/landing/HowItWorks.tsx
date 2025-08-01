import React from 'react';

interface HowItWorksProps {
  rewardAmount: string;
}

const steps = [
  {
    icon: (
      <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Search & Compare',
    description:
      'Enter your location and browse verified dentists. Compare ratings, reviews, and availability.',
  },
  {
    icon: (
      <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Book Instantly',
    description:
      'Select your preferred appointment time and book online instantly. No calls needed.',
  },
  {
    icon: (
      <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    title: 'Get Reward',
    description: 'Enjoy your reward after the appointment and share feedback to help others.',
  },
];

export function HowItWorks({ rewardAmount }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="py-16 bg-gray-50 font-serif">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          How It Works
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Finding and booking your ideal dentist is now effortless.
        </p>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10">
              {/* Connector */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-gray-300">
                  <div className="absolute right-0 top-[-6px] w-3 h-3 bg-gray-300 rounded-full"></div>
                </div>
              )}

              <div className="mx-auto mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg">
                  {step.icon}
                </div>
              </div>

              <h3 className="text-xl text-gray-800 font-medium mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white border border-gray-200 rounded-xl shadow-inner p-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-accent mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-2xl font-bold text-gray-800">
              {rewardAmount} Gift Card
            </span>
          </div>
          <p className="text-gray-600">
            Book your first appointment through our platform and receive a {rewardAmount} gift card after your visit!
          </p>
        </div>
      </div>
    </section>
  );
}

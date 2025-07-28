// src/components/landing/HowItWorks.tsx
export function HowItWorks() {
  const steps = [
    {
      icon: (
        <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "1. Search & Compare",
      description: "Enter your location and browse verified dentists in your area. Compare ratings, reviews, and availability.",
      bgColor: "bg-blue-100"
    },
    {
      icon: (
        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "2. Book Instantly",
      description: "Select your preferred appointment time and book instantly online. No phone calls or waiting required.",
      bgColor: "bg-green-100"
    },
    {
      icon: (
        <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: "3. Get Your Reward",
      description: "Complete your appointment and receive a $50 gift card. Plus, leave a review to help others!",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Finding and booking your ideal dentist has never been easier
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-300 z-0">
                  <div className="absolute right-0 top-0 w-3 h-3 bg-gray-300 rounded-full transform translate-x-1/2 -translate-y-1"></div>
                </div>
              )}
              
              <div className={`${step.bgColor} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10`}>
                {step.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-2xl font-bold text-gray-900">$50 Gift Card</span>
            </div>
            <p className="text-gray-600 text-lg">
              Book your first appointment through our platform and receive a $50 gift card after your visit!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
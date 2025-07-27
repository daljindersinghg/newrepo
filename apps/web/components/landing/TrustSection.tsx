// src/components/landing/TrustSection.tsx
export function TrustSection() {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      location: "New York, NY",
      rating: 5,
      text: "Amazing experience! Found a great dentist near me within minutes and got my $50 gift card after the appointment. The booking process was so smooth.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      location: "Los Angeles, CA",
      rating: 5,
      text: "I was skeptical at first, but this platform delivered exactly what it promised. Great dentist, easy booking, and yes - I really did get the gift card!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      location: "Chicago, IL",
      rating: 5,
      text: "Best dental booking experience ever. The dentist was professional, the office was clean, and the whole process from booking to treatment was seamless.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    }
  ];

  const trustBadges = [
    {
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "HIPAA Compliant",
      description: "Your health information is secure and protected"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: "SSL Encrypted",
      description: "Bank-level security for all transactions"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Verified Dentists",
      description: "All dentists are licensed and background checked"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      ),
      title: "Quality Guarantee",
      description: "100% satisfaction or your money back"
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted & Secure Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Your privacy and security are our top priorities
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  {badge.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{badge.title}</h3>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              What Our Patients Say
            </h3>
            <p className="text-lg text-gray-600">
              Real reviews from real patients who used our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  {renderStars(testimonial.rating)}
                </div>
                
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-gray-600">Happy Patients</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">1,200+</div>
              <div className="text-gray-600">Verified Dentists</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">4.9★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">$2.5M+</div>
              <div className="text-gray-600">In Gift Cards Given</div>
            </div>
          </div>
        </div>

        {/* Press Mentions */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-8">As featured in:</p>
          <div className="flex justify-center items-center space-x-12 opacity-50">
            <div className="text-2xl font-bold text-gray-400">TechCrunch</div>
            <div className="text-2xl font-bold text-gray-400">Forbes</div>
            <div className="text-2xl font-bold text-gray-400">USA Today</div>
            <div className="text-2xl font-bold text-gray-400">Dental News</div>
          </div>
        </div>
      </div>
    </section>
  );
}
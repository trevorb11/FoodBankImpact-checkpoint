import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CountUp } from '@/components/ui/count-up';
import { IMPACT_FORMULAS } from '@/lib/constants';
import { calculateImpactMetrics } from '@/lib/utils';
import { ChevronRight, ChevronLeft, Heart, Share2, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';

// Slides in the experience
const SLIDES = [
  'welcome',
  'meals',
  'people',
  'history',
  'thanks',
  'summary'
];

const DonorImpactExperience = () => {
  const { id } = useParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animateCount, setAnimateCount] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
  // Fetch donor and food bank data using the impact URL
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/impact/${id}`],
  });
  
  const donor = data?.donor;
  const foodBank = data?.foodBank;
  
  // Calculate impact metrics
  const impact = donor ? calculateImpactMetrics(Number(donor.totalGiving)) : {
    meals: 0,
    people: 0,
    pounds: 0,
    co2Saved: 0,
    waterSaved: 0
  };
  
  // Format date to readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  // Handle slide navigation
  const goToNextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setAnimateCount(true);
    }
  };
  
  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  // Trigger count animation when slide changes
  useEffect(() => {
    if (animateCount) {
      const timer = setTimeout(() => {
        setAnimateCount(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [animateCount]);
  
  // Copy URL to clipboard
  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };
  
  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted p-4">
        <Card className="max-w-2xl w-full overflow-hidden rounded-xl shadow-xl p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-16 w-16 bg-muted-foreground/20 rounded-full mx-auto"></div>
            <div className="h-8 bg-muted-foreground/20 rounded w-3/4 mx-auto"></div>
            <div className="h-6 bg-muted-foreground/20 rounded w-1/2 mx-auto"></div>
            <div className="h-10 bg-muted-foreground/20 rounded w-1/3 mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }
  
  // If error or donor not found, show error state
  if (error || !donor || !foodBank) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted p-4">
        <Card className="max-w-2xl w-full overflow-hidden rounded-xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Impact Experience Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Sorry, we couldn't find the requested donor impact experience. 
            The link may be incorrect or expired.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="max-w-2xl w-full overflow-hidden rounded-xl shadow-xl">
        {/* Welcome Slide */}
        {SLIDES[currentSlide] === 'welcome' && (
          <div className="p-8 text-center" style={{ background: `linear-gradient(135deg, ${foodBank.primaryColor}40, ${foodBank.secondaryColor}40)` }}>
            {foodBank.logo ? (
              <img src={foodBank.logo} alt={foodBank.name} className="h-16 mx-auto mb-6" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23ccc'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Crect%20x='3'%20y='3'%20width='18'%20height='18'%20rx='2'%20ry='2'%3E%3C/rect%3E%3Ccircle%20cx='8.5'%20cy='8.5'%20r='1.5'%3E%3C/circle%3E%3Cpolyline%20points='21%2015%2016%2010%205%2021'%3E%3C/polyline%3E%3C/svg%3E";
                }}
              />
            ) : (
              <div className="rounded-lg bg-white/40 p-4 inline-block mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            <h1 className="text-3xl font-bold mb-4">
              Hey {donor.firstName}!
            </h1>
            
            <div className="mb-6">
              <p className="text-xl font-medium mb-2">Here's your</p>
              <div className="flex items-center justify-center">
                <h2 className="text-4xl font-bold">
                  <span style={{ color: foodBank.primaryColor }}>2023</span> 
                  <span className="mx-2">Impact</span>
                  <span style={{ color: foodBank.secondaryColor }}>Wrapped</span>
                </h2>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              Let's discover the amazing difference you've made in our community!
            </p>
            
            <Button 
              className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg shadow-md text-white"
              style={{ backgroundColor: foodBank.primaryColor }}
              onClick={goToNextSlide}
            >
              Start Your Journey <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Meals Provided Slide */}
        {SLIDES[currentSlide] === 'meals' && (
          <div className="p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Thanks to your generosity...
            </h2>
            
            <div className="relative mb-6">
              <div className="text-7xl md:text-8xl font-bold my-12" style={{ color: foodBank.primaryColor }}>
                {animateCount ? (
                  <CountUp end={impact.meals} duration={1.5} />
                ) : (
                  impact.meals.toLocaleString()
                )}
              </div>
              <div className="text-2xl md:text-3xl font-medium">
                meals provided
              </div>
              
              <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-10 h-10 flex items-center justify-center"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      transform: `rotate(${Math.random() * 360}deg)`
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                      <path d="M7 2v20"></path>
                      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"></path>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-8">
              Every dollar you donated provided approximately {IMPACT_FORMULAS.DOLLARS_TO_MEALS} meals to people facing hunger in our community.
            </p>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={goToPreviousSlide}
                className="inline-flex items-center"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button 
                className="inline-flex items-center text-white"
                style={{ backgroundColor: foodBank.primaryColor }}
                onClick={goToNextSlide}
              >
                Next <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        
        {/* People Helped Slide */}
        {SLIDES[currentSlide] === 'people' && (
          <div className="p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Your donations helped...
            </h2>
            
            <div className="relative mb-6">
              <div className="flex justify-center items-end gap-2 my-12">
                <div className="text-7xl md:text-8xl font-bold" style={{ color: foodBank.secondaryColor }}>
                  {animateCount ? (
                    <CountUp end={impact.people} duration={1.5} />
                  ) : (
                    impact.people.toLocaleString()
                  )}
                </div>
                <div className="text-2xl md:text-3xl font-medium mb-3">
                  people
                </div>
              </div>
              
              <div className="flex justify-center gap-2 flex-wrap max-w-md mx-auto mb-4">
                {[...Array(Math.min(impact.people, 20))].map((_, i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"></path>
                      <path d="M12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"></path>
                    </svg>
                  </div>
                ))}
                {impact.people > 20 && (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
                    +{impact.people - 20}
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-8">
              That's approximately {impact.people.toLocaleString()} neighbors who received 
              nutritious food thanks to your support!
            </p>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={goToPreviousSlide}
                className="inline-flex items-center"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button 
                className="inline-flex items-center text-white"
                style={{ backgroundColor: foodBank.primaryColor }}
                onClick={goToNextSlide}
              >
                Next <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Giving History Slide */}
        {SLIDES[currentSlide] === 'history' && (
          <div className="p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center animate-fade-in">
              Your Giving Journey
            </h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-4 transition-all duration-500 ease-in-out transform hover:translate-x-1 animate-slide-in-left">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 ease-in-out transform hover:scale-110" 
                  style={{ backgroundColor: `${foodBank.primaryColor}20` }}
                >
                  <span 
                    className="text-xl font-bold" 
                    style={{ color: foodBank.primaryColor }}
                  >
                    1
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">First Gift</h3>
                  <p className="text-muted-foreground">
                    {formatDate(donor.firstGiftDate)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 transition-all duration-500 ease-in-out delay-100 transform hover:translate-x-1 animate-slide-in-left" style={{ animationDelay: '100ms' }}>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 ease-in-out transform hover:scale-110" 
                  style={{ backgroundColor: `${foodBank.secondaryColor}20` }}
                >
                  <span 
                    className="text-xl font-bold" 
                    style={{ color: foodBank.secondaryColor }}
                  >
                    $
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Largest Gift</h3>
                  <p className="text-muted-foreground">
                    ${donor.largestGift ? Number(donor.largestGift).toFixed(2) : '0.00'} on {formatDate(donor.lastGiftDate)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 transition-all duration-500 ease-in-out delay-200 transform hover:translate-x-1 animate-slide-in-left" style={{ animationDelay: '200ms' }}>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 ease-in-out transform hover:scale-110" 
                  style={{ backgroundColor: `${foodBank.primaryColor}20` }}
                >
                  <Heart 
                    className="h-6 w-6" 
                    style={{ color: foodBank.primaryColor }} 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Total Giving</h3>
                  <p className="text-muted-foreground">
                    ${Number(donor.totalGiving).toFixed(2)} across {donor.giftCount || 1} {donor.giftCount === 1 ? 'gift' : 'gifts'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <h3 className="text-xl font-bold mb-2">Your Impact Over Time</h3>
              <p className="text-muted-foreground">
                You've helped provide approximately {impact.meals.toLocaleString()} meals since your first gift, 
                which means about {impact.people.toLocaleString()} people have been able to eat thanks to your generosity.
              </p>
            </div>
            
            <div className="flex justify-between animate-fade-in" style={{ animationDelay: '500ms' }}>
              <Button 
                variant="outline"
                onClick={goToPreviousSlide}
                className="inline-flex items-center hover:scale-105 transition-transform duration-200"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button 
                className="inline-flex items-center text-white hover:scale-105 transition-transform duration-200"
                style={{ backgroundColor: foodBank.primaryColor }}
                onClick={goToNextSlide}
              >
                Next <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Thank You Slide */}
        {SLIDES[currentSlide] === 'thanks' && (
          <div className="p-8 text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-scale transition-transform duration-700 transform hover:scale-110" 
              style={{ backgroundColor: `${foodBank.primaryColor}20` }}
            >
              <Heart 
                className="h-8 w-8 animate-heart-beat" 
                style={{ color: foodBank.primaryColor }} 
              />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-6 animate-fade-in">
              Thank You, {donor.firstName}!
            </h2>
            
            <div className="max-w-lg mx-auto mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <p className="text-lg leading-relaxed mb-6">
                {foodBank.thankYouMessage}
              </p>
              
              {foodBank.thankYouVideoUrl && (
                <div className="aspect-video bg-muted w-full rounded-lg flex items-center justify-center mb-6 animate-fade-in shadow-lg transition-transform duration-300 transform hover:scale-102" style={{ animationDelay: '400ms' }}>
                  <iframe 
                    className="w-full h-full rounded-lg"
                    src={foodBank.thankYouVideoUrl}
                    title="Thank You Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
            
            <div className="flex justify-between animate-fade-in" style={{ animationDelay: '500ms' }}>
              <Button 
                variant="outline"
                onClick={goToPreviousSlide}
                className="inline-flex items-center hover:scale-105 transition-transform duration-200"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button 
                className="inline-flex items-center text-white hover:scale-105 transition-transform duration-200"
                style={{ backgroundColor: foodBank.primaryColor }}
                onClick={goToNextSlide}
              >
                View Summary <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Summary Slide */}
        {SLIDES[currentSlide] === 'summary' && (
          <div className="p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center animate-fade-in">
              Your 2023 Impact Summary
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div 
                className="rounded-lg p-4 text-center shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 animate-slide-in-left"
                style={{ backgroundColor: `${foodBank.primaryColor}20`, animationDelay: '100ms' }}
              >
                <p className="text-sm uppercase font-medium mb-1">Total Giving</p>
                <p 
                  className="text-3xl font-bold" 
                  style={{ color: foodBank.primaryColor }}
                >
                  {animateCount ? (
                    <CountUp end={Number(donor.totalGiving)} duration={1.5} prefix="$" decimals={2} />
                  ) : (
                    `$${Number(donor.totalGiving).toFixed(2)}`
                  )}
                </p>
              </div>
              
              <div 
                className="rounded-lg p-4 text-center shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 animate-slide-in-right"
                style={{ backgroundColor: `${foodBank.secondaryColor}20`, animationDelay: '200ms' }}
              >
                <p className="text-sm uppercase font-medium mb-1">Meals Provided</p>
                <p 
                  className="text-3xl font-bold" 
                  style={{ color: foodBank.secondaryColor }}
                >
                  {animateCount ? (
                    <CountUp end={impact.meals} duration={1.5} />
                  ) : (
                    impact.meals.toLocaleString()
                  )}
                </p>
              </div>
              
              <div 
                className="rounded-lg p-4 text-center md:col-span-2 shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 animate-slide-in-bottom"
                style={{ backgroundColor: `${foodBank.primaryColor}10`, animationDelay: '300ms' }}
              >
                <p className="text-sm uppercase font-medium mb-1">People Helped</p>
                <p className="text-2xl font-bold">
                  {animateCount ? (
                    <CountUp end={impact.people} duration={1.5} />
                  ) : (
                    impact.people.toLocaleString()
                  )}
                </p>
              </div>
            </div>
            
            <div className="rounded-lg p-4 mb-8 bg-green-50 border border-green-100 shadow-md transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '400ms' }}>
              <h3 className="text-lg font-medium mb-2 text-green-800">Environmental Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="transition-transform duration-300 transform hover:scale-105">
                  <p className="text-sm text-muted-foreground mb-1">CO₂ Emissions Saved</p>
                  <p className="text-lg font-medium">
                    {animateCount ? (
                      <CountUp end={impact.co2Saved} duration={1.5} suffix=" lbs" />
                    ) : (
                      `${impact.co2Saved.toLocaleString()} lbs`
                    )}
                  </p>
                </div>
                <div className="transition-transform duration-300 transform hover:scale-105">
                  <p className="text-sm text-muted-foreground mb-1">Water Saved</p>
                  <p className="text-lg font-medium">
                    {animateCount ? (
                      <CountUp end={impact.waterSaved} duration={1.5} suffix=" gal" />
                    ) : (
                      `${impact.waterSaved.toLocaleString()} gal`
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
              <p className="mb-4 text-muted-foreground">Share your impact with others</p>
              <div className="flex justify-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full transition-transform duration-200 hover:scale-110 hover:bg-[#1DA1F2]/10" 
                  onClick={() => {
                    window.open(`https://twitter.com/intent/tweet?text=I've provided ${impact.meals.toLocaleString()} meals through my donations to ${foodBank.name}! Check out my impact: ${window.location.href}`, '_blank');
                  }}
                >
                  <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full transition-transform duration-200 hover:scale-110 hover:bg-[#1877F2]/10" 
                  onClick={() => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank');
                  }}
                >
                  <Facebook className="h-5 w-5 text-[#1877F2]" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full transition-transform duration-200 hover:scale-110 hover:bg-[#0077B5]/10" 
                  onClick={() => {
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank');
                  }}
                >
                  <Linkedin className="h-5 w-5 text-[#0077B5]" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full transition-transform duration-200 hover:scale-110" 
                  onClick={copyUrlToClipboard}
                >
                  {copiedToClipboard ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between animate-fade-in" style={{ animationDelay: '600ms' }}>
              <Button 
                variant="outline"
                onClick={goToPreviousSlide}
                className="inline-flex items-center hover:scale-105 transition-transform duration-200"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button 
                variant="outline"
                className="inline-flex items-center hover:scale-105 transition-transform duration-200"
                onClick={() => setCurrentSlide(0)}
              >
                Start Over
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DonorImpactExperience;

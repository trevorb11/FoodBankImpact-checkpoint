import { useState } from 'react';
import { useLocation } from 'wouter';
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronLeft, Heart, Share2 } from 'lucide-react';
import { calculateImpactMetrics } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Slides in the experience
const SLIDES = [
  'welcome',
  'meals',
  'people',
  'history',
  'thanks',
  'summary'
];

export default function AdminPreview() {
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // Fetch the food bank data
  const { data: foodBank, isLoading: isLoadingFoodBank } = useQuery({
    queryKey: ['/api/food-bank/1'],
  });
  
  // Fetch donors for this food bank to get a sample donor
  const { data: donors, isLoading: isLoadingDonors } = useQuery({
    queryKey: ['/api/donors/food-bank/1'],
  });
  
  // Get a sample donor (first one) for preview
  const sampleDonor = donors && donors.length > 0 ? donors[0] : null;
  
  // Calculate impact metrics for the sample donor using food bank-specific equivalencies
  const impact = sampleDonor ? calculateImpactMetrics(Number(sampleDonor.totalGiving), foodBank) : { meals: 0, people: 0 };
  
  // Format date to readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const goToNextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };
  
  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  // Renders the appropriate slide content
  const renderSlideContent = () => {
    if (!foodBank || !sampleDonor) {
      return (
        <div className="flex flex-col items-center justify-center h-72">
          <Skeleton className="h-24 w-24 rounded-full mb-4" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-10 w-40" />
        </div>
      );
    }
    
    switch (SLIDES[currentSlide]) {
      case 'welcome':
        return (
          <div className="p-8 text-center" style={{ background: `linear-gradient(135deg, ${foodBank.primaryColor}20, ${foodBank.secondaryColor}20)` }}>
            {foodBank.logo ? (
              <img 
                src={foodBank.logo} 
                alt={foodBank.name} 
                className="h-16 mx-auto mb-6"
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
              Hey {sampleDonor.firstName}!
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
        );
        
      case 'meals':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Thanks to your generosity...
            </h2>
            
            <div className="relative mb-6">
              <div 
                className="text-7xl md:text-8xl font-bold my-12" 
                style={{ color: foodBank.primaryColor }}
              >
                {impact.meals.toLocaleString()}
              </div>
              <div className="text-2xl md:text-3xl font-medium">
                meals provided
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-8">
              Every dollar you donated provided approximately {foodBank?.dollarsPerMeal ? Math.round(1/Number(foodBank.dollarsPerMeal)) : 10} meals to people facing hunger in our community.
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
                className="inline-flex items-center"
                style={{ backgroundColor: foodBank.primaryColor, color: 'white' }}
                onClick={goToNextSlide}
              >
                Next <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );
        
      case 'people':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Your donations helped...
            </h2>
            
            <div className="relative mb-6">
              <div className="flex justify-center items-end gap-2 my-12">
                <div 
                  className="text-7xl md:text-8xl font-bold" 
                  style={{ color: foodBank.secondaryColor }}
                >
                  {impact.people.toLocaleString()}
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
              That's approximately {impact.people} neighbors who received 
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
                className="inline-flex items-center"
                style={{ backgroundColor: foodBank.primaryColor, color: 'white' }}
                onClick={goToNextSlide}
              >
                Next <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );
        
      case 'history':
        return (
          <div className="p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              Your Giving Journey
            </h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center" 
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
                    {formatDate(sampleDonor.firstGiftDate)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center" 
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
                    ${sampleDonor.largestGift ? Number(sampleDonor.largestGift).toFixed(2) : '0.00'} on {formatDate(sampleDonor.lastGiftDate)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center" 
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
                    ${Number(sampleDonor.totalGiving).toFixed(2)} across {sampleDonor.giftCount || 1} {sampleDonor.giftCount === 1 ? 'gift' : 'gifts'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={goToPreviousSlide}
                className="inline-flex items-center"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button 
                className="inline-flex items-center"
                style={{ backgroundColor: foodBank.primaryColor, color: 'white' }}
                onClick={goToNextSlide}
              >
                Next <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );
        
      case 'thanks':
        return (
          <div className="p-8 text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" 
              style={{ backgroundColor: `${foodBank.primaryColor}20` }}
            >
              <Heart 
                className="h-8 w-8" 
                style={{ color: foodBank.primaryColor }} 
              />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Thank You, {sampleDonor.firstName}!
            </h2>
            
            <div className="max-w-lg mx-auto mb-8">
              <p className="text-lg leading-relaxed mb-6">
                {foodBank.thankYouMessage}
              </p>
              
              {foodBank.thankYouVideoUrl && (
                <div className="aspect-video bg-muted w-full rounded-lg flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={goToPreviousSlide}
                className="inline-flex items-center"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button 
                className="inline-flex items-center"
                style={{ backgroundColor: foodBank.primaryColor, color: 'white' }}
                onClick={goToNextSlide}
              >
                View Summary <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );
        
      case 'summary':
        return (
          <div className="p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              Your 2023 Impact Summary
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div 
                className="rounded-lg p-4 text-center" 
                style={{ backgroundColor: `${foodBank.primaryColor}20` }}
              >
                <p className="text-sm uppercase font-medium mb-1">Total Giving</p>
                <p 
                  className="text-3xl font-bold" 
                  style={{ color: foodBank.primaryColor }}
                >
                  ${Number(sampleDonor.totalGiving).toFixed(2)}
                </p>
              </div>
              
              <div 
                className="rounded-lg p-4 text-center" 
                style={{ backgroundColor: `${foodBank.secondaryColor}20` }}
              >
                <p className="text-sm uppercase font-medium mb-1">Meals Provided</p>
                <p 
                  className="text-3xl font-bold" 
                  style={{ color: foodBank.secondaryColor }}
                >
                  {impact.meals.toLocaleString()}
                </p>
              </div>
              
              <div 
                className="rounded-lg p-4 text-center md:col-span-2" 
                style={{ backgroundColor: `${foodBank.primaryColor}10` }}
              >
                <p className="text-sm uppercase font-medium mb-1">People Helped</p>
                <p className="text-2xl font-bold">{impact.people.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="rounded-lg p-4 mb-8 bg-green-50 border border-green-100">
              <h3 className="text-lg font-medium mb-2 text-green-800">Environmental Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">CO₂ Emissions Saved</p>
                  <p className="text-lg font-medium">{impact.co2Saved.toLocaleString()} lbs</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Water Saved</p>
                  <p className="text-lg font-medium">{impact.waterSaved.toLocaleString()} gal</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <p className="mb-4 text-muted-foreground">Share your impact with others</p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="icon" className="rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#1DA1F2]"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#1877F2]"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#0077B5]"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={goToPreviousSlide}
                className="inline-flex items-center"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button 
                variant="outline"
                className="inline-flex items-center"
                onClick={() => setCurrentSlide(0)}
              >
                Start Over
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <AdminLayout activeTab="preview">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Donor Impact Experience Preview</h1>
          <p className="text-muted-foreground">
            Preview how donors will see their personalized impact experience.
          </p>
        </div>
        
        <Card>
          <CardHeader className="border-b flex items-center justify-between">
            <CardTitle>Donor Impact Experience Preview</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant={viewMode === 'mobile' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                Mobile
              </Button>
              <Button 
                variant={viewMode === 'desktop' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                Desktop
              </Button>
            </div>
          </CardHeader>
          
          {/* Donor Experience Preview */}
          <CardContent className="p-6 bg-muted/50 flex justify-center">
            <div 
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                viewMode === 'mobile' ? 'w-72' : 'max-w-lg w-full'
              }`}
            >
              {renderSlideContent()}
            </div>
          </CardContent>
          
          {/* Slides Navigation */}
          <div className="p-6 border-t">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium">Preview Slides</h3>
              <div className="text-xs text-muted-foreground">
                Slide {currentSlide + 1} of {SLIDES.length}
              </div>
            </div>
            <div className="flex space-x-1 mb-2">
              {SLIDES.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1 rounded-full w-1/${SLIDES.length} ${
                    index === currentSlide ? 'bg-primary' : 'bg-muted'
                  }`}
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-6 gap-2">
              {SLIDES.map((slide, index) => (
                <div 
                  key={index}
                  className={`border rounded-md p-1 cursor-pointer ${
                    index === currentSlide 
                      ? 'bg-primary-50 border-primary-200' 
                      : 'bg-muted border-muted-foreground/20'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                >
                  <div className={`text-xs text-center ${
                    index === currentSlide 
                      ? 'text-primary-700 font-medium' 
                      : 'text-muted-foreground'
                  }`}>
                    {slide.charAt(0).toUpperCase() + slide.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation */}
          <CardFooter className="border-t flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setLocation('/admin/distribute')}
            >
              Back
            </Button>
            <Button 
              onClick={() => setLocation('/')}
            >
              Finish & Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}

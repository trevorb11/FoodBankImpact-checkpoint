import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, BarChart4, Users, Globe, Gift, Award, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation('/admin');
    } else {
      setLocation('/auth/register');
    }
  };

  const handleSignIn = () => {
    setLocation('/auth/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-b from-primary/10 to-background pt-6">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="h-12 w-32">
              <img 
                src="/images/impact-wrapped-logo.png" 
                alt="Impact Wrapped Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex gap-4">
              <Button 
                variant="ghost"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <section className="bg-gradient-to-b from-primary/10 to-background pt-12 pb-24">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                Show Donors Their <span className="text-primary">Impact</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Impact Wrapped helps food banks create personalized impact reports that show donors exactly how their contributions make a difference in the community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" onClick={handleGetStarted}>
                  Get Started <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={handleSignIn}>
                  Sign In
                </Button>
              </div>
            </div>
            <div className="relative flex-1 min-h-[400px] w-full">
              <div className="absolute inset-0 grid grid-cols-2 gap-4 p-4">
                <div className="col-span-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl shadow-lg p-6 flex flex-col justify-between gap-2">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-semibold">Impact Report</h3>
                    <p className="text-muted-foreground">For: John Donor</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">Total Donations</p>
                      <p className="text-2xl font-bold">$1,250</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">Meals Provided</p>
                      <p className="text-2xl font-bold">3,750</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-primary/5 rounded-xl shadow-lg p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">Meals</h3>
                    <BarChart4 className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">3,750</p>
                  <p className="text-sm text-muted-foreground">Provided to families in need</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-primary/5 rounded-xl shadow-lg p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">CO₂ Saved</h3>
                    <Globe className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">510 kg</p>
                  <p className="text-sm text-muted-foreground">By preventing food waste</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Why Food Banks Love Impact Wrapped</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Transform donor engagement with personalized impact reports that showcase the real difference they're making.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Gift className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Personalized Impact</CardTitle>
                <CardDescription>
                  Show donors exactly how their specific contributions translate into meals, environmental impact, and community support.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Donor Engagement</CardTitle>
                <CardDescription>
                  Increase donor retention with shareable, meaningful content that connects donors to your mission.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <BarChart4 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Data Visualization</CardTitle>
                <CardDescription>
                  Transform complex donation data into beautiful, easy-to-understand visual reports.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>
                  Highlight food waste prevention metrics and the environmental benefits of food bank contributions.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Award className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Donor Recognition</CardTitle>
                <CardDescription>
                  Celebrate individual and collective impact with beautiful, shareable donor recognition.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <ArrowRight className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Simple Setup</CardTitle>
                <CardDescription>
                  Upload your donor data and our platform handles the rest, generating custom impact reports automatically.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Three simple steps to transform your donor engagement strategy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Data</h3>
              <p className="text-muted-foreground">
                Simply upload your donor data using our secure CSV importer. We'll handle the processing.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Customize Reports</h3>
              <p className="text-muted-foreground">
                Personalize impact metrics and branding to match your food bank's specific values and mission.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share With Donors</h3>
              <p className="text-muted-foreground">
                Distribute personalized impact reports to your donors and watch engagement soar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Transform Donor Engagement?</h2>
            <p className="text-muted-foreground">
              Join food banks across the country using Impact Wrapped to create meaningful donor connections and increase giving.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={handleGetStarted}>
                Get Started Today
              </Button>
              <Button size="lg" variant="outline" onClick={handleSignIn}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 mt-auto">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <img 
                src="/images/impact-wrapped-logo.png" 
                alt="Impact Wrapped Logo" 
                className="h-10 w-auto"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Visualize Your Food Bank's Impact
              </p>
            </div>
            
            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p>&copy; {new Date().getFullYear()} Impact Wrapped for Food Banks. All rights reserved.</p>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-xs text-muted-foreground text-center">
            <p>Impact metrics are calculated using industry standard formulas from Feeding America.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Info } from 'lucide-react';

export default function AdminConfigure() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Define the food bank type to include privacy settings and impact equivalencies
  type FoodBankData = {
    id: number;
    name: string;
    logo: string | null;
    primaryColor: string;
    secondaryColor: string;
    thankYouMessage: string;
    thankYouVideoUrl: string | null;
    defaultAnonymousDonors: boolean;
    defaultShowFullName: boolean;
    defaultShowEmail: boolean;
    defaultAllowSharing: boolean;
    privacyPolicyText: string;
    // Impact equivalencies
    dollarsPerMeal: number;
    mealsPerPerson: number;
    poundsPerMeal: number;
    co2PerPound: number;
    waterPerPound: number;
  };
  
  // Fetch the food bank data
  const { data: foodBank, isLoading } = useQuery<FoodBankData>({
    queryKey: ['/api/my-food-bank'],
  });
  
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    primaryColor: '#0ea5e9',
    secondaryColor: '#22c55e',
    thankYouMessage: '',
    thankYouVideoUrl: '',
    // Privacy settings
    defaultAnonymousDonors: false,
    defaultShowFullName: true,
    defaultShowEmail: false,
    defaultAllowSharing: true,
    privacyPolicyText: 'We respect your privacy and will only use your information in accordance with your preferences.',
    // Impact equivalencies
    dollarsPerMeal: 0.20,
    mealsPerPerson: 3,
    poundsPerMeal: 1.2,
    co2PerPound: 2.5,
    waterPerPound: 108
  });
  
  // Create a function to handle numeric conversions
  const parseNumericField = (value: any, defaultValue: number): number => {
    if (value === undefined || value === null) return defaultValue;
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Update form data when food bank data is loaded
  useEffect(() => {
    if (foodBank) {
      setFormData({
        name: foodBank.name || '',
        logo: foodBank.logo || '',
        primaryColor: foodBank.primaryColor || '#0ea5e9',
        secondaryColor: foodBank.secondaryColor || '#22c55e',
        thankYouMessage: foodBank.thankYouMessage || '',
        thankYouVideoUrl: foodBank.thankYouVideoUrl || '',
        // Privacy settings with defaults
        defaultAnonymousDonors: foodBank.defaultAnonymousDonors ?? false,
        defaultShowFullName: foodBank.defaultShowFullName ?? true,
        defaultShowEmail: foodBank.defaultShowEmail ?? false,
        defaultAllowSharing: foodBank.defaultAllowSharing ?? true,
        privacyPolicyText: foodBank.privacyPolicyText || 'We respect your privacy and will only use your information in accordance with your preferences.',
        // Impact equivalencies with defaults
        dollarsPerMeal: parseNumericField(foodBank.dollarsPerMeal, 0.20),
        mealsPerPerson: parseNumericField(foodBank.mealsPerPerson, 3),
        poundsPerMeal: parseNumericField(foodBank.poundsPerMeal, 1.2),
        co2PerPound: parseNumericField(foodBank.co2PerPound, 2.5),
        waterPerPound: parseNumericField(foodBank.waterPerPound, 108)
      });
    }
  }, [foodBank]);
  
  // Update food bank mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest<typeof formData>('/api/my-food-bank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-food-bank'] });
      toast({
        title: "Settings updated",
        description: "Your food bank settings have been updated successfully.",
        variant: "default",
      });
      setLocation('/admin/distribute');
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update food bank settings",
        variant: "destructive",
      });
    }
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };
  
  // Handle color picker changes
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle toggle changes
  const handleToggleChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  return (
    <AdminLayout activeTab="configure">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configure Experience</h1>
          <p className="text-muted-foreground">
            Customize the experience for your donors with your branding and messaging.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Configure Area */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Customize Your Impact Experience</CardTitle>
                  <CardDescription>
                    Personalize the experience for your donors with your branding and messaging.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Food Bank Information */}
                  <div>
                    <h3 className="text-md font-medium mb-4">Food Bank Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="name">Food Bank Name</Label>
                        <Input 
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Metro Area Food Bank"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="logo">Logo URL</Label>
                        <Input
                          id="logo"
                          name="logo"
                          value={formData.logo}
                          onChange={handleChange}
                          placeholder="https://example.com/logo.png"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Scheme */}
                  <div>
                    <h3 className="text-md font-medium mb-4">Color Scheme</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex mt-1">
                          <div className="flex-shrink-0">
                            <Input
                              type="color"
                              id="primaryColor"
                              name="primaryColor"
                              value={formData.primaryColor}
                              onChange={handleColorChange}
                              className="h-9 w-9 border-0 p-0 cursor-pointer"
                            />
                          </div>
                          <Input
                            type="text"
                            id="primaryColorHex"
                            name="primaryColor"
                            value={formData.primaryColor}
                            onChange={handleChange}
                            className="ml-2 flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex mt-1">
                          <div className="flex-shrink-0">
                            <Input
                              type="color"
                              id="secondaryColor"
                              name="secondaryColor"
                              value={formData.secondaryColor}
                              onChange={handleColorChange}
                              className="h-9 w-9 border-0 p-0 cursor-pointer"
                            />
                          </div>
                          <Input
                            type="text"
                            id="secondaryColorHex"
                            name="secondaryColor"
                            value={formData.secondaryColor}
                            onChange={handleChange}
                            className="ml-2 flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Thank You Message */}
                  <div>
                    <h3 className="text-md font-medium mb-4">Thank You Message</h3>
                    <div>
                      <Label htmlFor="thankYouMessage">Message to Donors</Label>
                      <Textarea
                        id="thankYouMessage"
                        name="thankYouMessage"
                        value={formData.thankYouMessage}
                        onChange={handleChange}
                        placeholder="Thank you for your generous support..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {/* Optional Video */}
                  <div>
                    <h3 className="text-md font-medium mb-4">Optional Thank You Video</h3>
                    <div>
                      <Label htmlFor="thankYouVideoUrl">Video URL (YouTube or Vimeo)</Label>
                      <Input
                        id="thankYouVideoUrl"
                        name="thankYouVideoUrl"
                        value={formData.thankYouVideoUrl}
                        onChange={handleChange}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {/* Impact Equivalencies */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-medium">Impact Equivalencies</h3>
                      <div className="flex items-center text-muted-foreground text-xs">
                        <Info className="h-3.5 w-3.5 mr-1" />
                        <span>Customize how donations convert to impact metrics</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                      <div>
                        <Label htmlFor="dollarsPerMeal">Dollars per Meal</Label>
                        <div className="flex items-center mt-1">
                          <span className="text-muted-foreground mr-2">$</span>
                          <Input
                            id="dollarsPerMeal"
                            name="dollarsPerMeal"
                            type="number" 
                            step="0.01"
                            min="0.01"
                            value={formData.dollarsPerMeal}
                            onChange={(e) => setFormData({...formData, dollarsPerMeal: parseFloat(e.target.value)})}
                            className="flex-1"
                          />
                          <span className="text-muted-foreground ml-2">= 1 meal</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">How many dollars does it take to provide one meal?</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="mealsPerPerson">Meals per Person</Label>
                        <div className="flex items-center mt-1">
                          <Input
                            id="mealsPerPerson"
                            name="mealsPerPerson"
                            type="number" 
                            step="0.5"
                            min="1"
                            value={formData.mealsPerPerson}
                            onChange={(e) => setFormData({...formData, mealsPerPerson: parseFloat(e.target.value)})}
                            className="flex-1"
                          />
                          <span className="text-muted-foreground ml-2">meals = 1 person fed</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">How many meals does it take to feed one person (for a day)?</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="poundsPerMeal">Pounds per Meal</Label>
                        <div className="flex items-center mt-1">
                          <Input
                            id="poundsPerMeal"
                            name="poundsPerMeal"
                            type="number" 
                            step="0.1"
                            min="0.1"
                            value={formData.poundsPerMeal}
                            onChange={(e) => setFormData({...formData, poundsPerMeal: parseFloat(e.target.value)})}
                            className="flex-1"
                          />
                          <span className="text-muted-foreground ml-2">lbs per meal</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">How many pounds of food make up one meal?</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="co2PerPound">CO2 Saved per Pound</Label>
                        <div className="flex items-center mt-1">
                          <Input
                            id="co2PerPound"
                            name="co2PerPound"
                            type="number" 
                            step="0.1"
                            min="0.1"
                            value={formData.co2PerPound}
                            onChange={(e) => setFormData({...formData, co2PerPound: parseFloat(e.target.value)})}
                            className="flex-1"
                          />
                          <span className="text-muted-foreground ml-2">lbs of CO2 per lb of food</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Pounds of CO2 emissions avoided per pound of food rescued</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="waterPerPound">Water Saved per Pound</Label>
                        <div className="flex items-center mt-1">
                          <Input
                            id="waterPerPound"
                            name="waterPerPound"
                            type="number" 
                            step="1"
                            min="1"
                            value={formData.waterPerPound}
                            onChange={(e) => setFormData({...formData, waterPerPound: parseFloat(e.target.value)})}
                            className="flex-1"
                          />
                          <span className="text-muted-foreground ml-2">gallons per lb of food</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Gallons of water saved per pound of food rescued</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Privacy Settings */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-medium">Donor Privacy Settings</h3>
                      <div className="flex items-center text-muted-foreground text-xs">
                        <Info className="h-3.5 w-3.5 mr-1" />
                        <span>Default settings for new donors</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="defaultAnonymousDonors">Anonymous Donors</Label>
                          <p className="text-xs text-muted-foreground">Show donors as "Anonymous Donor" by default</p>
                        </div>
                        <Switch
                          id="defaultAnonymousDonors"
                          checked={formData.defaultAnonymousDonors}
                          onCheckedChange={(checked) => handleToggleChange('defaultAnonymousDonors', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="defaultShowFullName">Show Full Name</Label>
                          <p className="text-xs text-muted-foreground">Display donor's full name by default</p>
                        </div>
                        <Switch
                          id="defaultShowFullName"
                          checked={formData.defaultShowFullName}
                          onCheckedChange={(checked) => handleToggleChange('defaultShowFullName', checked)}
                          disabled={formData.defaultAnonymousDonors}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="defaultShowEmail">Show Email</Label>
                          <p className="text-xs text-muted-foreground">Display donor's email address by default</p>
                        </div>
                        <Switch
                          id="defaultShowEmail"
                          checked={formData.defaultShowEmail}
                          onCheckedChange={(checked) => handleToggleChange('defaultShowEmail', checked)}
                          disabled={formData.defaultAnonymousDonors}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="defaultAllowSharing">Allow Social Sharing</Label>
                          <p className="text-xs text-muted-foreground">Allow donors to share their impact on social media</p>
                        </div>
                        <Switch
                          id="defaultAllowSharing"
                          checked={formData.defaultAllowSharing}
                          onCheckedChange={(checked) => handleToggleChange('defaultAllowSharing', checked)}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Label htmlFor="privacyPolicyText">Privacy Policy Message</Label>
                      <Textarea
                        id="privacyPolicyText"
                        name="privacyPolicyText"
                        value={formData.privacyPolicyText}
                        onChange={handleChange}
                        placeholder="We respect your privacy and will only use your information in accordance with your preferences."
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation('/admin/upload')}
                  >
                    Back
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={updateMutation.isPending}
                      onClick={(e) => {
                        e.preventDefault();
                        updateMutation.mutate(formData);
                      }}
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Settings"
                      )}
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save & Continue"
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </form>
          </div>
          
          {/* Preview */}
          <div>
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="border rounded-lg overflow-hidden bg-neutral-50 h-96">
                  <div 
                    className="h-full flex flex-col text-center p-6 relative"
                    style={{ 
                      background: `linear-gradient(135deg, ${formData.primaryColor}20, ${formData.secondaryColor}20)` 
                    }}
                  >
                    {formData.logo ? (
                      <img 
                        src={formData.logo} 
                        alt={formData.name} 
                        className="h-10 mx-auto mb-4"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23ccc'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Crect%20x='3'%20y='3'%20width='18'%20height='18'%20rx='2'%20ry='2'%3E%3C/rect%3E%3Ccircle%20cx='8.5'%20cy='8.5'%20r='1.5'%3E%3C/circle%3E%3Cpolyline%20points='21%2015%2016%2010%205%2021'%3E%3C/polyline%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="h-10 bg-white/60 rounded-md flex items-center justify-center text-muted-foreground mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    <h1 className="text-xl font-bold mb-2">
                      Hey {formData.defaultAnonymousDonors ? "Anonymous Donor" : "Sarah"}!
                    </h1>
                    <div className="mb-4">
                      <p className="text-sm mb-1">Here's your</p>
                      <div className="text-xl font-bold">
                        <span style={{ color: formData.primaryColor }}>2023</span> 
                        <span className="mx-1">Impact</span>
                        <span style={{ color: formData.secondaryColor }}>Wrapped</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-auto">
                      <p>Live preview will update as you change settings</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">This is a simplified preview. You'll be able to see the full experience after generating donor links.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

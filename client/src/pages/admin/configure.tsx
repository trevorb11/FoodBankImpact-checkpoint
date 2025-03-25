import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

export default function AdminConfigure() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch the food bank data
  const { data: foodBank, isLoading } = useQuery({
    queryKey: ['/api/food-bank/1'],
  });
  
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    primaryColor: '#0ea5e9',
    secondaryColor: '#22c55e',
    thankYouMessage: '',
    thankYouVideoUrl: ''
  });
  
  // Update form data when food bank data is loaded
  useEffect(() => {
    if (foodBank) {
      setFormData({
        name: foodBank.name || '',
        logo: foodBank.logo || '',
        primaryColor: foodBank.primaryColor || '#0ea5e9',
        secondaryColor: foodBank.secondaryColor || '#22c55e',
        thankYouMessage: foodBank.thankYouMessage || '',
        thankYouVideoUrl: foodBank.thankYouVideoUrl || ''
      });
    }
  }, [foodBank]);
  
  // Update food bank mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/food-bank/1', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/food-bank/1'] });
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
                    
                    <h1 className="text-xl font-bold mb-2">Hey Sarah!</h1>
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

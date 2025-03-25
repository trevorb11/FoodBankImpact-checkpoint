import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type UserSettings } from "../../shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useSettings() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Query to get user settings
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/my-settings'],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to update user settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      return apiRequest<UserSettings>('/api/my-settings', {
        method: 'POST',
        body: JSON.stringify(newSettings),
      });
    },
    onSuccess: () => {
      // Invalidate settings query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/my-settings'] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating settings",
        description: "There was a problem saving your preferences.",
        variant: "destructive",
      });
      console.error("Failed to update settings:", error);
    },
  });

  // Function to update user settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    if (!isAuthenticated) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to update settings.",
        variant: "destructive",
      });
      return;
    }
    
    updateSettingsMutation.mutate(newSettings);
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    isUpdating: updateSettingsMutation.isPending,
  };
}
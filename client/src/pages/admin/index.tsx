import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Upload, FileType, Settings, Share2, Eye } from "lucide-react";
import { calculateImpactMetrics } from "@/lib/utils";

export default function AdminDashboard() {
  // Fetch the default food bank (id: 1)
  const { data: foodBank, isLoading: isLoadingFoodBank } = useQuery({
    queryKey: ['/api/food-bank/1'],
  });
  
  // Fetch donors for this food bank
  const { data: donors, isLoading: isLoadingDonors } = useQuery({
    queryKey: ['/api/donors/food-bank/1'],
  });
  
  // Calculate total impact metrics using food bank's custom equivalencies
  const impactMetrics = calculateImpactMetrics(donors?.reduce((sum, donor) => sum + Number(donor.totalGiving), 0) || 0, foodBank);
  
  // Mock data for chart
  const chartData = [
    { name: 'Jan', amount: 2400 },
    { name: 'Feb', amount: 1398 },
    { name: 'Mar', amount: 9800 },
    { name: 'Apr', amount: 3908 },
    { name: 'May', amount: 4800 },
    { name: 'Jun', amount: 3800 },
    { name: 'Jul', amount: 4300 },
  ];
  
  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your Food Bank Impact Wrapped dashboard.
            </p>
          </div>
          <Link href="/admin/upload">
            <Button>
              Start New Impact Campaign
            </Button>
          </Link>
        </div>
        
        {/* Impact Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingDonors ? "Loading..." : donors?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total unique donors
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${isLoadingDonors ? "Loading..." : donors?.reduce((sum, donor) => sum + Number(donor.totalGiving), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                Total donations
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meals Provided</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingDonors ? "Loading..." : impactMetrics.meals.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your custom impact metrics
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">People Helped</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingDonors ? "Loading..." : impactMetrics.people.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Individuals served monthly
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/upload">
            <Card className="h-full cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <Upload className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Upload Data</CardTitle>
                <CardDescription>Import your donor CSV data file</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href="/admin/configure">
            <Card className="h-full cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <Settings className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Configure</CardTitle>
                <CardDescription>Customize your impact experience</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href="/admin/distribute">
            <Card className="h-full cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <Share2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Distribute</CardTitle>
                <CardDescription>Share impact links with donors</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href="/admin/preview">
            <Card className="h-full cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <Eye className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Preview</CardTitle>
                <CardDescription>See the donor experience</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
            <CardDescription>Overview of donation activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Amount']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="var(--chart-1)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

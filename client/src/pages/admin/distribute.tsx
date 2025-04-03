import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle2, Copy, ExternalLink, Download, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { calculateImpactMetrics } from '@/lib/utils';

export default function AdminDistribute() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  // Fetch the food bank data
  const { data: foodBank, isLoading: isLoadingFoodBank } = useQuery({
    queryKey: ['/api/food-bank/1'],
  });
  
  // Fetch donors for this food bank
  const { data: donors, isLoading: isLoadingDonors } = useQuery({
    queryKey: ['/api/donors/food-bank/1'],
  });
  
  useEffect(() => {
    // Simulate processing for demonstration purposes
    if (donors && donors.length > 0 && !isProcessing && processedCount === 0) {
      setIsProcessing(true);
      
      const interval = setInterval(() => {
        setProcessedCount(prev => {
          const next = prev + Math.floor(Math.random() * 10) + 1;
          return next > donors.length ? donors.length : next;
        });
      }, 100);
      
      setTimeout(() => {
        clearInterval(interval);
        setIsProcessing(false);
        setProcessedCount(donors.length);
      }, 2000);
    }
  }, [donors, isProcessing, processedCount]);
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    
    toast({
      title: "Link copied",
      description: "The impact link has been copied to clipboard",
      variant: "default",
    });
    
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };
  
  const getImpactUrl = (donor: any) => {
    return `${window.location.origin}/impact/${donor.impactUrl}`;
  };
  
  const downloadCSV = () => {
    if (!donors || donors.length === 0) return;
    
    const headers = ['Name', 'Email', 'Amount', 'Meals Provided', 'People Helped', 'Impact URL'];
    const data = donors.map(donor => {
      const impact = calculateImpactMetrics(Number(donor.totalGiving), foodBank);
      return [
        `${donor.firstName} ${donor.lastName}`,
        donor.email,
        Number(donor.totalGiving).toFixed(2),
        impact.meals,
        impact.people,
        getImpactUrl(donor)
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'donor_impact_links.csv');
    link.click();
  };
  
  // Calculate impact stats
  const totalDonors = donors?.length || 0;
  const totalRaised = donors?.reduce((sum, donor) => sum + Number(donor.totalGiving), 0) || 0;
  const totalImpact = calculateImpactMetrics(totalRaised, foodBank);
  
  // Pagination
  const pageCount = donors ? Math.ceil(donors.length / rowsPerPage) : 0;
  const currentDonors = donors?.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) || [];
  
  return (
    <AdminLayout activeTab="distribute">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Distribute Impact Links</h1>
          <p className="text-muted-foreground">
            Share personalized impact pages with your donors via email or direct links.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Distribute Area */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribute Impact Links</CardTitle>
                <CardDescription>
                  Share personalized impact pages with your donors via email or direct links.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Processing Status */}
                <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100 text-center">
                  {isProcessing ? (
                    <div>
                      <Loader2 className="animate-spin mx-auto h-8 w-8 text-primary mb-2" />
                      <p className="text-sm text-primary-700">
                        Processing donor records: <span>{processedCount}</span> of <span>{donors?.length || 0}</span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
                      <p className="text-sm text-primary-700 font-medium">
                        All {donors?.length || 0} donor records processed successfully!
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Donor Links Table */}
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Donor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDonors ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground">Loading donor data...</p>
                          </TableCell>
                        </TableRow>
                      ) : currentDonors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <p className="text-muted-foreground">No donor records found.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentDonors.map((donor) => {
                          const impact = calculateImpactMetrics(Number(donor.totalGiving), foodBank);
                          const impactUrl = getImpactUrl(donor);
                          
                          return (
                            <TableRow key={donor.id}>
                              <TableCell>
                                <div className="font-medium">{donor.firstName} {donor.lastName}</div>
                                <div className="text-xs text-muted-foreground">{donor.email}</div>
                              </TableCell>
                              <TableCell>${Number(donor.totalGiving).toFixed(2)}</TableCell>
                              <TableCell>
                                <div>{impact.meals.toLocaleString()} meals</div>
                                <div className="text-xs text-muted-foreground">~{impact.people.toLocaleString()} people helped</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <span className="truncate max-w-[120px] text-xs">{impactUrl}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-2 h-5 w-5 text-primary"
                                    onClick={() => copyToClipboard(impactUrl, donor.id.toString())}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="link"
                                  onClick={() => window.open(impactUrl, '_blank')}
                                >
                                  Preview
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  {pageCount > 1 && (
                    <div className="p-3 bg-muted/50 border-t flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, totalDonors)}</span> of <span className="font-medium">{totalDonors}</span> donors
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          &laquo; Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                          disabled={currentPage === pageCount}
                        >
                          Next &raquo;
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <Button 
                    variant="outline"
                    onClick={() => setLocation('/admin/configure')}
                  >
                    Back
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={downloadCSV} className="inline-flex items-center gap-1">
                      <Download className="h-4 w-4" /> Download CSV
                    </Button>
                    <Button variant="outline" className="inline-flex items-center gap-1">
                      <Mail className="h-4 w-4" /> Send Email
                    </Button>
                    <Button onClick={() => setLocation('/admin/preview')}>
                      Preview Experience
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Distribution Stats */}
          <div>
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Impact Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <div className="text-xs text-muted-foreground uppercase font-medium">Total Donors</div>
                    <div className="text-2xl font-bold">
                      {isLoadingDonors ? "..." : totalDonors}
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <div className="text-xs text-muted-foreground uppercase font-medium">Total Raised</div>
                    <div className="text-2xl font-bold">
                      {isLoadingDonors ? "..." : `$${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <div className="text-xs text-muted-foreground uppercase font-medium">Meals Provided</div>
                    <div className="text-2xl font-bold">
                      {isLoadingDonors ? "..." : totalImpact.meals.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <div className="text-xs text-muted-foreground uppercase font-medium">People Helped</div>
                    <div className="text-2xl font-bold">
                      {isLoadingDonors ? "..." : totalImpact.people.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-sm font-medium text-green-700">Environmental Impact</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CO₂ Emissions Saved:</span>
                      <span className="font-medium">
                        {isLoadingDonors ? "..." : `${totalImpact.co2Saved.toLocaleString()} lbs`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Water Saved:</span>
                      <span className="font-medium">
                        {isLoadingDonors ? "..." : `${totalImpact.waterSaved.toLocaleString()} gal`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

import { useState } from 'react';
import { useLocation } from 'wouter';
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';
import { AlertCircle, FileText, Check, X, Upload, FileCheck, Download, Loader2, FileUp, Info, CircleCheck, CircleAlert, ArrowRight, User, DollarSign, Calendar, Hash } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function AdminUpload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{row: number, field: string, message: string}[]>([]);
  
  const uploadMutation = useMutation({
    mutationFn: async (donors: any[]) => {
      return apiRequest('/api/donors/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          foodBankId: 1, // Using the default food bank
          donors
        })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/donors/food-bank/1'] });
      
      if (data?.hasErrors) {
        toast({
          title: "Upload partially successful",
          description: `Processed ${data.totalProcessed} donor records. Some records had validation errors.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Upload successful",
          description: `Successfully processed ${data?.totalProcessed} donor records.`,
          variant: "default",
        });
      }
      
      // Navigate to configure step
      setLocation('/admin/configure');
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      
      // Check for duplicate email errors
      if (error.details?.includes('duplicate key value') || 
          error.details?.includes('violates unique constraint') ||
          error.duplicates) {
            
        // Check if we have detailed duplicate information
        if (error.duplicates && Array.isArray(error.duplicates)) {
          // Show more detailed error with first few duplicates
          const firstDuplicates = error.duplicates.slice(0, 3);
          const remainingCount = error.duplicates.length - firstDuplicates.length;
          
          const duplicatesList = firstDuplicates.map(d => `${d.name} (${d.email})`).join(', ');
          const additionalText = remainingCount > 0 ? ` and ${remainingCount} more` : '';
          
          toast({
            title: `${error.duplicates.length} duplicate donors detected`,
            description: `Donors already in database: ${duplicatesList}${additionalText}. Upload records with new emails or check the "Update existing donors" option.`,
            variant: "destructive",
          });
        } else {
          // Generic duplicate error
          toast({
            title: "Duplicate emails detected",
            description: "Your upload contains email addresses that already exist in the database. Please remove duplicates and try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
      // Handle other errors with more detail
      const errorDetails = error.details || error.message || "Failed to process donor data";
      
      toast({
        title: "Upload failed",
        description: errorDetails,
        variant: "destructive",
      });
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      setIsUploading(true);
      
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setIsUploading(false);
          
          if (results.errors && results.errors.length > 0) {
            const parseErrors = results.errors.map((error, index) => ({
              row: (error.row !== undefined ? error.row : index) + 1,
              field: 'parse_error',
              message: error.message || 'Unknown parsing error'
            }));
            
            setValidationErrors(parseErrors);
            return;
          }
          
          // Basic validation
          const validationErrors: {row: number, field: string, message: string}[] = [];
          
          results.data.forEach((row: any, index: number) => {
            if (!row.first_name) {
              validationErrors.push({
                row: index + 1,
                field: 'first_name',
                message: 'First name is required'
              });
            }
            
            if (!row.last_name) {
              validationErrors.push({
                row: index + 1,
                field: 'last_name',
                message: 'Last name is required'
              });
            }
            
            if (!row.email) {
              validationErrors.push({
                row: index + 1,
                field: 'email',
                message: 'Email is required'
              });
            } else if (!/^\S+@\S+\.\S+$/.test(row.email)) {
              validationErrors.push({
                row: index + 1,
                field: 'email',
                message: 'Email is invalid'
              });
            }
            
            if (!row.total_giving) {
              validationErrors.push({
                row: index + 1,
                field: 'total_giving',
                message: 'Total giving amount is required'
              });
            } else if (isNaN(parseFloat(row.total_giving))) {
              validationErrors.push({
                row: index + 1,
                field: 'total_giving',
                message: 'Total giving must be a number'
              });
            }
          });
          
          setValidationErrors(validationErrors);
          setParsedData(results.data);
        },
        error: (error) => {
          setIsUploading(false);
          toast({
            title: "Parsing error",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    }
  };
  
  const handleSubmit = async () => {
    if (validationErrors.length > 0) {
      toast({
        title: "Validation errors",
        description: "Please fix the validation errors before proceeding",
        variant: "destructive",
      });
      return;
    }
    
    if (parsedData.length === 0) {
      toast({
        title: "No data to upload",
        description: "Please upload a CSV file with donor data",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(parsedData);
  };
  
  const handleClearFile = () => {
    setFile(null);
    setFileName('');
    setParsedData([]);
    setValidationErrors([]);
  };
  
  const downloadTemplate = () => {
    const headers = ['first_name', 'last_name', 'email', 'total_giving', 'first_gift_date', 'last_gift_date', 'largest_gift', 'gift_count'];
    const sampleData = [
      ['John', 'Doe', 'john@example.com', '250.00', '2023-01-15', '2023-12-01', '100.00', '3']
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'donor_template.csv');
    link.click();
  };
  
  return (
    <AdminLayout activeTab="upload">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Donor Data</h1>
          <p className="text-muted-foreground">
            Upload a CSV file with your donor information to create personalized impact pages.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Upload Area */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Donor Data</CardTitle>
                <CardDescription>
                  Upload a CSV file containing your donor information. We'll use this to generate personalized impact pages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-10 text-center">
                  {!fileName ? (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Drag and drop your CSV file here, or click to browse</p>
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        accept=".csv" 
                        onChange={handleFileChange}
                      />
                      <Button 
                        onClick={() => document.getElementById('file-upload')?.click()}
                        variant="outline"
                      >
                        Browse Files
                      </Button>
                    </>
                  ) : (
                    <div className="text-center">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
                          <p className="text-muted-foreground">Parsing file...</p>
                        </>
                      ) : (
                        <>
                          <FileCheck className="h-10 w-10 text-green-500 mx-auto mb-4" />
                          <p className="font-medium mb-1">{fileName}</p>
                          <p className="text-muted-foreground">{parsedData.length} donor records detected</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {validationErrors.length > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Errors</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">Please fix the following issues before proceeding:</p>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {validationErrors.slice(0, 5).map((error, index) => (
                          <li key={index}>
                            Row {error.row}: {error.field} - {error.message}
                          </li>
                        ))}
                        {validationErrors.length > 5 && (
                          <li>...and {validationErrors.length - 5} more errors</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {parsedData.length > 0 && validationErrors.length === 0 && (
                  <Alert variant="default" className="mt-4 bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-500" />
                    <AlertTitle>Validation Successful</AlertTitle>
                    <AlertDescription>
                      Your CSV file has been validated successfully. You can now proceed to the next step.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={handleClearFile}
                  disabled={!fileName || isUploading}
                >
                  Clear
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!fileName || isUploading || validationErrors.length > 0 || uploadMutation.isPending || parsedData.length === 0}
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {parsedData.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Data Preview</CardTitle>
                  <CardDescription>
                    Preview of the first 5 rows from your CSV file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(parsedData[0]).map((header) => (
                            <TableHead key={header}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.slice(0, 5).map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {Object.values(row).map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>{cell as string}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Help and Instructions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>CSV Format Requirements</CardTitle>
                <CardDescription>
                  Your CSV file should include the following columns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Column</TableHead>
                          <TableHead>Required</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">first_name</TableCell>
                          <TableCell>
                            <span className="text-green-600">Yes</span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">last_name</TableCell>
                          <TableCell>
                            <span className="text-green-600">Yes</span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">email</TableCell>
                          <TableCell>
                            <span className="text-green-600">Yes</span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">total_giving</TableCell>
                          <TableCell>
                            <span className="text-green-600">Yes</span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">first_gift_date</TableCell>
                          <TableCell>No</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">last_gift_date</TableCell>
                          <TableCell>No</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">largest_gift</TableCell>
                          <TableCell>No</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">gift_count</TableCell>
                          <TableCell>No</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <Button variant="ghost" onClick={downloadTemplate} className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Learn more about how to format your donor data properly for the best results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Make sure your CSV file follows these guidelines:
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                    <li>First row should contain column headers</li>
                    <li>Date format should be YYYY-MM-DD</li>
                    <li>Monetary values should be numbers only (e.g., 100.50)</li>
                    <li>All required fields must be present</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

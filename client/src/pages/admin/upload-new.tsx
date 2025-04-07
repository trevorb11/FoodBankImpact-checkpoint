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
import { ParseResult, ParseError } from 'papaparse';
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
          donors
        })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-donors'] });
      
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
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to process donor data",
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
        complete: (results: ParseResult<any>) => {
          setIsUploading(false);
          
          if (results.errors && results.errors.length > 0) {
            const parseErrors = results.errors.map((error: ParseError, index: number) => ({
              row: (error.row || 0) + 1,
              field: 'parse_error',
              message: error.message
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
        error: (error: Error) => {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Upload Donor Data</h1>
            <p className="text-muted-foreground mt-1">
              Upload your donor information to create personalized impact visualizations.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary font-normal py-1.5">
              Step 1 of 4
            </Badge>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2.5 mb-6">
          <div className="bg-primary h-2.5 rounded-full" style={{ width: '25%' }}></div>
        </div>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload" className="text-sm">Upload CSV File</TabsTrigger>
            <TabsTrigger value="guide" className="text-sm">Guide & Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-0">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Main Upload Area */}
              <div className="md:col-span-2">
                <Card className="border-primary/20 shadow-md">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <FileUp className="h-6 w-6 text-primary"/>
                      </div>
                      <div>
                        <CardTitle>Upload Your Donor Data</CardTitle>
                        <CardDescription className="mt-1">
                          Upload a CSV file containing your donor information
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-primary/20 rounded-lg p-10 text-center bg-muted/30 hover:bg-muted/50 transition-colors">
                      {!fileName ? (
                        <>
                          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="h-10 w-10 text-primary" />
                          </div>
                          <h3 className="text-lg font-medium mb-1">Drop your CSV file here</h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Your file should include donor names, emails, and donation amounts. 
                            We'll transform this data into meaningful impact visualizations.
                          </p>
                          <input 
                            type="file" 
                            id="file-upload" 
                            className="hidden" 
                            accept=".csv" 
                            onChange={handleFileChange}
                          />
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button 
                              onClick={() => document.getElementById('file-upload')?.click()}
                              className="gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              Select CSV File
                            </Button>
                            <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                              <Download className="h-4 w-4" /> Download Template
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          {isUploading ? (
                            <>
                              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                              </div>
                              <h3 className="text-lg font-medium mb-1">Processing your file</h3>
                              <p className="text-muted-foreground mb-2">This may take a moment...</p>
                              <Progress value={45} className="max-w-md mx-auto" />
                            </>
                          ) : (
                            <>
                              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                {validationErrors.length > 0 ? (
                                  <CircleAlert className="h-10 w-10 text-amber-500" />
                                ) : (
                                  <CircleCheck className="h-10 w-10 text-green-500" />
                                )}
                              </div>
                              <h3 className="text-lg font-medium mb-1">{fileName}</h3>
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-primary/5 font-normal">
                                  {parsedData.length} donor records
                                </Badge>
                                {validationErrors.length > 0 ? (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-600 font-normal">
                                    {validationErrors.length} validation issues
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-50 text-green-600 font-normal">
                                    Valid CSV format
                                  </Badge>
                                )}
                              </div>
                              <div className="flex justify-center gap-3 mt-4">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={handleClearFile}
                                >
                                  Select Different File
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={handleSubmit}
                                  disabled={validationErrors.length > 0 || uploadMutation.isPending}
                                  className="gap-2"
                                >
                                  {uploadMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      Continue to Customization <ArrowRight className="h-4 w-4" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {validationErrors.length > 0 && (
                      <Alert variant="destructive" className="mt-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Please fix these issues before continuing</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
                            {validationErrors.slice(0, 5).map((error, index) => (
                              <li key={index} className="text-[13px]">
                                <span className="font-medium">Row {error.row}:</span> {error.field} - {error.message}
                              </li>
                            ))}
                            {validationErrors.length > 5 && (
                              <li className="text-[13px]">...and {validationErrors.length - 5} more errors</li>
                            )}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {parsedData.length > 0 && validationErrors.length === 0 && (
                      <Alert className="mt-6 bg-green-50 border-green-200">
                        <CircleCheck className="h-4 w-4 text-green-500" />
                        <AlertTitle className="text-green-700">Your data is ready to go!</AlertTitle>
                        <AlertDescription className="text-green-600">
                          All donor records have been validated. Click "Continue to Customization" to proceed to the next step.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
                
                {parsedData.length > 0 && (
                  <Card className="mt-6 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="flex items-center gap-2">
                            Data Preview <Badge variant="outline" className="font-normal">First 5 rows</Badge>
                          </CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => window.print()}>
                          <FileText className="h-3.5 w-3.5" /> Export
                        </Button>
                      </div>
                      <CardDescription>
                        Preview of your donor data that will be used to generate impact pages
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(parsedData[0]).slice(0, 5).map((header) => (
                                <TableHead key={header} className="text-xs uppercase">
                                  {header === 'first_name' && <User className="h-3 w-3 inline mr-1 opacity-70" />}
                                  {header === 'last_name' && <User className="h-3 w-3 inline mr-1 opacity-70" />}
                                  {header === 'email' && <span className="inline-block opacity-70">@</span>}
                                  {header === 'total_giving' && <DollarSign className="h-3 w-3 inline mr-1 opacity-70" />}
                                  {(header === 'first_gift_date' || header === 'last_gift_date') && 
                                    <Calendar className="h-3 w-3 inline mr-1 opacity-70" />}
                                  {header === 'gift_count' && <Hash className="h-3 w-3 inline mr-1 opacity-70" />}
                                  {header}
                                </TableHead>
                              ))}
                              {Object.keys(parsedData[0]).length > 5 && (
                                <TableHead className="text-center text-xs">
                                  +{Object.keys(parsedData[0]).length - 5} more columns
                                </TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedData.slice(0, 5).map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {Object.values(row).slice(0, 5).map((cell, cellIndex) => (
                                  <TableCell key={cellIndex} className="py-2">
                                    {cell as string || <span className="text-muted-foreground text-xs italic">Empty</span>}
                                  </TableCell>
                                ))}
                                {Object.values(row).length > 5 && (
                                  <TableCell className="text-center text-muted-foreground text-sm py-2">
                                    ...
                                  </TableCell>
                                )}
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
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <Info className="h-5 w-5 text-primary"/>
                      </div>
                      <div>
                        <CardTitle>CSV Requirements</CardTitle>
                        <CardDescription className="mt-1">
                          Required fields and formatting
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
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
                              <TableCell className="font-medium flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-primary" /> first_name
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 font-normal">
                                  Required
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-primary" /> last_name
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 font-normal">
                                  Required
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium flex items-center gap-1.5">
                                <span className="inline-block text-lg text-primary">@</span> email
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 font-normal">
                                  Required
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-primary" /> total_giving
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 font-normal">
                                  Required
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-primary" /> first_gift_date
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-normal">Optional</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-primary" /> last_gift_date
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-normal">Optional</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-primary" /> largest_gift
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-normal">Optional</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium flex items-center gap-1.5">
                                <Hash className="h-3.5 w-3.5 text-primary" /> gift_count
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-normal">Optional</Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-4 shadow-sm border-primary/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Best Practices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2.5">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <div className="bg-blue-50 text-blue-500 rounded-full p-1">
                            <CircleCheck className="h-3.5 w-3.5" />
                          </div>
                          CSV Formatting
                        </h4>
                        <ul className="list-inside text-sm space-y-1 text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-primary">•</span> 
                            <span>First row should contain column headers</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span> 
                            <span>Date format: YYYY-MM-DD</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span> 
                            <span>Numeric fields should not have currency symbols</span>
                          </li>
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2.5">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <div className="bg-amber-50 text-amber-500 rounded-full p-1">
                            <Info className="h-3.5 w-3.5" />
                          </div>
                          Privacy Considerations
                        </h4>
                        <ul className="list-inside text-sm space-y-1 text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-primary">•</span> 
                            <span>Donors can remain anonymous if you add an <code className="text-xs bg-muted px-1 py-0.5 rounded">is_anonymous</code> column</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-primary">•</span> 
                            <span>You can set privacy defaults in the next step</span>
                          </li>
                        </ul>
                      </div>
                      
                      <Button variant="outline" onClick={downloadTemplate} size="sm" className="w-full justify-center gap-2 mt-2">
                        <Download className="h-4 w-4" /> Download Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="guide" className="mt-0">
            <Card className="shadow-sm">
              <CardHeader className="border-b pb-3">
                <CardTitle>How to Upload Donor Data</CardTitle>
                <CardDescription>
                  Follow this guide to properly format and upload your donor data
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      1
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Prepare your CSV file</h3>
                      <p className="text-sm text-muted-foreground">
                        Your CSV file should have columns for donor names, emails, and giving amounts at minimum. 
                        Make sure to follow the required format with headers in the first row.
                      </p>
                      <div className="px-4 py-2 bg-muted rounded-md text-xs font-mono mt-2 flex gap-4 overflow-x-auto">
                        <div><span className="text-blue-500">first_name</span>,<span className="text-blue-500">last_name</span>,<span className="text-blue-500">email</span>,<span className="text-blue-500">total_giving</span></div>
                        <div><span className="text-green-600">John</span>,<span className="text-green-600">Doe</span>,<span className="text-green-600">john@example.com</span>,<span className="text-green-600">250.00</span></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      2
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Upload your file</h3>
                      <p className="text-sm text-muted-foreground">
                        Click the "Select CSV File" button to upload your donor data file. You can also drag and drop 
                        the file directly into the upload area.
                      </p>
                      <div className="border rounded-md p-3 text-sm mt-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Upload className="h-4 w-4" />
                          <span className="font-medium">Supported format: CSV files only</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      3
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Validate your data</h3>
                      <p className="text-sm text-muted-foreground">
                        The system will automatically validate your data for any errors. If there are issues, 
                        they will be displayed so you can fix them before proceeding.
                      </p>
                      <Alert className="mt-2 bg-muted border-none">
                        <AlertTitle className="flex items-center gap-2 font-normal text-sm">
                          <CircleCheck className="h-4 w-4 text-green-500" />
                          <span>All valid records will be processed, even if some have errors</span>
                        </AlertTitle>
                      </Alert>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      4
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Continue to Configuration</h3>
                      <p className="text-sm text-muted-foreground">
                        After successful validation, click "Continue to Customization" to proceed to the next step, 
                        where you can customize how your impact pages will look.
                      </p>
                      <Button className="mt-2" size="sm">
                        Back to Upload <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
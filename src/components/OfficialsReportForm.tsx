import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required"),
  employeeNumber: z.string().min(1, "Employee number is required"),
  garage: z.string().min(1, "Garage is required"),
  route: z.string().min(1, "Route is required"),
  dateOfReport: z.date({
    required_error: "Date of report is required",
  }),
  runningNumber: z.string().min(1, "Running number is required"),
  dateOfIncident: z.date({
    required_error: "Date of incident is required",
  }),
  dutyNumber: z.string().min(1, "Duty number is required"),
  timeOfIncident: z.string().min(1, "Time of incident is required"),
  tripNumber: z.string().min(1, "Trip number is required"),
  location: z.string().min(1, "Location is required"),
  fleetNumber: z.string().min(1, "Fleet number is required"),
  travellingFrom: z.string().min(1, "Travelling from is required"),
  destination: z.string().min(1, "Destination is required"),
  subjectOfReport: z.string().min(1, "Subject of report is required"),
  detailsOfIncident: z.string().min(10, "Details must be at least 10 characters"),
  controllerName: z.string().min(1, "Controller's name is required"),
  extensionNumber: z.string().min(1, "Extension number is required"),
});

type FormData = z.infer<typeof formSchema>;

const garageOptions = [
  "Fullwell",
  "Hounslow",
  "Hounslow Heath",
  "Tolworth"
];

const subjectOptions = [
  "Failing to follow instructions",
  "Delaying service",
  "Failing Headway",
  "Attitude and demeanour"
];

export function OfficialsReportForm() {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: "",
      employeeNumber: "",
      garage: "",
      route: "",
      runningNumber: "",
      dutyNumber: "",
      timeOfIncident: "",
      tripNumber: "",
      location: "",
      fleetNumber: "",
      travellingFrom: "",
      destination: "",
      subjectOfReport: "",
      detailsOfIncident: "",
      controllerName: "",
      extensionNumber: "",
    },
  });

  const createReportContent = (data: FormData) => {
    return `Officials Report

EMPLOYEE INFORMATION:
• Employee Name: ${data.employeeName}
• Employee Number: ${data.employeeNumber}
• Garage: ${data.garage}
• Route: ${data.route}

REPORT DETAILS:
• Date of Report: ${data.dateOfReport ? format(data.dateOfReport, "PPP") : 'N/A'}
• Running Number: ${data.runningNumber}
• Date of Incident: ${data.dateOfIncident ? format(data.dateOfIncident, "PPP") : 'N/A'}
• Duty Number: ${data.dutyNumber}
• Time of Incident: ${data.timeOfIncident}
• Trip Number: ${data.tripNumber}

LOCATION INFORMATION:
• Location: ${data.location}
• Fleet Number: ${data.fleetNumber}
• Travelling From: ${data.travellingFrom}
• Destination: ${data.destination}

INCIDENT DETAILS:
• Subject of Report: ${data.subjectOfReport}
• Details of Incident: 
${data.detailsOfIncident}

CONTROLLER INFORMATION:
• Controller's Name: ${data.controllerName}
• Extension Number: ${data.extensionNumber}

---
This report was generated via the Officials Report Form
Generated on: ${new Date().toLocaleString()}`;
  };

  const getGarageShortcut = (garage: string) => {
    const garageMap: { [key: string]: string } = {
      "Fullwell": "FW",
      "Hounslow": "AV", 
      "Hounslow Heath": "WK",
      "Tolworth": "TV"
    };
    return garageMap[garage] || garage;
  };

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    
    // Create report content and file
    const reportContent = createReportContent(data);
    const currentDate = format(new Date(), "yyyyMMdd");
    const garageShortcut = getGarageShortcut(data.garage || '');
    const employeeNumber = data.employeeNumber || 'NoEmpNum';
    const filename = `${currentDate}-${garageShortcut}-Officials Report-${employeeNumber}.txt`;
    
    // Create blob and file for attachment
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const file = new File([blob], filename, { type: 'text/plain' });
    
    // Create temporary URL for the file
    const fileUrl = URL.createObjectURL(file);
    
    // Send email with attachment
    const mailtoUrl = `mailto:FWOCC-HubLeaders@firstbuslondon.co.uk?subject=${encodeURIComponent("Officials Report")}&body=${encodeURIComponent("")}&attachment=${encodeURIComponent(fileUrl)}`;
    window.location.href = mailtoUrl;

    toast({
      title: "Report Sent",
      description: "Your email client has been opened with the report attached.",
    });
  };

  const downloadReport = () => {
    const formData = form.getValues();
    const reportContent = createReportContent(formData);
    
    // Create filename with format: Date-Garage-Officials Report-EmployeeNumber
    const currentDate = format(new Date(), "yyyyMMdd"); // YYYYMMDD format
    const garageShortcut = getGarageShortcut(formData.garage || '');
    const employeeNumber = formData.employeeNumber || 'NoEmpNum';
    const filename = `${currentDate}-${garageShortcut}-Officials Report-${employeeNumber}.txt`;
    
    // Create a blob with the report content
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "The report has been downloaded to your Downloads folder.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/4bb6ce72-fbf6-4c79-84b1-875b11f9f3f5.png" 
              alt="First Bus Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-form-header mb-2">Officials Report</h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Employee Information Section */}
            <Card className="bg-form-background border-border/50 shadow-lg">
              <CardHeader className="bg-form-section">
                <CardTitle className="text-xl font-semibold text-foreground">Employee Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="employeeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Employee Name *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="employeeNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Employee Number *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="garage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Garage *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue placeholder="Select garage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border-border">
                            {garageOptions.map((garage) => (
                              <SelectItem key={garage} value={garage} className="hover:bg-accent">
                                {garage}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="route"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Route *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Report Details Section */}
            <Card className="bg-form-background border-border/50 shadow-lg">
              <CardHeader className="bg-form-section">
                <CardTitle className="text-xl font-semibold text-foreground">Report Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dateOfReport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Date of Report *</FormLabel>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "flex-1 justify-start text-left font-normal bg-input border-border",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : "Select date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.onChange(new Date())}
                            className="bg-input border-border hover:bg-accent"
                          >
                            Today
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="runningNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Running Number *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfIncident"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Date of Incident *</FormLabel>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "flex-1 justify-start text-left font-normal bg-input border-border",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : "Select date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.onChange(new Date())}
                            className="bg-input border-border hover:bg-accent"
                          >
                            Today
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dutyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Duty Number *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeOfIncident"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Time of Incident *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              type="time"
                              className="bg-input border-border pl-10" 
                            />
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tripNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Trip Number *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Information Section */}
            <Card className="bg-form-background border-border/50 shadow-lg">
              <CardHeader className="bg-form-section">
                <CardTitle className="text-xl font-semibold text-foreground">Location Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Location *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fleetNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Fleet Number *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="travellingFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Travelling From *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Destination *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Incident Details Section */}
            <Card className="bg-form-background border-border/50 shadow-lg">
              <CardHeader className="bg-form-section">
                <CardTitle className="text-xl font-semibold text-foreground">Incident Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="subjectOfReport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Subject of Report *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue placeholder="Select subject of report" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border-border">
                            {subjectOptions.map((subject) => (
                              <SelectItem key={subject} value={subject} className="hover:bg-accent">
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="detailsOfIncident"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Details of Incident *</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={6}
                            placeholder="Provide detailed description of the incident..."
                            className="bg-input border-border resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Controller Information Section */}
            <Card className="bg-form-background border-border/50 shadow-lg">
              <CardHeader className="bg-form-section">
                <CardTitle className="text-xl font-semibold text-foreground">Controller Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="controllerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Controller's Name *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="extensionNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Extension Number *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-input border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
              <Button 
                type="submit" 
                size="lg"
                className="px-12 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105"
              >
                Send Report
              </Button>
              <Button 
                type="button"
                onClick={downloadReport}
                variant="outline"
                size="lg"
                className="px-12 py-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Report
              </Button>
            </div>

            {/* Limited Sharing Notice */}
            <div className="mt-8 p-4 bg-notice-background border border-notice-foreground/20 rounded-lg">
              <p className="text-center text-notice-foreground font-semibold">
                ⚠️ LIMITED SHARING - This report contains sensitive information and should only be shared with authorized personnel.
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
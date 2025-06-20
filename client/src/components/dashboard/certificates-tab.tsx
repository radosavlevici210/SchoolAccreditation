import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCertificateSchema, type Certificate, type InsertCertificate, type Student, type Course } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Mail, Eye, GraduationCap, Award, Calendar, Users } from "lucide-react";

export default function CertificatesTab() {
  const { toast } = useToast();
  const [previewData, setPreviewData] = useState<{
    studentName: string;
    courseTitle: string;
    completionDate: string;
    certificateId: string;
  } | null>(null);

  const { data: certificates = [], isLoading: certificatesLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const form = useForm<InsertCertificate>({
    resolver: zodResolver(insertCertificateSchema),
    defaultValues: {
      studentId: 0,
      courseId: 0,
      studentName: "",
      courseTitle: "",
      completionDate: new Date().toISOString().split('T')[0],
      grade: "",
      status: "issued",
    },
  });

  const generateCertificateMutation = useMutation({
    mutationFn: async (data: InsertCertificate) => {
      const response = await apiRequest("POST", "/api/certificates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      form.reset();
      setPreviewData(null);
      toast({
        title: "Success",
        description: "Certificate generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate certificate",
        variant: "destructive",
      });
    },
  });

  const downloadCertificateMutation = useMutation({
    mutationFn: async (certificateId: number) => {
      const response = await fetch(`/api/certificates/${certificateId}/download`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to download certificate");
      }
      return response.blob();
    },
    onSuccess: (blob, certificateId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Certificate downloaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to download certificate",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCertificate) => {
    // Find student and course names
    const student = students.find(s => s.id === data.studentId);
    const course = courses.find(c => c.id === data.courseId);
    
    if (!student || !course) {
      toast({
        title: "Error",
        description: "Please select both student and course",
        variant: "destructive",
      });
      return;
    }

    const certificateData = {
      ...data,
      studentName: student.name,
      courseTitle: course.title,
    };

    generateCertificateMutation.mutate(certificateData);
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === parseInt(studentId));
    if (student) {
      form.setValue("studentId", student.id);
      updatePreview();
    }
  };

  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id === parseInt(courseId));
    if (course) {
      form.setValue("courseId", course.id);
      updatePreview();
    }
  };

  const updatePreview = () => {
    const formData = form.getValues();
    const student = students.find(s => s.id === formData.studentId);
    const course = courses.find(c => c.id === formData.courseId);
    
    if (student && course) {
      setPreviewData({
        studentName: student.name,
        courseTitle: course.title,
        completionDate: formData.completionDate,
        certificateId: "NS-CERT-2025-Preview",
      });
    }
  };

  const handleDownload = (certificateId: number) => {
    downloadCertificateMutation.mutate(certificateId);
  };

  if (certificatesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="bg-slate-100 rounded-lg p-6">
            <div className="h-4 bg-slate-200 rounded w-32 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900">Certificate Generation</h2>
        <div className="flex space-x-3">
          <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
            <FileText className="w-4 h-4 mr-2" />
            Bulk Generate
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Award className="w-4 h-4 mr-2" />
            Generate Certificate
          </Button>
        </div>
      </div>

      {/* Certificate Generation Form */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="text-md font-medium text-slate-900 mb-4">Generate New Certificate</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student">Select Student</Label>
              <Select onValueChange={handleStudentChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} ({student.studentId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="course">Select Course</Label>
              <Select onValueChange={handleCourseChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="completionDate">Completion Date</Label>
              <Input
                id="completionDate"
                type="date"
                {...form.register("completionDate")}
                onChange={(e) => {
                  form.setValue("completionDate", e.target.value);
                  updatePreview();
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="grade">Grade/Score</Label>
              <Input
                id="grade"
                {...form.register("grade")}
                placeholder="e.g., A+, 95%"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={generateCertificateMutation.isPending}
            >
              <FileText className="w-4 h-4 mr-2" />
              {generateCertificateMutation.isPending ? "Generating..." : "Generate Certificate"}
            </Button>
          </div>
        </form>
      </div>

      {/* Certificate Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-md font-medium text-slate-900 mb-4">Certificate Preview</h3>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 min-h-96 relative overflow-hidden">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 rotate-45 text-4xl font-bold text-slate-900 pointer-events-none">
            <span>© 2025 Ervin Remus Radosavlevici - Nuralai School</span>
          </div>
          
          {/* Certificate Content */}
          <div className="relative z-10">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Nuralai School</h1>
              <p className="text-lg text-slate-600">Certificate of Completion</p>
            </div>
            
            <div className="mb-8">
              <p className="text-lg text-slate-600 mb-4">This is to certify that</p>
              <p className="text-2xl font-bold text-slate-900 mb-4">
                {previewData?.studentName || "Student Name"}
              </p>
              <p className="text-lg text-slate-600 mb-2">has successfully completed the course</p>
              <p className="text-xl font-semibold text-blue-600">
                {previewData?.courseTitle || "Course Title"}
              </p>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-slate-600 mb-2">Date of Completion</p>
                <p className="font-medium text-slate-900">
                  {previewData?.completionDate ? new Date(previewData.completionDate).toLocaleDateString() : "January 20, 2025"}
                </p>
              </div>
              <div className="text-center">
                <div className="w-24 h-12 bg-blue-600 rounded border-2 border-blue-600 mb-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">OFFICIAL SEAL</span>
                </div>
                <p className="text-xs text-slate-600">Digital Signature</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mb-2">UKPRN Accredited</p>
                <p className="font-medium text-slate-900">
                  Certificate ID: {previewData?.certificateId || "NS-CERT-2025-001"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-600 text-center">
            <p>© 2025 Ervin Remus Radosavlevici</p>
            <p>ervin210@icloud.com | ervin.radosavlevici@mail.com | All rights reserved.</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center space-x-4">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
            <Mail className="w-4 h-4 mr-2" />
            Email Certificate
          </Button>
        </div>
      </div>

      {/* Recent Certificates */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Recent Certificates</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Certificate ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                    No certificates generated yet. Create your first certificate above.
                  </td>
                </tr>
              ) : (
                certificates.map((certificate) => (
                  <tr key={certificate.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900">
                      {certificate.certificateId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {certificate.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {certificate.courseTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {certificate.issueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {certificate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button 
                        onClick={() => handleDownload(certificate.id)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={downloadCertificateMutation.isPending}
                      >
                        Download
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Verify
                      </button>
                      <button className="text-slate-600 hover:text-slate-900">
                        Email
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

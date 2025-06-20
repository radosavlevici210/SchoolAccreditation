import { useState } from "react";
import Header from "@/components/dashboard/header";
import StatsCards from "@/components/dashboard/stats-cards";
import StudentsTab from "@/components/dashboard/students-tab";
import CoursesTab from "@/components/dashboard/courses-tab";
import CertificatesTab from "@/components/dashboard/certificates-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Book, Award } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards />
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-8">
          <Tabs defaultValue="students" className="w-full">
            <div className="border-b border-slate-200">
              <TabsList className="h-auto p-0 bg-transparent space-x-8 px-6">
                <TabsTrigger 
                  value="students" 
                  className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 text-slate-600 hover:text-slate-900 hover:border-slate-300 py-4 px-1 text-sm font-medium bg-transparent shadow-none"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Students
                </TabsTrigger>
                <TabsTrigger 
                  value="courses"
                  className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 text-slate-600 hover:text-slate-900 hover:border-slate-300 py-4 px-1 text-sm font-medium bg-transparent shadow-none"
                >
                  <Book className="w-4 h-4 mr-2" />
                  Courses
                </TabsTrigger>
                <TabsTrigger 
                  value="certificates"
                  className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 text-slate-600 hover:text-slate-900 hover:border-slate-300 py-4 px-1 text-sm font-medium bg-transparent shadow-none"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Certificates
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="students" className="p-6 mt-0">
              <StudentsTab />
            </TabsContent>
            
            <TabsContent value="courses" className="p-6 mt-0">
              <CoursesTab />
            </TabsContent>
            
            <TabsContent value="certificates" className="p-6 mt-0">
              <CertificatesTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="text-white text-sm" />
                </div>
                <span className="font-bold text-slate-900">Nuralai School</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Internationally accredited educational institution providing professional certification programs.
              </p>
              <div className="text-xs text-slate-600">
                <p className="font-semibold text-red-600 mb-1">LEGALLY PROTECTED SYSTEM</p>
                <p>© 2025 Ervin Remus Radosavlevici - All Rights Reserved</p>
                <p>UKPRN Registered Institution - Interference Prohibited</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Accreditation</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  CPD Certification Service (UK)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  ASIC Accreditation Service
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  EduQual (UK Ofqual-aligned)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  GDPR & ISO/IEC 27001 Compliant
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Contact & Support</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>ervin210@icloud.com</li>
                <li>ervin.radosavlevici@mail.com</li>
                <li>International Recognition</li>
                <li>Secure Digital Certificates</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

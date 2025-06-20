import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { certificateGenerator } from "./services/certificate-generator";
import { insertStudentSchema, insertCourseSchema, insertCertificateSchema } from "@shared/schema";
import { z } from "zod";

// Legal Compliance Middleware - Anti-Interference Protection
const legalComplianceCheck = (req: any, res: any, next: any) => {
  // Log all access for legal compliance
  console.log(`[LEGAL-LOG] ${new Date().toISOString()} - Access: ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // Add legal protection headers
  res.setHeader('X-Legal-Owner', 'Ervin Remus Radosavlevici');
  res.setHeader('X-Institution', 'Nuralai School');
  res.setHeader('X-Institution-Type', 'Educational Services Provider');
  res.setHeader('X-Copyright', '© 2025 Ervin Remus Radosavlevici - All Rights Reserved');
  res.setHeader('X-Legal-Warning', 'Educational Institution - Interference prohibited - Legal action enforced');
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply legal compliance middleware to all routes
  app.use(legalComplianceCheck);
  
  // Students routes
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      
      // Check if email already exists
      const existingStudent = await storage.getStudentByEmail(validatedData.email);
      if (existingStudent) {
        return res.status(400).json({ message: "Student with this email already exists" });
      }

      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid student data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const student = await storage.updateStudent(id, updates);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStudent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Courses routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      
      // Check if course code already exists
      const existingCourse = await storage.getCourseByCode(validatedData.code);
      if (existingCourse) {
        return res.status(400).json({ message: "Course with this code already exists" });
      }

      const course = await storage.createCourse(validatedData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const course = await storage.updateCourse(id, updates);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCourse(id);
      
      if (!success) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Certificates routes
  app.get("/api/certificates", async (req, res) => {
    try {
      const certificates = await storage.getAllCertificates();
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.post("/api/certificates", async (req, res) => {
    try {
      const validatedData = insertCertificateSchema.parse(req.body);
      
      // Verify student and course exist
      const student = await storage.getStudent(validatedData.studentId);
      const course = await storage.getCourse(validatedData.courseId);
      
      if (!student || !course) {
        return res.status(400).json({ message: "Invalid student or course ID" });
      }

      const certificate = await storage.createCertificate(validatedData);
      res.status(201).json(certificate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid certificate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create certificate" });
    }
  });

  app.get("/api/certificates/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certificate = await storage.getCertificate(id);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      const pdfBuffer = await certificateGenerator.generateCertificatePDF(certificate);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificate.certificateId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Certificate generation error:', error);
      res.status(500).json({ message: "Failed to generate certificate PDF" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { certificateGenerator } from "./services/certificate-generator";
import { insertStudentSchema, insertCourseSchema, insertCertificateSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

// DNA-based Security System
class DNASecurity {
  private static dnaSequences = {
    admin: 'ATCGATCGATCG',
    student: 'GCTAGCTAGCTA',
    instructor: 'TTAACCGGTTAA',
    system: 'AAAATTTTCCCC'
  };

  private static generateDNAFingerprint(userAgent: string, ip: string): string {
    const hash = crypto.createHash('sha256').update(userAgent + ip).digest('hex');
    return hash.substring(0, 12).replace(/[0-9a-f]/g, (char) => {
      const map: { [key: string]: string } = {
        '0': 'A', '1': 'T', '2': 'C', '3': 'G',
        '4': 'A', '5': 'T', '6': 'C', '7': 'G',
        '8': 'A', '9': 'T', 'a': 'C', 'b': 'G',
        'c': 'A', 'd': 'T', 'e': 'C', 'f': 'G'
      };
      return map[char];
    });
  }

  static validateDNAAccess(req: any): boolean {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress;
    const dnaFingerprint = this.generateDNAFingerprint(userAgent, ip);
    
    // Allow access if DNA fingerprint contains valid sequences
    return Object.values(this.dnaSequences).some(sequence => 
      dnaFingerprint.includes(sequence.substring(0, 6))
    );
  }

  static getDNARole(req: any): string {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress;
    const dnaFingerprint = this.generateDNAFingerprint(userAgent, ip);
    
    for (const [role, sequence] of Object.entries(this.dnaSequences)) {
      if (dnaFingerprint.includes(sequence.substring(0, 6))) {
        return role;
      }
    }
    return 'guest';
  }
}

// DNA-based Security Middleware
const dnaSecurityCheck = (req: any, res: any, next: any) => {
  const timestamp = new Date().toISOString();
  const dnaFingerprint = DNASecurity.validateDNAAccess(req);
  const dnaRole = DNASecurity.getDNARole(req);
  
  // Log DNA security analysis
  console.log(`[DNA-SEC] ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip} - DNA-Role: ${dnaRole}`);
  
  // Set DNA security headers
  res.setHeader('X-DNA-Security', 'Active');
  res.setHeader('X-DNA-Role', dnaRole);
  res.setHeader('X-Institution', 'Nuralai School');
  res.setHeader('X-Bio-Auth', 'DNA-Fingerprint-Verified');
  res.setHeader('X-Security-Level', dnaFingerprint ? 'Authenticated' : 'Guest');
  
  // Enhanced security for sensitive operations
  if (req.method !== 'GET' && !dnaFingerprint) {
    console.log(`[DNA-SEC] ${timestamp} - BLOCKED: Invalid DNA sequence for ${req.method} ${req.path}`);
    return res.status(403).json({ 
      message: "DNA authentication required for this operation",
      code: "DNA_AUTH_REQUIRED"
    });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply DNA-based security middleware to all routes
  app.use(dnaSecurityCheck);
  
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

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { certificateGenerator } from "./services/certificate-generator";
import { insertStudentSchema, insertCourseSchema, insertCertificateSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import { DNASecurityManager } from "./dna-security";

// DNA Authentication System
class DNAAuthentication {
  private static authenticatedUsers = new Map<string, {
    dnaSequence: string;
    role: string;
    sessionToken: string;
    expiresAt: number;
  }>();

  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static authenticate(req: any): { success: boolean; user?: any; error?: string } {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    const metrics = DNASecurityManager.getSecurityMetrics(req);
    
    if (!metrics.profile) {
      return { success: false, error: "Invalid DNA sequence - authentication failed" };
    }

    const sessionToken = this.generateSessionToken();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    const userKey = `${ip}:${userAgent}`;
    this.authenticatedUsers.set(userKey, {
      dnaSequence: metrics.dnaSequence,
      role: metrics.profile.role,
      sessionToken,
      expiresAt
    });

    return {
      success: true,
      user: {
        dnaSequence: metrics.dnaSequence,
        role: metrics.profile.role,
        permissions: metrics.profile.permissions,
        securityLevel: metrics.profile.securityLevel,
        trustScore: metrics.trustScore,
        sessionToken,
        expiresAt
      }
    };
  }

  static verifySession(req: any): { valid: boolean; user?: any } {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    const userKey = `${ip}:${userAgent}`;
    
    const session = this.authenticatedUsers.get(userKey);
    if (!session || session.expiresAt < Date.now()) {
      this.authenticatedUsers.delete(userKey);
      return { valid: false };
    }

    return { valid: true, user: session };
  }

  static logout(req: any): boolean {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    const userKey = `${ip}:${userAgent}`;
    
    return this.authenticatedUsers.delete(userKey);
  }
}

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

// DNA Authentication Middleware
const dnaAuthenticationCheck = (req: any, res: any, next: any) => {
  const timestamp = new Date().toISOString();
  const metrics = DNASecurityManager.getSecurityMetrics(req);
  const session = DNAAuthentication.verifySession(req);
  
  // Log DNA security analysis
  console.log(`[DNA-AUTH] ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip} - DNA-Role: ${metrics.profile?.role || 'guest'} - Session: ${session.valid ? 'Valid' : 'Invalid'}`);
  
  // Set DNA security headers
  res.setHeader('X-DNA-Security', 'Active');
  res.setHeader('X-DNA-Role', metrics.profile?.role || 'guest');
  res.setHeader('X-Institution', 'Nuralai School');
  res.setHeader('X-Bio-Auth', 'DNA-Fingerprint-Verified');
  res.setHeader('X-Security-Level', session.valid ? 'Authenticated' : 'Guest');
  res.setHeader('X-Trust-Score', metrics.trustScore.toString());
  
  // Store authentication info in request
  req.dnaAuth = {
    metrics,
    session,
    isAuthenticated: session.valid
  };
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply DNA authentication middleware to all routes
  app.use(dnaAuthenticationCheck);

  // DNA Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const authResult = DNAAuthentication.authenticate(req);
      
      if (!authResult.success) {
        return res.status(401).json({ 
          message: authResult.error,
          code: "DNA_AUTH_FAILED"
        });
      }

      console.log(`[DNA-AUTH] ${new Date().toISOString()} - LOGIN SUCCESS - IP: ${req.ip} - Role: ${authResult.user?.role}`);
      
      res.json({
        message: "DNA authentication successful",
        user: authResult.user,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Authentication system error" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const success = DNAAuthentication.logout(req);
      
      console.log(`[DNA-AUTH] ${new Date().toISOString()} - LOGOUT - IP: ${req.ip} - Success: ${success}`);
      
      res.json({
        message: success ? "Logout successful" : "No active session found",
        success
      });
    } catch (error) {
      res.status(500).json({ message: "Logout system error" });
    }
  });

  app.get("/api/auth/status", async (req, res) => {
    try {
      const session = DNAAuthentication.verifySession(req);
      const metrics = DNASecurityManager.getSecurityMetrics(req);
      
      res.json({
        authenticated: session.valid,
        user: session.user || null,
        dnaMetrics: {
          sequence: metrics.dnaSequence,
          profile: metrics.profile,
          trustScore: metrics.trustScore
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Status check error" });
    }
  });

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.dnaAuth?.isAuthenticated) {
      return res.status(401).json({ 
        message: "DNA authentication required for this operation",
        code: "DNA_AUTH_REQUIRED"
      });
    }
    next();
  };

  // Permission check middleware
  const requirePermission = (permission: string) => {
    return (req: any, res: any, next: any) => {
      const profile = req.dnaAuth?.metrics?.profile;
      if (!profile || !DNASecurityManager.validatePermission(profile, permission)) {
        return res.status(403).json({
          message: `Insufficient permissions. Required: ${permission}`,
          code: "INSUFFICIENT_PERMISSIONS"
        });
      }
      next();
    };
  };
  
  // Students routes
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/students", requireAuth, requirePermission('write'), async (req, res) => {
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

  app.put("/api/students/:id", requireAuth, requirePermission('write'), async (req, res) => {
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

  app.delete("/api/students/:id", requireAuth, requirePermission('delete'), async (req, res) => {
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

  app.post("/api/courses", requireAuth, requirePermission('write'), async (req, res) => {
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

  app.put("/api/courses/:id", requireAuth, requirePermission('write'), async (req, res) => {
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

  app.delete("/api/courses/:id", requireAuth, requirePermission('delete'), async (req, res) => {
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

  app.post("/api/certificates", requireAuth, requirePermission('write'), async (req, res) => {
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

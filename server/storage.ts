import { users, students, courses, certificates, type User, type InsertUser, type Student, type InsertStudent, type Course, type InsertCourse, type Certificate, type InsertCertificate } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  getCourse(id: number): Promise<Course | undefined>;
  getCourseByCode(code: string): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  
  getCertificate(id: number): Promise<Certificate | undefined>;
  getCertificateByCertificateId(certificateId: string): Promise<Certificate | undefined>;
  getAllCertificates(): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  
  getStats(): Promise<{
    totalStudents: number;
    activeCourses: number;
    certificatesIssued: number;
    thisMonth: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private courses: Map<number, Course>;
  private certificates: Map<number, Certificate>;
  private currentUserId: number;
  private currentStudentId: number;
  private currentCourseId: number;
  private currentCertificateId: number;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.courses = new Map();
    this.certificates = new Map();
    this.currentUserId = 1;
    this.currentStudentId = 1;
    this.currentCourseId = 1;
    this.currentCertificateId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.email === email,
    );
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const studentId = `NS-2025-${id.toString().padStart(3, '0')}`;
    const student: Student = { 
      ...insertStudent, 
      id, 
      studentId,
      status: insertStudent.status || "active"
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...updates };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCourseByCode(code: string): Promise<Course | undefined> {
    return Array.from(this.courses.values()).find(
      (course) => course.code === code,
    );
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const course: Course = { ...insertCourse, id, enrolledCount: 0 };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const updatedCourse = { ...course, ...updates };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getCertificateByCertificateId(certificateId: string): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values()).find(
      (certificate) => certificate.certificateId === certificateId,
    );
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return Array.from(this.certificates.values());
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const id = this.currentCertificateId++;
    const certificateId = `NS-CERT-2025-${id.toString().padStart(3, '0')}`;
    const issueDate = new Date().toISOString().split('T')[0];
    const certificate: Certificate = { 
      ...insertCertificate, 
      id, 
      certificateId, 
      issueDate,
      status: insertCertificate.status || "issued",
      grade: insertCertificate.grade || null
    };
    this.certificates.set(id, certificate);
    return certificate;
  }

  async getStats(): Promise<{
    totalStudents: number;
    activeCourses: number;
    certificatesIssued: number;
    thisMonth: number;
  }> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const thisMonthCertificates = Array.from(this.certificates.values())
      .filter(cert => cert.issueDate.startsWith(currentMonth));

    return {
      totalStudents: this.students.size,
      activeCourses: this.courses.size,
      certificatesIssued: this.certificates.size,
      thisMonth: thisMonthCertificates.length,
    };
  }
}

export const storage = new MemStorage();

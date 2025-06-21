import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  studentId: text("student_id").notNull().unique(),
  enrollmentDate: text("enrollment_date").notNull(),
  status: text("status").notNull().default("active"),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull(),
  enrolledCount: integer("enrolled_count").notNull().default(0),
  price: integer("price").notNull().default(0),
  prerequisites: text("prerequisites"),
  learningObjectives: text("learning_objectives"),
  courseModules: text("course_modules"),
  assessmentCriteria: text("assessment_criteria"),
  instructorName: text("instructor_name"),
  maxStudents: integer("max_students").default(50),
  language: text("language").default("English"),
  certificationAuthority: text("certification_authority").default("Nuralai School"),
  isPublished: boolean("is_published").default(false),
  hasVideoContent: boolean("has_video_content").default(false),
  hasLiveSessionsRequired: boolean("has_live_sessions_required").default(false),
  practicalAssignments: boolean("practical_assignments").default(false),
  finalExamRequired: boolean("final_exam_required").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  certificateId: text("certificate_id").notNull().unique(),
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  studentName: text("student_name").notNull(),
  courseTitle: text("course_title").notNull(),
  completionDate: text("completion_date").notNull(),
  grade: text("grade"),
  issueDate: text("issue_date").notNull(),
  status: text("status").notNull().default("issued"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  studentId: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  enrolledCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  certificateId: true,
  issueDate: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCourseSchema, type Course, type InsertCourse } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, Users, Edit, Trash2 } from "lucide-react";

export default function CoursesTab() {
  const { toast } = useToast();

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const form = useForm<InsertCourse>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: "",
      code: "",
      description: "",
      duration: 0,
      category: "",
      level: "",
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: InsertCourse) => {
      const response = await apiRequest("POST", "/api/courses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      form.reset();
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCourse) => {
    createCourseMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      deleteCourseMutation.mutate(id);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-blue-100 text-blue-800",
      Business: "bg-green-100 text-green-800",
      Healthcare: "bg-red-100 text-red-800",
      Education: "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="bg-slate-100 rounded-lg p-6 mb-6">
            <div className="h-4 bg-slate-200 rounded w-32 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
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
        <h2 className="text-lg font-semibold text-slate-900">Course Management</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Course Creation Form */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="text-md font-medium text-slate-900 mb-4">Create New Course</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter course title"
                className="mt-1"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="code">Course Code</Label>
              <Input
                id="code"
                {...form.register("code")}
                placeholder="e.g., CS101"
                className="mt-1"
              />
              {form.formState.errors.code && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.code.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="description">Course Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter course description"
              rows={3}
              className="mt-1"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                {...form.register("duration", { valueAsNumber: true })}
                placeholder="40"
                className="mt-1"
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.duration.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => form.setValue("category", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="level">Certification Level</Label>
              <Select onValueChange={(value) => form.setValue("level", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.level && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.level.message}</p>
              )}
            </div>
          </div>
          <div>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={createCourseMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              {createCourseMutation.isPending ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No courses created yet. Add your first course above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(course.category)}`}>
                  {course.category}
                </span>
                <div className="flex space-x-2">
                  <button className="text-slate-400 hover:text-blue-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(course.id)}
                    className="text-slate-400 hover:text-red-600"
                    disabled={deleteCourseMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{course.title}</h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">{course.description}</p>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration} hours
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.enrolledCount} students
                </span>
              </div>
              <div className="mt-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


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
import { Plus, Clock, Users, Edit, Trash2, BookOpen, Award, Video, FileText, Calendar, DollarSign, Globe, Shield, CheckCircle, AlertCircle, Star, Download, Upload, Settings, Eye, PlayCircle, PauseCircle, RotateCcw, Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

export default function CoursesTab() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'duration' | 'enrolledCount' | 'price'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

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
      price: 0,
      prerequisites: "",
      learningObjectives: "",
      courseModules: "",
      assessmentCriteria: "",
      instructorName: "",
      maxStudents: 50,
      language: "English",
      certificationAuthority: "Nuralai School",
      isPublished: false,
      hasVideoContent: false,
      hasLiveSessionsRequired: false,
      practicalAssignments: false,
      finalExamRequired: true,
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
        title: "✅ Course Created Successfully",
        description: "New course has been added to the curriculum",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Course Creation Failed",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Course> }) => {
      const response = await apiRequest("PUT", `/api/courses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setSelectedCourse(null);
      toast({
        title: "✅ Course Updated",
        description: "Course information has been updated successfully",
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
        title: "✅ Course Deleted",
        description: "Course has been removed from the system",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Deletion Failed",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  const duplicateCourseMutation = useMutation({
    mutationFn: async (course: Course) => {
      const duplicateData = {
        ...course,
        title: `${course.title} (Copy)`,
        code: `${course.code}-COPY`,
        enrolledCount: 0,
        isPublished: false,
      };
      delete duplicateData.id;
      const response = await apiRequest("POST", "/api/courses", duplicateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "✅ Course Duplicated",
        description: "Course has been duplicated successfully",
      });
    },
  });

  const onSubmit = (data: InsertCourse) => {
    createCourseMutation.mutate(data);
  };

  const handleUpdate = (id: number, updates: Partial<Course>) => {
    updateCourseMutation.mutate({ id, data: updates });
  };

  const handleDelete = (id: number) => {
    if (confirm("⚠️ Are you sure you want to permanently delete this course? This action cannot be undone.")) {
      deleteCourseMutation.mutate(id);
    }
  };

  const handleDuplicate = (course: Course) => {
    duplicateCourseMutation.mutate(course);
  };

  const togglePublishStatus = (course: Course) => {
    handleUpdate(course.id, { isPublished: !course.isPublished });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-blue-100 text-blue-800 border-blue-200",
      Business: "bg-green-100 text-green-800 border-green-200",
      Healthcare: "bg-red-100 text-red-800 border-red-200",
      Education: "bg-purple-100 text-purple-800 border-purple-200",
      Science: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Arts: "bg-pink-100 text-pink-800 border-pink-200",
      Engineering: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Finance: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      Beginner: "bg-green-50 text-green-700",
      Intermediate: "bg-yellow-50 text-yellow-700",
      Advanced: "bg-orange-50 text-orange-700",
      Expert: "bg-red-50 text-red-700",
      Professional: "bg-purple-50 text-purple-700",
    };
    return colors[level] || "bg-gray-50 text-gray-700";
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished 
      ? "bg-green-100 text-green-800 border-green-200" 
      : "bg-orange-100 text-orange-800 border-orange-200";
  };

  // Filter and sort courses
  const filteredAndSortedCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="bg-slate-100 rounded-lg p-6 mb-6">
            <div className="h-4 bg-slate-200 rounded w-32 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
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
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">📚 Course Management</h2>
          <p className="text-slate-600">Comprehensive educational program administration</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? '📋 List View' : '🔲 Grid View'}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Courses</Label>
              <Input
                id="search"
                placeholder="Search by title, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category-filter">Filter by Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="enrolledCount">Enrollment</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort-order">Sort Order</Label>
              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">
                    <SortAsc className="w-4 h-4 mr-2 inline" />
                    Ascending
                  </SelectItem>
                  <SelectItem value="desc">
                    <SortDesc className="w-4 h-4 mr-2 inline" />
                    Descending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">✨ Create Course</TabsTrigger>
          <TabsTrigger value="manage">🎓 Manage Courses</TabsTrigger>
          <TabsTrigger value="analytics">📊 Course Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          {/* Enhanced Course Creation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Create Professional Course
              </CardTitle>
              <CardDescription>
                Design comprehensive educational programs with advanced features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="Professional Certificate in..."
                      className="mt-1"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="code">Course Code *</Label>
                    <Input
                      id="code"
                      {...form.register("code")}
                      placeholder="NS-2025-XXX"
                      className="mt-1"
                    />
                    {form.formState.errors.code && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.code.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Comprehensive Description *</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Provide detailed course overview, target audience, and outcomes..."
                    rows={4}
                    className="mt-1"
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
                  )}
                </div>

                {/* Course Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (hours) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      {...form.register("duration", { valueAsNumber: true })}
                      placeholder="40"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Course Fee (£) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...form.register("price", { valueAsNumber: true })}
                      placeholder="299.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStudents">Maximum Students</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      {...form.register("maxStudents", { valueAsNumber: true })}
                      placeholder="50"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Course Category *</Label>
                    <Select onValueChange={(value) => form.setValue("category", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">🖥️ Technology</SelectItem>
                        <SelectItem value="Business">💼 Business</SelectItem>
                        <SelectItem value="Healthcare">🏥 Healthcare</SelectItem>
                        <SelectItem value="Education">🎓 Education</SelectItem>
                        <SelectItem value="Science">🔬 Science</SelectItem>
                        <SelectItem value="Arts">🎨 Arts</SelectItem>
                        <SelectItem value="Engineering">⚙️ Engineering</SelectItem>
                        <SelectItem value="Finance">💰 Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="level">Certification Level *</Label>
                    <Select onValueChange={(value) => form.setValue("level", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">🟢 Beginner</SelectItem>
                        <SelectItem value="Intermediate">🟡 Intermediate</SelectItem>
                        <SelectItem value="Advanced">🟠 Advanced</SelectItem>
                        <SelectItem value="Expert">🔴 Expert</SelectItem>
                        <SelectItem value="Professional">⭐ Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Course Language</Label>
                    <Select onValueChange={(value) => form.setValue("language", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">🇬🇧 English</SelectItem>
                        <SelectItem value="Spanish">🇪🇸 Spanish</SelectItem>
                        <SelectItem value="French">🇫🇷 French</SelectItem>
                        <SelectItem value="German">🇩🇪 German</SelectItem>
                        <SelectItem value="Portuguese">🇵🇹 Portuguese</SelectItem>
                        <SelectItem value="Arabic">🇸🇦 Arabic</SelectItem>
                        <SelectItem value="Chinese">🇨🇳 Chinese</SelectItem>
                        <SelectItem value="Japanese">🇯🇵 Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Course Configuration */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">📋 Course Structure & Requirements</h4>
                  
                  <div>
                    <Label htmlFor="prerequisites">Prerequisites & Entry Requirements</Label>
                    <Textarea
                      id="prerequisites"
                      {...form.register("prerequisites")}
                      placeholder="List required knowledge, qualifications, or experience..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="learningObjectives">Learning Objectives & Outcomes</Label>
                    <Textarea
                      id="learningObjectives"
                      {...form.register("learningObjectives")}
                      placeholder="Define what students will achieve upon completion..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="courseModules">Course Modules & Curriculum</Label>
                    <Textarea
                      id="courseModules"
                      {...form.register("courseModules")}
                      placeholder="Module 1: Introduction\nModule 2: Fundamentals\nModule 3: Advanced Topics..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="assessmentCriteria">Assessment Criteria & Methods</Label>
                    <Textarea
                      id="assessmentCriteria"
                      {...form.register("assessmentCriteria")}
                      placeholder="Describe evaluation methods, grading criteria, and passing requirements..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructorName">Lead Instructor/Expert</Label>
                    <Input
                      id="instructorName"
                      {...form.register("instructorName")}
                      placeholder="Dr. John Smith, PhD"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="certificationAuthority">Certification Authority</Label>
                    <Input
                      id="certificationAuthority"
                      {...form.register("certificationAuthority")}
                      value="Nuralai School"
                      className="mt-1"
                      readOnly
                    />
                  </div>
                </div>

                {/* Course Features */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">🎯 Course Features & Delivery</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasVideoContent"
                        onCheckedChange={(checked) => form.setValue("hasVideoContent", checked)}
                      />
                      <Label htmlFor="hasVideoContent" className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video Content Included
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasLiveSessionsRequired"
                        onCheckedChange={(checked) => form.setValue("hasLiveSessionsRequired", checked)}
                      />
                      <Label htmlFor="hasLiveSessionsRequired" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Live Sessions Required
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="practicalAssignments"
                        onCheckedChange={(checked) => form.setValue("practicalAssignments", checked)}
                      />
                      <Label htmlFor="practicalAssignments" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Practical Assignments
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="finalExamRequired"
                        defaultChecked={true}
                        onCheckedChange={(checked) => form.setValue("finalExamRequired", checked)}
                      />
                      <Label htmlFor="finalExamRequired" className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Final Examination Required
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPublished"
                        onCheckedChange={(checked) => form.setValue("isPublished", checked)}
                      />
                      <Label htmlFor="isPublished" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Publish Immediately
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={createCourseMutation.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {createCourseMutation.isPending ? "Creating Course..." : "Create Professional Course"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* Course Management */}
          {filteredAndSortedCourses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Courses Found</h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm || filterCategory !== 'all' 
                    ? "No courses match your search criteria. Try adjusting your filters."
                    : "Create your first professional course to begin building your curriculum."
                  }
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredAndSortedCourses.map((course) => (
                <Card
                  key={course.id}
                  className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(course.category)}>
                            {course.category}
                          </Badge>
                          <Badge variant="outline" className={getLevelColor(course.level)}>
                            {course.level}
                          </Badge>
                          <Badge className={getStatusColor(course.isPublished)}>
                            {course.isPublished ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Draft
                              </>
                            )}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight mb-1">
                          {course.title}
                        </CardTitle>
                        <p className="text-sm text-slate-600 font-mono">
                          {course.code}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCourse(course)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(course)}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>{course.duration}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span>{course.enrolledCount} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-slate-500" />
                        <span>£{course.price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4 text-slate-500" />
                        <span>{course.language}</span>
                      </div>
                    </div>

                    {course.instructorName && (
                      <div className="text-sm text-slate-600">
                        <strong>Instructor:</strong> {course.instructorName}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {course.hasVideoContent && (
                        <Badge variant="secondary" className="text-xs">
                          <Video className="w-3 h-3 mr-1" />
                          Video
                        </Badge>
                      )}
                      {course.hasLiveSessionsRequired && (
                        <Badge variant="secondary" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      )}
                      {course.practicalAssignments && (
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          Practical
                        </Badge>
                      )}
                      {course.finalExamRequired && (
                        <Badge variant="secondary" className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Exam
                        </Badge>
                      )}
                    </div>

                    <Progress 
                      value={(course.enrolledCount / (course.maxStudents || 50)) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-slate-500">
                      {course.enrolledCount}/{course.maxStudents || 50} capacity
                    </p>
                  </CardContent>

                  <CardFooter className="flex justify-between gap-2 pt-3">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePublishStatus(course)}
                        disabled={updateCourseMutation.isPending}
                      >
                        {course.isPublished ? (
                          <>
                            <PauseCircle className="w-4 h-4 mr-1" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Publish
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(course.id)}
                      disabled={deleteCourseMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Course Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">
                  {courses.filter(c => c.isPublished).length} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courses.reduce((sum, course) => sum + course.enrolledCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all courses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  £{courses.reduce((sum, course) => sum + (course.price * course.enrolledCount), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  From current enrollments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">
                  Excellent student satisfaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Course Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  courses.reduce((acc, course) => {
                    acc[course.category] = (acc[course.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(category)}>
                        {category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(count / courses.length) * 100} 
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

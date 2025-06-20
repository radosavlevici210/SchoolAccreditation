import { useQuery } from "@tanstack/react-query";
import { Users, Book, Award, TrendingUp } from "lucide-react";

interface Stats {
  totalStudents: number;
  activeCourses: number;
  certificatesIssued: number;
  thisMonth: number;
}

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 animate-pulse">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-slate-200 rounded-md"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      bgColor: "bg-blue-600",
    },
    {
      title: "Active Courses",
      value: stats?.activeCourses || 0,
      icon: Book,
      bgColor: "bg-green-600",
    },
    {
      title: "Certificates Issued",
      value: stats?.certificatesIssued || 0,
      icon: Award,
      bgColor: "bg-yellow-500",
    },
    {
      title: "This Month",
      value: stats?.thisMonth || 0,
      icon: TrendingUp,
      bgColor: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${card.bgColor} rounded-md flex items-center justify-center`}>
                <card.icon className="text-white text-sm" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">{card.title}</p>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

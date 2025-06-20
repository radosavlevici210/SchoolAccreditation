import { GraduationCap, User } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white text-lg" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Nuralai School</h1>
              <p className="text-sm text-slate-600">Certificate Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-sm font-semibold text-green-600">UKPRN: 10008000</span>
              <div className="text-xs text-slate-600">Internationally Accredited</div>
            </div>
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <User className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

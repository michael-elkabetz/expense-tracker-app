import { Link, useLocation } from 'react-router-dom';
import { DollarSign, Home, FileText, TrendingUp, Settings, PieChart } from "lucide-react";
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Expenses', href: '/expenses', icon: FileText },
    { name: 'Budgets', href: '/budgets', icon: TrendingUp },
    { name: 'Analytics', href: '/analytics', icon: PieChart },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-slate-800">ExpenseTracker</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="md:hidden">
            <button className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Home } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="w-8 h-8 text-slate-800" />
            <span className="text-xl font-bold text-slate-800">My App</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

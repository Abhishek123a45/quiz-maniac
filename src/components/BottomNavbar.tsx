
import { Home, BookOpen, Moon, Sun } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

export const BottomNavbar = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const navItems = [
    {
      to: "/",
      icon: Home,
      label: "Home",
    },
    {
      to: "/saved-quizzes",
      icon: BookOpen,
      label: "Saved Quizzes",
    },
  ];

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            );
          })}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="flex flex-col items-center gap-1 p-2 h-auto"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">Theme</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

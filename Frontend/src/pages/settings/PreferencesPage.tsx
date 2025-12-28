import { useState, useEffect } from 'react';
import { useThemeStore, Theme } from '@/store/themeStore';
import { Moon, Palette, Check } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

export default function PreferencesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, setTheme } = useThemeStore();

  const themes: { id: Theme; name: string; description: string; colors: string[] }[] = [
    {
      id: 'dark',
      name: 'Dark Purple',
      description: 'Classic dark theme with purple accents',
      colors: ['#1a1f2e', '#7c3aed', '#a78bfa']
    },
    {
      id: 'midnight',
      name: 'Midnight Blue',
      description: 'Deep blue theme with cyan highlights',
      colors: ['#0f172a', '#06b6d4', '#22d3ee']
    },
    {
      id: 'light',
      name: 'Light Mode',
      description: 'Clean light theme with green accents',
      colors: ['#ffffff', '#10b981', '#d1fae5']
    },
  ];

  const applyThemeToDocument = (newTheme: Theme) => {
    // Remove all theme classes first
    document.documentElement.classList.remove('theme-dark', 'theme-midnight', 'theme-light');
    
    // Apply the new theme class
    if (newTheme === 'midnight') {
      document.documentElement.classList.add('theme-midnight');
    } else if (newTheme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.add('theme-dark');
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      applyThemeToDocument(newTheme);
      
      const themeName = themes.find(t => t.id === newTheme)?.name || 'Unknown';
      toast.success(`Theme changed to ${themeName}`, {
        icon: '🎨',
      });
    } catch (error) {
      console.error('Error changing theme:', error);
      toast.error('Failed to change theme');
    }
  };

  useEffect(() => {
    // Apply current theme on mount
    applyThemeToDocument(theme);
  }, [theme]);

  return (
    <div className="min-h-screen gradient-bg flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient">Settings</h1>
            <p className="text-gray-400 mt-2">Customize your experience</p>
          </div>

          <div className="space-y-6">
            {/* Theme Settings */}
            <div className="card-glass p-6">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Theme</h2>
              </div>

              <p className="text-gray-400 mb-6">Choose your preferred color theme</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={`
                      relative p-6 rounded-xl border-2 transition-all text-left
                      ${theme === themeOption.id 
                        ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                      }
                    `}
                  >
                    {theme === themeOption.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <Moon className="w-5 h-5 text-purple-400" />
                      <h3 className="font-semibold text-white">{themeOption.name}</h3>
                    </div>

                    <p className="text-sm text-gray-400 mb-4">{themeOption.description}</p>

                    <div className="flex gap-2">
                      {themeOption.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 rounded-lg border-2 border-gray-600 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="card-glass p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Theme Preview</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg">
                  <p className="text-white font-semibold">Primary Gradient</p>
                  <p className="text-purple-100 text-sm">Main accent color</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="btn-primary">
                    Primary Button
                  </button>
                  <button className="btn-secondary">
                    Secondary Button
                  </button>
                </div>

                <div className="p-4 bg-gray-800 border border-purple-500/20 rounded-lg">
                  <p className="text-white font-medium">Card Background</p>
                  <p className="text-gray-400 text-sm">Standard card styling</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

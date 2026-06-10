import { useTheme } from "../context/ThemeContext"
import { Moon, Sun } from "lucide-react"

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme()

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer group" 
      onClick={toggleDarkMode} 
      role="switch" 
      aria-checked={isDarkMode} 
      tabIndex="0" 
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { toggleDarkMode() } }}
    >
      <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex items-center ${isDarkMode ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <div className={`absolute left-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}>
          {isDarkMode ? <Moon size={10} className="text-emerald-600" /> : <Sun size={10} className="text-amber-500" />}
        </div>
      </div>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 select-none group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {isDarkMode ? 'Dark' : 'Light'}
      </span>
    </div>
  )
}

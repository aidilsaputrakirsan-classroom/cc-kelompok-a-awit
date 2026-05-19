``````````# Dark Mode Implementation - Frontend

## Overview
Fitur Dark Mode telah diimplementasikan pada aplikasi PalmTrack Cloud dengan menggunakan React Context API dan CSS Variables. Preferensi pengguna disimpan di localStorage untuk persistensi antar sesi.

## Fitur Utama

### 1. **Theme Context** (`src/context/ThemeContext.jsx`)
- Menggunakan `createContext` dan `useContext` dari React
- State `isDarkMode` di-manage dengan `useState`
- Preferensi disimpan ke `localStorage` dengan key `"darkMode"`
- Mengupdate `document.body.className` untuk dark/light mode
- Export hook `useTheme()` untuk akses context di komponen

**Implementasi:**
```javascript
// State initialization dengan fallback dari localStorage
const [isDarkMode, setIsDarkMode] = useState(() => {
  const saved = localStorage.getItem("darkMode")
  return saved ? JSON.parse(saved) : false
})

// Update body class dan localStorage setiap kali isDarkMode berubah
useEffect(() => {
  localStorage.setItem("darkMode", JSON.stringify(isDarkMode))
  document.body.className = isDarkMode ? "dark" : "light"
}, [isDarkMode])

// Toggle function
const toggleDarkMode = () => {
  setIsDarkMode(prev => !prev)
}
```

### 2. **Toggle Button di Header** (`src/components/Header.jsx`)
- Tombol toggle dengan icon ☀️/🌙 untuk visual feedback
- Menggunakan `useTheme()` hook untuk akses state dan toggle function
- Styling berubah sesuai mode (light/dark)
- Button text menampilkan mode yang akan diaktifkan

```javascript
const { isDarkMode, toggleDarkMode } = useTheme()

<button onClick={toggleDarkMode} style={styles.btnToggle(isDarkMode)}>
  {isDarkMode ? "☀️ Light" : "🌙 Dark"}
</button>
```

### 3. **CSS Variables System** (`src/index.css`)
Menggunakan CSS Custom Properties untuk theme management:

**Light Mode (default):**
- `--bg-primary`: #ffffff
- `--bg-secondary`: #f5f5f5
- `--text-primary`: #323232
- `--text-secondary`: rgba(50, 50, 50, 0.62)
- `--text-muted`: rgba(50, 50, 50, 0.5)
- `--border-color`: rgba(50, 50, 50, 0.12)
- `--card-bg`: #ffffff
- `--header-bg`: #1F4E79
- `--sidebar-bg`: #323232
- `--accent-color`: #ba352c

**Dark Mode (body.dark):**
- `--bg-primary`: #1a1a1a
- `--bg-secondary`: #2a2a2a
- `--text-primary`: #f5f5f5
- `--text-secondary`: rgba(245, 245, 245, 0.7)
- `--text-muted`: rgba(245, 245, 245, 0.5)
- `--border-color`: rgba(255, 255, 255, 0.1)
- `--card-bg`: #2a2a2a
- `--header-bg`: #1a1a2a
- `--sidebar-bg`: #2a2a3a
- `--accent-color`: #ff6b6b

### 4. **Styling Updates**
Semua file CSS utama telah diupdate untuk mendukung dark mode:

#### Updated CSS Files:
- `src/index.css` - Base styling dengan CSS variables
- `src/App.css` - Global app styling
- `src/layouts/MainLayout.css` - Main layout dan sidebar
- `src/pages/Dashboard.css` - Dashboard cards dan charts
- `src/pages/MasterDataContractorPage.css` - Contractor page
- `src/pages/BlocksPage.css` - Blocks page

#### Pattern untuk Dark Mode:
```css
/* Light mode (default di :root) */
.element {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

/* Dark mode */
body.dark .element {
  /* Override spesifik untuk dark mode jika diperlukan */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
```

### 5. **App Structure** (`src/App.jsx`)
ThemeProvider dibungkus di level tertinggi untuk memastikan semua komponen dapat akses theme context:

```javascript
<ThemeProvider>
  <AuthProvider>
    <Routes>
      {/* Routes */}
    </Routes>
  </AuthProvider>
</ThemeProvider>
```

### 6. **MainLayout Integration** (`src/layouts/MainLayout.jsx`)
Mengintegrasikan dark mode dengan setting body class:

```javascript
const { isDarkMode } = useTheme()

useEffect(() => {
  document.body.className = isDarkMode ? "dark" : "light"
}, [isDarkMode])
```

## Fitur

✅ Toggle dark/light mode dengan button di Header  
✅ Preferensi disimpan di localStorage (persistent)  
✅ Smooth transition antar mode (0.3s ease)  
✅ Semua komponen responsive terhadap mode change  
✅ CSS variables untuk maintainability  
✅ Support untuk header, sidebar, cards, tables, forms  
✅ Custom color scheme untuk dark mode  

## Usage

### Untuk menggunakan Theme di Component:
```javascript
import { useTheme } from "../context/ThemeContext"

function MyComponent() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  
  return (
    <div style={{ 
      backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
      color: isDarkMode ? "#f5f5f5" : "#323232"
    }}>
      <button onClick={toggleDarkMode}>
        Toggle {isDarkMode ? "Light" : "Dark"} Mode
      </button>
    </div>
  )
}
```

### Untuk CSS Styling:
```css
.my-component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

body.dark .my-component {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
```

## Browser Compatibility
- Modern browsers dengan CSS Custom Properties support
- localStorage API support
- React 16.8+ (Hooks)

## Testing Checklist
- [ ] Toggle button muncul di Header
- [ ] Klik toggle mengubah theme (Light ↔ Dark)
- [ ] Refresh halaman menyimpan preference (localStorage)
- [ ] Semua halaman responsive terhadap mode change
- [ ] Icons dan buttons terlihat jelas di kedua mode
- [ ] Contrast ratio accessible untuk WCAG standards
- [ ] Transitions smooth tanpa flash/flicker

## Future Enhancements
- [ ] Auto-detect system theme preference (prefers-color-scheme)
- [ ] More granular color customization
- [ ] Theme settings di user profile
- [ ] Additional theme options (sepia, high contrast)

---

**Branch:** `feature/dark-mode`  
**Last Updated:** 2026-05-06

# Azad Project - Modern React Web Application

A modern, responsive web application built with React, TypeScript, and Vite featuring dark/light mode toggle, smooth animations, and optimized performance.

## ✨ Features

- 🌓 **Dark/Light Mode Toggle** - Seamless theme switching with system preference detection
- 🎨 **Modern UI/UX** - Glass morphism design with smooth transitions
- 📱 **Fully Responsive** - Optimized for all device sizes
- ⚡ **Performance Optimized** - Code splitting, lazy loading, and optimized builds
- 🎭 **Smooth Animations** - Framer Motion and AOS integration
- 🎯 **Accessibility First** - WCAG compliant with keyboard navigation
- 🚀 **Production Ready** - Optimized builds and deployment configurations

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS3 with CSS Variables, Glass Morphism
- **Animations**: Framer Motion, AOS (Animate On Scroll)
- **3D Graphics**: Three.js, React Three Fiber
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite with optimized production config

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Azad_proj
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:prod` - Optimized production build
- `npm run preview` - Preview production build
- `npm run serve` - Serve production build on port 3000
- `npm run lint` - Type check with TypeScript
- `npm run clean` - Clean build directory

## 🌐 Deployment

### Production Build

1. **Create production build**
   ```bash
   npm run build:prod
   ```

2. **Preview build locally**
   ```bash
   npm run serve
   ```

### Deployment Options

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build:prod`
3. Set output directory: `dist`
4. Deploy automatically on push

#### Netlify
1. Connect repository to Netlify
2. Build command: `npm run build:prod`
3. Publish directory: `dist`
4. Add environment variables from `.env.production`

#### Static Hosting (Apache/Nginx)
1. Run `npm run build:prod`
2. Upload `dist` folder contents to web server
3. Configure server for SPA routing

## 🎨 Theme System

The application features a comprehensive theme system with:

- **Automatic Detection**: Respects system theme preference
- **Manual Toggle**: Users can override system preference
- **Persistent Storage**: Theme choice saved in localStorage
- **Smooth Transitions**: Animated theme switching
- **CSS Variables**: Consistent theming across components

### Theme Variables

```css
/* Light Theme */
--primary-color: #6366f1;
--background: #ffffff;
--text-color: #1f2937;

/* Dark Theme */
--primary-color: #818cf8;
--background: #0f172a;
--text-color: #f8fafc;
```

## 🎭 Animation System

The application includes multiple animation systems:

- **Page Transitions**: Smooth navigation between routes
- **Scroll Animations**: AOS integration for scroll-triggered animations
- **Micro-interactions**: Hover effects and loading states
- **3D Elements**: Three.js integration for interactive 3D components

## 📱 Responsive Design

Breakpoints:
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators
- **Reduced Motion**: Respects user motion preferences
- **High Contrast**: Support for high contrast mode

## 🔧 Configuration

### Environment Variables

Create `.env.local` for development:
```env
VITE_APP_TITLE=Azad Project
VITE_API_URL=http://localhost:8000
```

Production variables are in `.env.production`

### Vite Configuration

The `vite.config.ts` includes:
- Code splitting for optimal loading
- Asset optimization
- Development proxy configuration
- Production optimizations

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.tsx      # Navigation header
│   ├── ThemeToggle.tsx # Theme switching component
│   └── PageTransition.tsx # Page transition wrapper
├── contexts/           # React contexts
│   └── ThemeContext.tsx # Theme management
├── pages/              # Page components
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Services.tsx
│   ├── Careers.tsx
│   └── Contact.tsx
├── styles/             # CSS files
│   ├── main.css        # Main styles with theme variables
│   ├── about.css       # About page styles
│   └── Services.css    # Services page styles
└── App.tsx             # Main application component
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Run `npm run clean` then `npm run build`
   - Check TypeScript errors with `npm run lint`

2. **Theme Not Switching**
   - Clear localStorage: `localStorage.clear()`
   - Check browser console for errors

3. **Animations Not Working**
   - Ensure AOS is initialized
   - Check for `prefers-reduced-motion` setting

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ using modern web technologies**
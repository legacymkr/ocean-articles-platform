# 🌊 Galatide Ocean Platform

**Explore the mysterious connection between deep space and the ocean depths.**

A modern, multilingual ocean exploration platform built with Next.js, featuring beautiful ocean-themed design and comprehensive content management.

## ✨ Features

- 🌊 **Ocean-themed Design** - Beautiful deep blue color palette with glass morphism UI
- 🌍 **Multilingual Support** - 7 languages (English, Arabic, Chinese, Russian, German, French, Hindi)
- 📝 **Content Management** - Full admin dashboard for articles and translations
- 🎨 **Modern UI** - Responsive design with Tailwind CSS and custom animations
- 📧 **Email System** - Automated notifications and welcome emails
- 🔍 **SEO Optimized** - Complete metadata and social media integration
- 🌐 **RTL Support** - Proper right-to-left text support for Arabic

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/ocean.git
cd ocean
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS with custom ocean theme
- **Database:** Prisma ORM (SQLite/PostgreSQL)
- **Email:** Resend API
- **Deployment:** Vercel/Railway ready

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                # Utilities and configurations
├── contexts/           # React contexts
└── styles/             # Global styles and themes
```

## 🌊 Ocean Theme

The platform features a carefully crafted ocean color palette:
- **Primary:** Ocean Cyan (`hsl(188, 100%, 60%)`)
- **Secondary:** Aqua Teal (`hsl(175, 85%, 50%)`)
- **Background:** Deep Ocean Blue (`#0A1A2A`)
- **Accents:** Various ocean blues and teals

## 🌍 Multilingual Content

Supported languages with full RTL support:
- 🇺🇸 English - "Welcome to Galatide Ocean"
- 🇸🇦 Arabic - "مرحباً بك في محيط جالاتايد"
- 🇨🇳 Chinese - "欢迎来到银河潮汐海洋"
- 🇷🇺 Russian - "Добро пожаловать в Galatide Ocean"
- 🇩🇪 German - "Willkommen bei Galatide Ocean"
- 🇫🇷 French - "Bienvenue sur Galatide Ocean"
- 🇮🇳 Hindi - "Galatide Ocean में आपका स्वागत है"

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Railway
```bash
railway login
railway init
railway up
```

## 📧 Email Configuration

Configure email settings in your environment:
```env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@galatide.com
ADMIN_EMAIL=admin@galatide.com
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌊 About Galatide

Galatide Ocean Platform explores the fascinating connections between deep space phenomena and ocean mysteries, bringing together cutting-edge research and immersive storytelling to reveal the hidden secrets of our planet's vast oceans.

---

**Built with 💙 by the Galatide Team**

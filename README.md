# 🍽️ Khaaozy - Smart Canteen Management System

A comprehensive multi-platform canteen management solution for educational institutions, featuring AI-powered menu parsing, real-time order management, and role-based access control.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8+-green.svg)
![Kotlin](https://img.shields.io/badge/Kotlin-1.9-purple.svg)

## 🌟 Features

### 🔐 Multi-Role Support
- **Students/Faculty**: Browse canteens, place orders, track status, provide feedback
- **Canteen Owners**: Manage menus with AI assistance, process orders, update inventory
- **Administrators**: Oversee multiple colleges, manage users, view analytics

### 🤖 AI-Powered Menu Management
- **OCR Technology**: Extract menu items from images using Tesseract
- **Smart Parsing**: Automatically detect prices, categories, and descriptions
- **Multi-Format Support**: JPG, PNG, JPEG, BMP, TIFF image formats

### 📱 Modern Tech Stack
- **Frontend**: React 18 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Mobile**: Kotlin with Jetpack Compose (Android)
- **AI Service**: Python FastAPI with OpenCV and Tesseract OCR

## 🏗️ Project Structure

```
khaaozy/
├── admin-dashboard/          # React admin web application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── stores/          # State management
│   │   └── lib/             # Utilities and configurations
│   ├── package.json
│   └── README.md
├── ai-menu-parser/          # Python OCR service
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment configuration
├── android-app/             # Kotlin mobile application
│   ├── app/src/main/java/   # Application source code
│   ├── build.gradle.kts     # Build configuration
│   └── gradle/              # Gradle wrapper and dependencies
├── supabase/                # Database and backend services
│   ├── migrations/          # SQL schema migrations
│   └── SETUP_GUIDE.md      # Database setup instructions
├── docs/                    # Project documentation
└── scripts/                 # Setup and deployment scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ with pip
- Android Studio (for mobile development)
- Supabase account
- Tesseract OCR installed

### 1. Clone the Repository
```bash
git clone https://github.com/Gauravguddeti/khaaozy.git
cd khaaozy
```

### 2. Set Up Admin Dashboard
```bash
cd admin-dashboard
npm install
cp .env.example .env
# Configure your Supabase credentials in .env
npm run dev
```

### 3. Set Up AI Menu Parser
```bash
cd ai-menu-parser
pip install -r requirements.txt
cp .env.example .env
# Configure Tesseract path in .env
python main.py
```

### 4. Set Up Database
```bash
cd supabase
# Follow SETUP_GUIDE.md for Supabase configuration
```

### 5. Run Android App
```bash
cd android-app
# Open in Android Studio
# Configure Supabase credentials
# Build and run on device/emulator
```

## 🔧 Configuration

### Environment Variables

#### Admin Dashboard (.env)
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### AI Menu Parser (.env)
```bash
DEBUG=true
PORT=8000
TESSERACT_CMD=tesseract
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
MAX_FILE_SIZE=10485760
```

## 📊 Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for responsive, utility-first styling
- **React Query** for efficient data fetching and caching
- **Zustand** for lightweight state management
- **React Router** for client-side routing

### Backend Architecture
- **Supabase** for authentication, database, and real-time features
- **PostgreSQL** with Row Level Security (RLS) for data isolation
- **FastAPI** for high-performance AI processing service
- **Tesseract OCR** for text extraction from menu images

### Mobile Architecture
- **Jetpack Compose** for modern Android UI
- **MVVM Pattern** with ViewModels and LiveData
- **Dependency Injection** with Hilt
- **Supabase Kotlin SDK** for backend integration

## 🔐 Security Features

- **Multi-tenant Architecture**: College-based data isolation
- **Row Level Security**: Database-level access control
- **Role-based Permissions**: Granular access management
- **Secure Authentication**: Supabase Auth with JWT tokens
- **Input Validation**: Comprehensive data sanitization

## 📱 Supported Platforms

- **Web**: Modern browsers with responsive design
- **Android**: API level 24+ (Android 7.0+)
- **Server**: Linux, Windows, macOS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tesseract OCR** for optical character recognition
- **Supabase** for backend infrastructure
- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for utility-first styling
- **Jetpack Compose** for modern Android development

## 📞 Support

For support, email [support@khaaozy.com](mailto:support@khaaozy.com) or create an issue on GitHub.

---

**Built with ❤️ for educational institutions seeking efficient canteen management**
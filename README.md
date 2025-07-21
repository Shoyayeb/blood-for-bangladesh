# 🩸 Blood Donor Availability App

A **life-saving platform** that connects blood donors with those in need. Find available blood donors in real-time, respecting privacy and implementing smart cooldown periods to ensure donor health.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue)

## 🌟 Features

### 🔐 **Secure Authentication**
- Firebase Phone Authentication with OTP verification
- Privacy-controlled contact visibility
- Profile management with customizable settings

### 🔍 **Smart Donor Search**
- Real-time search by blood group and location
- Blood compatibility matching (e.g., O- can donate to all)
- Privacy-aware results (respects donor visibility preferences)
- Location-based filtering with radius options

### ⏰ **Health-Conscious Design**
- **3-month donation cooldown** to protect donor health
- Automatic availability calculation
- Donation history tracking

### 🚨 **Blood Request System**
- Emergency blood request notifications
- Urgency levels (Low, Medium, High, Critical)
- Targeted notifications to compatible donors
- Location-based donor discovery

### 🛡️ **Privacy Controls**
- **Contact Visibility**: Public, Restricted (logged-in only), Private
- **Profile Visibility**: Public or Private search results
- User-controlled privacy settings

### 📱 **Modern UI/UX**
- Responsive design for all devices
- Clean, medical-grade interface
- Accessible components with proper ARIA labels
- Real-time updates and feedback

---

## 🚀 Quick Start for Contributors

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** (recommended) or npm ([Install pnpm](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** database (local or cloud)
- **Firebase Project** (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/blood-donation.git
cd blood-donation
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/blood_donation_db"

# Firebase Configuration (Get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"

# Firebase Admin SDK (optional - for production features)
FIREBASE_PROJECT_ID="your_project_id"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DONATION_COOLDOWN_MONTHS=3
```

### 4. Database Setup

#### Option A: Local PostgreSQL

1. **Install PostgreSQL** on your machine
2. **Create a database**:
   ```sql
   CREATE DATABASE blood_donation_db;
   CREATE USER your_username WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE blood_donation_db TO your_username;
   ```

#### Option B: Free Cloud Database

Use services like:
- [Supabase](https://supabase.com/) (recommended)
- [Railway](https://railway.app/)
- [Neon](https://neon.tech/)

### 5. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed database with sample data
npx prisma db seed
```

### 6. Firebase Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication → Phone provider

2. **Configure Authentication**:
   - Authentication → Settings → Authorized domains
   - Add `localhost` for development

3. **Get Configuration**:
   - Project Settings → General → Your apps
   - Copy the config object values to your `.env.local`

4. **Service Account** (Optional for production features):
   - Project Settings → Service accounts
   - Generate new private key
   - Save as `firebase-service-account.json` in project root

### 7. Start Development Server

```bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗂️ Project Structure

```
blood-donation/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── users/        # User management endpoints
│   │   └── blood-requests/ # Blood request system
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # User dashboard
│   ├── profile/          # Profile management
│   ├── search/           # Donor search
│   ├── request/          # Blood request form
│   └── layout.tsx        # Root layout with navigation
├── components/            # Reusable UI components
│   ├── ui/               # ShadCN UI components
│   ├── auth/             # Authentication components
│   └── [feature-components]
├── lib/                  # Utilities and configurations
│   ├── auth-context.tsx  # Authentication context
│   ├── firebase.ts       # Firebase client config
│   ├── firebase-admin.ts # Firebase admin config
│   ├── prisma.ts         # Database client
│   ├── types.ts          # TypeScript definitions
│   └── utils-donation.ts # Donation-related utilities
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

---

## 🛠️ Development Guide

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks

# Database
npx prisma studio    # Open database GUI
npx prisma generate  # Regenerate Prisma client
npx prisma db push   # Push schema changes
npx prisma migrate dev  # Create and apply migration
```

### Code Style

- **TypeScript**: Strongly typed throughout
- **ESLint + Prettier**: Automatic formatting
- **Conventional Commits**: Use conventional commit messages
- **Component Structure**: Functional components with hooks

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

---

## 🌐 Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | Next.js 15, React 18 | Full-stack React framework |
| **Styling** | Tailwind CSS, ShadCN UI | Utility-first CSS, component library |
| **Authentication** | Firebase Auth | Phone number authentication |
| **Database** | PostgreSQL + Prisma | Relational database with type-safe ORM |
| **State Management** | React Context | Authentication and global state |
| **Form Handling** | React Hook Form + Zod | Type-safe form validation |
| **UI Components** | Radix UI, Lucide Icons | Accessible components and icons |
| **Deployment** | Vercel | Serverless deployment platform |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork & Clone
```bash
git clone https://github.com/yourusername/blood-donation.git
cd blood-donation
git remote add upstream https://github.com/original/blood-donation.git
```

### 2. Create Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 4. Test Your Changes
```bash
pnpm lint        # Check code style
pnpm type-check  # Check TypeScript
pnpm test        # Run tests
pnpm dev         # Test locally
```

### 5. Commit & Push
```bash
git add .
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
```

### 6. Create Pull Request
- Create a pull request from your fork
- Describe your changes clearly
- Link to any related issues

### Contribution Guidelines

- **Code Quality**: Ensure TypeScript compilation passes
- **Testing**: Add tests for new features
- **Documentation**: Update README for significant changes
- **Accessibility**: Maintain ARIA compliance
- **Security**: Follow security best practices
- **Performance**: Consider performance implications

---

## 🐛 Troubleshooting

### Common Issues

#### Firebase Authentication Errors
```bash
# Issue: "Firebase app credentials are invalid"
# Solution: Ensure firebase-service-account.json is in project root
# Or check that Firebase config in .env.local is correct
```

#### Database Connection Issues
```bash
# Issue: "Can't reach database server"
# Solution: Check DATABASE_URL format
# Ensure database is running and accessible
```

#### Build Errors
```bash
# Issue: TypeScript compilation errors
# Solution: Run type checking
npx tsc --noEmit

# Fix any type errors before building
```

#### Phone Authentication Issues
```bash
# Issue: OTP not received
# Solution: Check Firebase Console → Authentication → Settings
# Ensure your domain is in authorized domains list
```

### Getting Help

1. **Check Issues**: Search existing GitHub issues
2. **Documentation**: Review Firebase and Prisma docs
3. **Community**: Join our Discord/Slack for real-time help
4. **Create Issue**: If you find a bug, create a detailed issue

---

## 📋 Roadmap

### Current Features ✅
- [x] Phone authentication with Firebase
- [x] User registration and profile management
- [x] Privacy-controlled donor search
- [x] Blood compatibility matching
- [x] 3-month donation cooldown
- [x] Blood request system with notifications
- [x] Responsive design

### Upcoming Features 🚧
- [ ] Email notifications for blood requests
- [ ] SMS integration for urgent requests
- [ ] Geolocation-based nearest donor search
- [ ] Blood bank integration
- [ ] Appointment scheduling system
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] Push notifications
- [ ] Analytics dashboard for blood banks

### Future Enhancements 🔮
- [ ] Integration with health records
- [ ] Blood inventory management
- [ ] Donor health tracking
- [ ] Reward system for regular donors
- [ ] Community features and forums

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Firebase** for secure authentication
- **Prisma** for type-safe database access
- **ShadCN** for beautiful UI components
- **Vercel** for seamless deployment
- **Open Source Community** for continuous inspiration

---

## 📞 Support

- **Email**: support@blooddonorapp.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/blood-donation/issues)
- **Discord**: [Join our community](#)
- **Documentation**: [Full documentation](#)

---

**⚡ Ready to save lives? Let's build something amazing together!**

*Every contribution, no matter how small, helps save lives. Thank you for being part of this mission.* 🩸❤️

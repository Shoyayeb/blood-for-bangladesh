# Project Architecture Overview

## 🏗️ Technical Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: ShadCN UI (Radix UI primitives)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend
- **API**: Next.js API routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Firebase Auth (Phone OTP)
- **Server Auth**: Firebase Admin SDK

### Infrastructure
- **Deployment**: Vercel (recommended)
- **Database Hosting**: Supabase/Railway/Neon
- **CI/CD**: GitHub Actions
- **Package Manager**: pnpm

## 📁 Project Structure

```
blood-donation/
├── 📁 app/                    # Next.js 15 App Router
│   ├── 📄 layout.tsx         # Root layout with providers
│   ├── 📄 page.tsx           # Home page
│   ├── 📄 globals.css        # Global styles
│   │
│   ├── 📁 api/               # API routes
│   │   ├── 📁 auth/          # Authentication endpoints
│   │   ├── 📁 users/         # User management
│   │   ├── 📁 blood-requests/ # Blood request system
│   │   └── 📁 notifications/ # Notification system
│   │
│   ├── 📁 auth/              # Authentication pages
│   │   ├── 📄 login/page.tsx
│   │   └── 📄 register/page.tsx
│   │
│   ├── 📁 profile/           # User profile
│   │   └── 📄 page.tsx
│   │
│   ├── 📁 search/            # Donor search
│   │   └── 📄 page.tsx
│   │
│   └── 📁 request/           # Blood request
│       └── 📄 page.tsx
│
├── 📁 components/            # React components
│   ├── 📁 ui/               # Base UI components (ShadCN)
│   │   ├── 📄 button.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 dialog.tsx
│   │   └── ...
│   │
│   ├── 📁 auth/             # Authentication components
│   │   ├── 📄 login-form.tsx
│   │   ├── 📄 register-form.tsx
│   │   └── 📄 phone-verification.tsx
│   │
│   ├── 📁 donor/            # Donor-related components
│   │   ├── 📄 donor-card.tsx
│   │   ├── 📄 donor-search.tsx
│   │   └── 📄 donor-profile.tsx
│   │
│   ├── 📄 navigation.tsx     # Main navigation
│   ├── 📄 blood-request.tsx  # Blood request form
│   └── 📄 notifications.tsx  # Notification system
│
├── 📁 lib/                  # Utility libraries
│   ├── 📄 firebase.ts       # Firebase client config
│   ├── 📄 firebase-admin.ts # Firebase server config
│   ├── 📄 db.ts            # Prisma client
│   ├── 📄 auth.ts          # Authentication utilities
│   ├── 📄 utils.ts         # General utilities
│   └── 📄 constants.ts     # App constants
│
├── 📁 prisma/              # Database
│   ├── 📄 schema.prisma    # Database schema
│   └── 📁 migrations/      # Database migrations
│
├── 📁 .github/             # GitHub configuration
│   ├── 📁 ISSUE_TEMPLATE/  # Issue templates
│   ├── 📁 workflows/       # CI/CD workflows
│   └── 📄 pull_request_template.md
│
├── 📄 README.md            # Project documentation
├── 📄 CONTRIBUTING.md      # Contribution guidelines
├── 📄 LICENSE              # MIT license
├── 📄 .env.example         # Environment variables template
└── 📄 package.json         # Dependencies and scripts
```

## 🔄 Data Flow

### Authentication Flow
1. User enters phone number
2. Firebase sends OTP
3. User verifies OTP
4. Firebase returns ID token
5. Server validates token with Firebase Admin
6. User session created

### Blood Request Flow
1. User fills request form
2. System finds compatible donors
3. Respects privacy settings
4. Creates notifications
5. Sends alerts to donors
6. Tracks request status

### Donor Search Flow
1. User enters search criteria
2. Database query with filters
3. Privacy-aware results
4. Donor cards displayed
5. Contact options based on settings

## 🗄️ Database Schema

### Core Models

#### User
- Authentication info (phone)
- Personal details (name, age, weight)
- Blood group and location
- Privacy settings
- Availability status

#### Donation
- Donation history
- Date and location
- Related to user

#### BloodRequest
- Emergency requests
- Blood group needed
- Location and urgency
- Contact information

#### Notification
- System notifications
- Blood request alerts
- Read/unread status

## 🔐 Security Features

### Authentication
- Phone number verification
- Firebase security rules
- Server-side token validation
- Session management

### Privacy Controls
- Contact visibility settings
- Search result filtering
- Opt-out mechanisms
- Data protection

### Data Validation
- Zod schemas for all inputs
- TypeScript type safety
- Prisma type generation
- Server-side validation

## 📱 User Experience

### Responsive Design
- Mobile-first approach
- Touch-friendly interfaces
- Optimized for all devices
- Progressive web app ready

### Accessibility
- WCAG 2.1 compliant
- Screen reader support
- Keyboard navigation
- High contrast support

### Performance
- Next.js optimizations
- Image optimization
- Code splitting
- Fast loading times

## 🚀 Deployment

### Recommended Stack
- **Frontend**: Vercel
- **Database**: Supabase
- **Authentication**: Firebase
- **Monitoring**: Vercel Analytics

### Environment Setup
- Development: Local database
- Staging: Vercel preview
- Production: Vercel deployment

## 🧪 Testing Strategy

### Unit Tests
- Component testing
- Utility function tests
- API endpoint tests
- Database operation tests

### Integration Tests
- User flow testing
- API integration
- Database integration
- Authentication flow

### E2E Tests
- Critical user journeys
- Cross-browser testing
- Mobile device testing
- Accessibility testing

## 📊 Monitoring

### Performance Metrics
- Core Web Vitals
- Loading times
- Error rates
- User engagement

### Business Metrics
- Registration rates
- Successful connections
- Blood requests fulfilled
- User retention

## 🔮 Future Enhancements

### Phase 1 (MVP Complete) ✅
- User registration/login
- Donor search
- Blood requests
- Basic notifications

### Phase 2 (Planned)
- Real-time chat
- GPS location
- Push notifications
- Advanced matching

### Phase 3 (Future)
- Mobile app
- Hospital integration
- Blood bank partnerships
- International support

## 📝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

*Built with ❤️ for saving lives through technology*

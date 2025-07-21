# Contributing to Blood Donor Availability App

First off, thank you for considering contributing to the Blood Donor Availability App! 🩸❤️ 

Every contribution helps save lives by making blood donation more accessible and efficient.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Guidelines](#contribution-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## 🤝 Code of Conduct

This project follows a Code of Conduct that we expect all contributors to adhere to:

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them learn
- **Be constructive**: Provide helpful feedback and suggestions
- **Focus on the mission**: Remember we're building this to save lives

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm)
- PostgreSQL database (local or cloud)
- Firebase project (free tier works)
- Basic knowledge of React, Next.js, and TypeScript

### Quick Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/blood-donation.git
   cd blood-donation
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Fill in your Firebase and database credentials
   ```
5. **Set up the database**:
   ```bash
   npx prisma db push
   ```
6. **Start development server**:
   ```bash
   pnpm dev
   ```

## 🛠️ Development Setup

### Database Setup Options

#### Option 1: Local PostgreSQL
```bash
# Install PostgreSQL, then:
createdb blood_donation_db
```

#### Option 2: Free Cloud Database
- **Supabase** (recommended): https://supabase.com/
- **Railway**: https://railway.app/
- **Neon**: https://neon.tech/

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication → Phone provider
3. Add `localhost` to authorized domains
4. Copy config to `.env.local`

### Development Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Test your changes
pnpm lint
pnpm type-check
pnpm test

# Commit and push
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

## 📝 Contribution Guidelines

### Types of Contributions

We welcome various types of contributions:

#### 🐛 Bug Reports
- Use the bug report template
- Include steps to reproduce
- Provide screenshots if applicable
- Mention your environment (OS, browser, etc.)

#### ✨ Feature Requests
- Use the feature request template
- Explain the problem you're solving
- Describe your proposed solution
- Consider implementation complexity

#### 🔧 Code Contributions
- Bug fixes
- New features
- Performance improvements
- Code refactoring
- Test coverage improvements

#### 📚 Documentation
- README improvements
- Code comments
- API documentation
- Setup guides
- Tutorial content

#### 🎨 Design
- UI/UX improvements
- Accessibility enhancements
- Mobile responsiveness
- Icon and asset creation

### What to Work On

#### Good First Issues
Look for issues labeled `good first issue`:
- Simple bug fixes
- Documentation updates
- UI text improvements
- Adding missing error messages

#### High Impact Areas
- Accessibility improvements
- Performance optimizations
- Security enhancements
- Mobile experience
- Error handling

#### Current Priorities
1. **Accessibility**: Ensure WCAG compliance
2. **Testing**: Increase test coverage
3. **Documentation**: Improve setup guides
4. **Performance**: Optimize database queries
5. **Security**: Enhance data protection

## 🔄 Pull Request Process

### Before Submitting

1. **Check existing issues/PRs** to avoid duplication
2. **Create an issue** for significant changes
3. **Fork and clone** the repository
4. **Create a feature branch** from `main`
5. **Make your changes** following our coding standards
6. **Test thoroughly** on your local environment
7. **Update documentation** if needed

### PR Requirements

✅ **Required Checks:**
- [ ] Code compiles without errors (`pnpm build`)
- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] TypeScript checks pass (`pnpm type-check`)
- [ ] No console errors in browser
- [ ] Mobile responsive (if UI changes)
- [ ] Accessible (proper ARIA labels, keyboard navigation)

### PR Template

When creating a PR, please include:

```markdown
## 📝 Description
Brief description of changes

## 🔗 Related Issue
Closes #issue_number

## 📱 Screenshots (if applicable)
Before/after screenshots for UI changes

## ✅ Testing
- [ ] Tested locally
- [ ] Tested on mobile
- [ ] Added/updated tests
- [ ] Manual testing steps provided

## 📋 Checklist
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on various environments
4. **Approval** and merge

## 📐 Coding Standards

### TypeScript

```typescript
// ✅ Good: Proper typing
interface User {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
}

// ❌ Avoid: Using 'any'
const user: any = getData();
```

### React Components

```tsx
// ✅ Good: Functional component with proper props
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </button>
  );
}
```

### Naming Conventions

- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### Code Organization

```
components/
├── ui/              # Reusable UI components
├── auth/            # Authentication-specific components
├── donor/           # Donor-related components
└── forms/           # Form components

lib/
├── utils/           # Utility functions
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── constants/       # App constants
```

### Database Conventions

```prisma
// ✅ Good: Clear model definition
model User {
  id              String   @id @default(cuid())
  phoneNumber     String   @unique
  bloodGroup      BloodGroup
  // ... other fields
  
  donations       Donation[]
  
  @@map("users")
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test components/auth
```

### Writing Tests

#### Component Tests
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### API Tests
```typescript
import { createMocks } from 'node-mocks-http';
import handler from '../api/users/search';

describe('/api/users/search', () => {
  it('returns donors for valid blood group', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { bloodGroup: 'O_POSITIVE' },
    });

    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.users).toBeDefined();
  });
});
```

### Test Coverage Goals

- **Components**: 80%+ coverage
- **Utilities**: 90%+ coverage
- **API routes**: 85%+ coverage
- **Critical paths**: 100% coverage

## 📚 Documentation

### Code Comments

```typescript
/**
 * Calculates the next available donation date for a user
 * @param lastDonation - The user's last donation date
 * @param cooldownMonths - Number of months to wait (default: 3)
 * @returns The date when the user can donate again
 */
export function calculateNextDonationDate(
  lastDonation: Date, 
  cooldownMonths: number = 3
): Date {
  // Implementation...
}
```

### Component Documentation

```tsx
/**
 * DonorCard displays information about a blood donor
 * 
 * @example
 * ```tsx
 * <DonorCard 
 *   donor={donor} 
 *   showContact={true}
 *   onContact={() => handleContact(donor.id)}
 * />
 * ```
 */
interface DonorCardProps {
  /** Donor information to display */
  donor: Donor;
  /** Whether to show contact information */
  showContact?: boolean;
  /** Callback when contact button is clicked */
  onContact?: () => void;
}
```

### API Documentation

Document API endpoints:

```typescript
/**
 * GET /api/users/search
 * 
 * Search for available blood donors
 * 
 * Query Parameters:
 * - bloodGroup: BloodGroup (optional)
 * - city: string (optional)
 * - state: string (optional)
 * 
 * Returns:
 * - users: Donor[] - List of available donors
 * - total: number - Total count of results
 */
```

## 🌟 Community

### Getting Help

- **GitHub Discussions**: For questions and general discussion
- **Issues**: For bugs and feature requests
- **Discord/Slack**: Real-time chat (link in README)
- **Email**: For sensitive matters

### Mentorship

- New contributors are paired with experienced maintainers
- Regular office hours for questions
- Code review mentorship program

### Recognition

Contributors are recognized through:
- Contributor spotlight in releases
- Hall of fame in documentation
- Special badges for significant contributions
- Conference speaking opportunities

## 🎯 Project Goals

Remember our mission while contributing:

- **Save Lives**: Every feature should help connect donors with recipients
- **Privacy First**: Respect donor privacy and personal information
- **Accessibility**: Ensure the app is usable by everyone
- **Performance**: Fast, reliable experience for urgent requests
- **Global Impact**: Design for international use and scalability

## 📞 Need Help?

Don't hesitate to reach out:

- Create an issue for technical questions
- Join our community chat for real-time help
- Email maintainers for guidance
- Check existing documentation and issues first

Thank you for contributing to this life-saving project! 🩸❤️

*Every line of code you write could help save someone's life.*

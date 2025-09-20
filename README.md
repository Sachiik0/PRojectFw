# Freedom Wall

A digital freedom wall where people can share their thoughts, poems, stories, and connect with others through authentic expression.

## Features

- **Open Expression**: Share poems, thoughts, stories, or any content
- **Social Features**: Like posts, follow users, build communities
- **Privacy First**: Email addresses are completely hidden, only pen names are visible
- **Moderation**: Report system for inappropriate content
- **Real-time Updates**: See new posts as they're shared
- **Personal Dashboard**: Track your posts, likes, and followers
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account

### Installation

1. Clone the repository:
```bash
git clone 
cd freedom-wall
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Supabase project:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the SQL schema provided in the project setup

4. Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

Run the SQL schema provided in the project structure to set up all necessary tables, policies, and triggers.

## Key Features Implemented

### Authentication & Authorization
- Email/password authentication
- Unique pen names per email
- Row Level Security (RLS) policies

### Social Features
- Like/unlike posts
- Follow/unfollow users
- Real-time notifications (limited to every 12 hours)
- User profiles with stats

### Content Management
- Rich text posts with line break support
- Character limits (2000 characters)
- Post reporting system
- Admin moderation capabilities

### Privacy & Security
- Emails are never exposed to other users
- Secure authentication with Supabase
- Content moderation through reporting

### Real-time Features
- Live post updates
- Instant like counts
- Real-time follower counts

## Folder Structure

```
freedom-wall/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── dashboard/         # User dashboard
│   ├── profile/           # User profiles
│   └── page.tsx           # Home page (freedom wall)
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── AuthForms.tsx     # Login/signup forms
│   ├── FreedomWall.tsx   # Main feed component
│   ├── PostCard.tsx      # Individual post display
│   ├── PostForm.tsx      # Create new post
│   └── ...
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client setup
│   ├── hooks/            # Custom React hooks
│   ├── types.ts          # TypeScript definitions
│   └── utils.ts          # Utility functions
└── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Deployment

The application can be deployed on Vercel, Netlify, or any platform that supports Next.js applications. Make sure to set up your environment variables in your deployment platform.

## Support

For questions or issues, please open a GitHub issue or contact the maintainers.# PRojectFw

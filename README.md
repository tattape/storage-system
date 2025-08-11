# Storage System

A modern inventory management system built with Next.js, Firebase, and beautiful animated UI.

## Features

- 🔐 **Authentication** - Firebase Auth with secure sessions
- 📦 **Stock Management** - Track inventory with real-time updates
- 💰 **Sales Tracking** - Monitor sales history and analytics
- 🎨 **Beautiful UI** - Glassmorphism design with animated background
- 📱 **Responsive Design** - Works on all devices
- 🚀 **Production Ready** - Built for deployment

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: Hero UI, Tailwind CSS
- **Backend**: Firebase Firestore, Firebase Auth
- **Animation**: OGL (WebGL)
- **Deployment**: Vercel, Docker, GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project setup

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd storage-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Firebase configuration in `.env.local`:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_ADMIN_SDK_KEY=your_admin_sdk_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Option 2: Docker

1. Build the Docker image:
```bash
docker build -t storage-system .
```

2. Run the container:
```bash
docker run -p 3000:3000 storage-system
```

### Option 3: GitHub Actions + Docker

1. Set up GitHub repository secrets:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_ADMIN_SDK_KEY`

2. Push to main branch - GitHub Actions will automatically:
   - Build the project
   - Create Docker image
   - Push to GitHub Container Registry

3. Deploy the container to your hosting platform

### Option 4: Docker Compose

1. Create `.env` file with your Firebase configuration
2. Run with docker-compose:
```bash
docker-compose up -d
```

## GitHub Actions Setup

The project includes two GitHub Actions workflows:

### 1. Vercel Deployment (`.github/workflows/deploy.yml`)
- Builds and deploys to Vercel
- Triggered on push to main branch

### 2. Docker Build (`.github/workflows/docker.yml`)
- Builds multi-platform Docker images
- Pushes to GitHub Container Registry
- Triggered on push to main branch

### Required Secrets

Add these secrets to your GitHub repository:

#### For Vercel Deployment:
- `VERCEL_TOKEN` - Your Vercel deployment token
- `ORG_ID` - Your Vercel organization ID
- `PROJECT_ID` - Your Vercel project ID

#### For Firebase:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_ADMIN_SDK_KEY`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FIREBASE_API_KEY` | Firebase API key | Yes |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `FIREBASE_APP_ID` | Firebase app ID | Yes |
| `FIREBASE_ADMIN_SDK_KEY` | Firebase admin SDK key | Yes |

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages and components
│   ├── login/            # Login page
│   └── api/              # API routes
├── components/           # Shared components
│   ├── Navbar.tsx       # Navigation bar
│   ├── DarkVeil.tsx     # Animated background
│   └── icons/           # Icon components
├── hooks/               # Custom React hooks
├── lib/                 # Library configurations
├── services/            # API services
└── utils/               # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

If you have any questions or need help, please open an issue on GitHub.

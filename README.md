# ITI Graduation Project - Mock Mate

## Project Overview

This is a comprehensive **Mock-Mate** built as an ITI Graduation Project. The platform facilitates technical interviews with real-time video communication, collaborative coding environments, and AI-assisted evaluation capabilities. It's designed to streamline the interview process for both instructors and students in educational institutions.

## Key Features

### Real-time Video Interviews
- **WebRTC Integration**: Powered by LiveKit for high-quality video/audio communication
- **Session Management**: Secure interview sessions with unique room codes
- **Multi-participant Support**: Support for interviewer and candidate interactions

### Collaborative Coding Environment
- **Monaco Editor**: Professional code editor with syntax highlighting
- **Real-time Collaboration**: Live editing using Yjs and Liveblocks
- **Multi-language Support**: Support for TypeScript, JavaScript, Python, Java, C++, and more
- **Code Execution**: Integrated Judge0 API for real-time code compilation and execution
- **Terminal Integration**: Interactive terminal for input/output handling

### AI-Powered Assistance
- **AI Chat Integration**: Intelligent interview assistance for instructors
- **Streaming Responses**: Real-time AI responses using Server-Sent Events
- **Context-Aware**: AI maintains conversation context throughout the interview
- **Evaluation Support**: AI-assisted candidate evaluation and feedback

### User Management & Roles
- **Multi-role System**: Admin, Instructor, and Student roles
- **Role-based Access Control**: Different permissions and interfaces per role
- **User Authentication**: Secure login with email verification
- **Social Login**: Google and LinkedIn OAuth integration

### Interview Management
- **Room Creation**: Instructors can create interview rooms
- **Student Assignment**: Assign students to specific interview slots
- **Queue System**: Real-time queue management for interview participants
- **Scheduling**: Interview date and time management
- **Email Notifications**: Automated email notifications for scheduling changes

### Analytics & Reporting
- **Admin Dashboard**: Comprehensive analytics and user management
- **Interview Statistics**: Track completed interviews and performance metrics
- **User Analytics**: Monitor user activity and engagement
- **Evaluation Tracking**: Store and analyze interview evaluations

## Technology Stack

### Backend
- **Laravel 12**: PHP framework for robust backend development
- **MySQL**: Primary database for data persistence
- **Redis**: Caching and session management
- **Pusher**: Real-time event broadcasting
- **LiveKit**: WebRTC video communication infrastructure
- **Judge0 API**: Code execution and compilation service

### Frontend
- **React 19**: Modern UI library with hooks and functional components
- **TypeScript**: Type-safe JavaScript development
- **Inertia.js**: SPA-like experience without API complexity
- **Tailwind CSS 4**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Radix UI**: Accessible component primitives

### Real-time Features
- **Liveblocks**: Collaborative editing infrastructure
- **Yjs**: Conflict-free replicated data types (CRDTs)
- **Socket.io**: Real-time bidirectional communication
- **Server-Sent Events**: Streaming AI responses

### Development Tools
- **Vite**: Fast build tool and development server
- **ESLint & Prettier**: Code quality and formatting
- **Docker**: Containerized development environment
- **Laravel Sail**: Docker-based development environment

## Project Structure

```
ITI-Graduation-Project/
├── app/
│   ├── Events/                 # Real-time event broadcasting
│   ├── Http/
│   │   ├── Controllers/        # API and web controllers
│   │   ├── Middleware/         # Custom middleware
│   │   └── Requests/           # Form request validation
│   ├── Mail/                   # Email templates and notifications
│   ├── Models/                 # Eloquent models
│   └── Services/               # Business logic services
├── database/
│   ├── factories/              # Model factories for testing
│   └── migrations/             # Database schema migrations
├── resources/
│   ├── js/
│   │   ├── components/         # Reusable React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Page layouts
│   │   ├── pages/              # Inertia.js pages
│   │   └── types/              # TypeScript type definitions
│   └── views/                  # Blade templates
├── routes/                     # Application routes
├── config/                     # Configuration files
└── public/                     # Public assets
```

## Database Schema

### Core Models

#### Users
- **id**: Primary key
- **name**: User's full name
- **email**: Unique email address
- **password**: Hashed password
- **role**: User role (admin, instructor, student, null)
- **avatar**: Profile picture path
- **google_id**: Google OAuth identifier
- **linkedin_id**: LinkedIn OAuth identifier
- **email_verified_at**: Email verification timestamp

#### Rooms
- **id**: Primary key
- **name**: Room name
- **room_code**: Unique 8-character room identifier
- **created_by**: Foreign key to users table
- **current_participant**: Currently active participant
- **is_active**: Room status flag
- **last_activity**: Last activity timestamp

#### Room Queues
- **id**: Primary key
- **room_id**: Foreign key to rooms table
- **user_id**: Foreign key to users table
- **position**: Queue position
- **joined_at**: Queue join timestamp

#### Lobby Sessions
- **id**: Primary key
- **session_code**: Unique session identifier
- **room_id**: Foreign key to rooms table
- **creator_id**: Interviewer user ID
- **guest_id**: Candidate user ID
- **status**: Session status (active, ended)
- **started_at**: Session start time
- **ended_at**: Session end time

#### Interview Evaluations
- **id**: Primary key
- **lobby_session_id**: Foreign key to lobby sessions
- **guest_id**: Evaluated user ID
- **created_by**: Evaluator user ID
- **rating**: Numerical rating (1-10)
- **comments**: Text feedback

#### AI Chat Messages
- **id**: Primary key
- **session_code**: Session identifier
- **role**: Message role (user, assistant)
- **content**: Message content
- **created_at**: Timestamp

## Installation & Setup

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL 8.0+
- Redis
- Docker (optional, for containerized development)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ITI-Graduation-Project
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Environment configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Build frontend assets**
   ```bash
   npm run build
   ```

### Docker Setup (Alternative)

1. **Start Docker services**
   ```bash
   ./vendor/bin/sail up -d
   ```

2. **Install dependencies**
   ```bash
   ./vendor/bin/sail composer install
   ./vendor/bin/sail npm install
   ```

3. **Run migrations**
   ```bash
   ./vendor/bin/sail artisan migrate
   ```

## Usage Guide

### For Administrators

1. **Access Admin Dashboard**
   - Navigate to `/admin` after logging in with admin credentials
   - View comprehensive analytics and user statistics
   - Manage user roles and permissions

2. **User Management**
   - View all registered users
   - Assign roles (admin, instructor, student)
   - Activate/deactivate user accounts
   - Monitor user activity

### For Instructors

1. **Create Interview Rooms**
   - Navigate to `/lobby`
   - Click "Create New Room"
   - Assign students to specific time slots
   - Send email notifications to students

2. **Conduct Interviews**
   - Join the room as creator
   - Accept students from the queue
   - Use collaborative coding environment
   - Leverage AI assistance for evaluation
   - Submit ratings and feedback

3. **Manage Students**
   - View assigned students
   - Reschedule interviews
   - Mark attendance
   - Track completion status

### For Students

1. **Join Interview Rooms**
   - Access assigned rooms from dashboard
   - Join the queue when ready
   - Wait for instructor to accept

2. **Participate in Interviews**
   - Use collaborative coding environment
   - Communicate via video call
   - Submit code solutions
   - Receive real-time feedback

## Development

### Running the Development Server

```bash
# Start Laravel development server
php artisan serve

# Start Vite development server
npm run dev

# Start queue worker
php artisan queue:work

# Start WebSocket server (if using Socket.io)
php artisan websockets:serve
```

### Available Scripts

```bash
# Frontend development
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run build:ssr    # Build with SSR support

# Code quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run types        # Run TypeScript type checking

# Backend development
php artisan serve    # Start Laravel server
php artisan migrate  # Run database migrations
php artisan queue:work # Process queued jobs
```

## Security Features

- **Authentication**: Secure user authentication with Laravel Sanctum
- **Authorization**: Role-based access control (RBAC)
- **CSRF Protection**: Cross-site request forgery protection
- **Input Validation**: Comprehensive input validation and sanitization
- **SQL Injection Prevention**: Eloquent ORM with parameterized queries
- **XSS Protection**: Output escaping and content security policies
- **Rate Limiting**: API rate limiting to prevent abuse
- **Secure Headers**: Security headers for enhanced protection

## API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /user` - Get authenticated user

### Rooms
- `GET /lobby` - Get user's rooms
- `POST /rooms` - Create new room
- `GET /room/{code}` - Get room details
- `POST /room/{code}/join` - Join room queue
- `POST /room/{code}/accept` - Accept user from queue
- `DELETE /room/{code}/disconnect` - Disconnect current participant

### Sessions
- `GET /session/{code}` - Get session details
- `POST /session/{code}/evaluate` - Submit evaluation
- `GET /session/{code}/state` - Get session state

### AI Chat
- `POST /api/chat/{roomCode}` - Send chat message
- `GET /api/chat/{roomCode}/history` - Get chat history
- `DELETE /api/chat/{roomCode}/clear` - Clear chat history

### WebRTC
- `POST /api/webrtc/token` - Generate LiveKit access token

## Deployment

### Production Deployment

1. **Server Requirements**
   - PHP 8.2+
   - MySQL 8.0+
   - Redis
   - Nginx/Apache
   - Node.js 18+

2. **Deployment Steps**
   ```bash
   # Install dependencies
   composer install --optimize-autoloader --no-dev
   npm ci && npm run build

   # Configure environment
   cp .env.example .env
   # Edit .env with production values

   # Database setup
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache

   # Start services
   php artisan queue:work --daemon
   php artisan websockets:serve
   ```

3. **Docker Deployment**
   ```bash
   docker-compose up -d
   ```

### Environment-Specific Configuration

- **Development**: Use Laravel Sail for containerized development
- **Staging**: Deploy to staging environment with test data
- **Production**: Use production-optimized configuration

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   php artisan test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add new feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/new-feature
   ```
7. **Open a Pull Request**

### Code Standards

- Follow PSR-12 coding standards for PHP
- Use ESLint and Prettier for JavaScript/TypeScript
- Write comprehensive tests for new features
- Document all public methods and classes
- Follow conventional commit messages

## Team

- **Project Lead**: [Your Name]
- **Backend Development**: [Team Member]
- **Frontend Development**: [Team Member]
- **DevOps**: [Team Member]

## Acknowledgments

- **Laravel Community** for the excellent framework
- **LiveKit** for WebRTC infrastructure
- **Judge0** for code execution services
- **Liveblocks** for collaborative editing
- **ITI** for project guidance and support

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Core interview functionality
- AI chat integration
- Collaborative coding environment
- User management system
- Real-time video communication

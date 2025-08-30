# Overview

This is a cryptocurrency gambling platform built as a full-stack web application. The platform features various casino games including Mines, slots, sports betting, and other gambling options. Users can deposit and withdraw cryptocurrency, play games, and track their gaming sessions and transactions. The application provides a modern, responsive interface with real-time game mechanics and secure user authentication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation schemas
- **UI Components**: Radix UI primitives with custom styling for accessibility and consistency

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Development**: Hot module replacement with Vite integration for seamless development experience

## Authentication System
- **Provider**: Replit Auth with OpenID Connect (OIDC) integration
- **Strategy**: Passport.js with OpenID Client strategy for OAuth flows
- **Session Storage**: Server-side sessions stored in PostgreSQL with configurable TTL
- **Security**: HTTP-only cookies with secure flags and CSRF protection

## Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Connection**: Connection pooling with Neon serverless client for optimal performance

## Game Logic
- **Game Sessions**: Persistent game state tracking with database storage
- **Random Generation**: Server-side randomization for game mechanics (mine positions, etc.)
- **Real-time Updates**: Immediate state updates with optimistic UI patterns
- **Transaction Tracking**: Comprehensive bet and payout logging for audit trails

## Security Measures
- **Authentication**: Mandatory user authentication for all game and financial operations
- **Session Security**: Secure session management with database persistence
- **Input Validation**: Zod schemas for runtime type checking and validation
- **Error Handling**: Structured error responses with appropriate HTTP status codes

# External Dependencies

## Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting for scalable data storage
- **Replit Auth**: Managed authentication service with OIDC compliance

## Frontend Libraries
- **shadcn/ui**: Pre-built accessible UI components based on Radix UI
- **Radix UI**: Headless component primitives for accessibility
- **TanStack Query**: Server state management and caching solution
- **Wouter**: Lightweight routing library for single-page applications
- **Tailwind CSS**: Utility-first CSS framework for responsive design

## Backend Dependencies
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **Express.js**: Web application framework for Node.js
- **Passport.js**: Authentication middleware with strategy support
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking for both frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Cartographer**: Development tooling integration for Replit environment
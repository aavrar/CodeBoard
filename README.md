# CodeBoard

A modern code-switching research platform powered by **FastText** for lightweight, efficient language detection with community-driven verification features.

## Overview

CodeBoard is a production-ready platform that enables researchers and communities to collect, analyze, and share real-world code-switching examples. Built with FastText for fast language detection and enhanced with manual tagging and community voting features for data quality assurance.

## 🚀 **Current Status: Production-Ready Platform with FastText & Community Features**

**Current Architecture (July 2025)**
- ✅ **FastText Language Detection** - Lightweight, efficient detection for 176+ languages
- ✅ **Supabase Integration** - Complete migration from Prisma to Supabase
- ✅ **Community Voting System** - Real-time quality verification with user votes (FULLY FUNCTIONAL)
- ✅ **Manual Tagging Interface** - Interactive switch point editing for registered users
- ✅ **Quality Scoring & Verification** - Automatic verification status based on community feedback
- ✅ **Comprehensive Reference Data** - 82 languages, 101 regions, 46 platforms
- ✅ **Searchable UI Components** - Advanced dropdowns with search and filtering
- ✅ **Role-Based Access Control** - Community/Researcher/Admin tiers with JWT validation
- ✅ **Research Application Workflow** - Complete submission and approval system
- ✅ **Real-time Analytics** - Dashboard with data visualization
- ✅ **Performance Optimization** - <200MB memory footprint for free hosting
- ✅ **Multi-tier Authentication** - JWT with OAuth support for Google and GitHub
- ✅ **CUID Support** - Fixed validation schemas to support Supabase CUID identifiers

## Performance Characteristics

### **FastText Integration Benefits**
- **Speed**: Near-instant language detection (~1-5ms per text)
- **Memory**: ~15-20MB model size vs 600MB+ alternatives
- **Languages**: 176+ supported languages with consistent performance
- **Accuracy**: Balanced approach optimized for hosting constraints
- **Reliability**: Consistent performance across different text lengths
- **Scalability**: Perfect for free hosting tiers with memory limits

## Technology Stack

**NLP Engine:**
- **Primary**: FastText Python worker with stdin/stdout communication
- **Fallback**: Enhanced ELD with user guidance and phrase clustering
- **Processing**: Subprocess-based language detection with caching

**Backend:**
- Express.js with TypeScript strict mode
- PostgreSQL via Supabase client
- JWT authentication with role-based access (Community/Researcher/Admin)
- Comprehensive error handling and validation
- OAuth integration for Google and GitHub

**Frontend:**
- Next.js 15 with App Router
- React 19 with TypeScript
- Tailwind CSS and Radix UI
- Real-time analytics dashboard
- Manual tagging and voting interfaces

## Quick Start

### Prerequisites
- Node.js (v18+)
- Python 3.8+ (for FastText)
- Supabase account for database

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure SUPABASE_URL and SUPABASE_ANON_KEY in .env
npm run dev  # Starts on port 3001
```

### 2. FastText Service Setup
```bash
cd backend
pip install fasttext  # Install FastText
# FastText workers are automatically managed by the backend
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Configure NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm run dev  # Starts on port 3000
```

### 4. Database Schema Setup
```bash
# Run the voting system schema in Supabase Dashboard
# 1. Go to https://supabase.com/dashboard
# 2. Select your project → SQL Editor
# 3. Copy and paste contents of backend/src/utils/supabase-schema.sql
# 4. Click "Run" (ignore the "destructive operation" warning - it's safe)
```

### 5. Verify Integration  
```bash
# Test FastText integration
cd backend
node --import tsx/esm src/scripts/testFastTextIntegration.ts

# Test voting system endpoints
curl -X GET "http://localhost:3001/api/voting/leaderboard"
```

## API Endpoints

### FastText-Powered Analysis
```bash
# Real-time language detection
POST /api/live-analysis
{
  "text": "Hello, ¿cómo estás today?",
  "languages": ["English", "Spanish"],
  "includeDetails": true
}

# Example submission with manual tagging
POST /api/examples
{
  "text": "Je suis très busy today",
  "languages": ["French", "English"],
  "context": "Professional conversation",
  "manualTags": ["workplace", "code-switching"]
}

# Community voting on examples
POST /api/voting/examples/:id/vote
{
  "voteType": "accurate|inaccurate|helpful|unhelpful",
  "confidence": 4,
  "comment": "Clear language boundaries"
}
```

### Community Voting & Quality
```bash
GET /api/voting/examples/:id/stats       # Vote statistics and quality score
POST /api/voting/examples/:id/tags       # Submit manual language tags
GET /api/voting/examples/:id/tags        # Get manual tags for example
DELETE /api/voting/examples/:id/vote/:type # Remove user vote
GET /api/voting/leaderboard              # Community contribution rankings
GET /api/voting/users/:id/contributions  # User voting and tagging history
```

### Research Analytics
```bash
GET /api/dashboard/metrics        # Overall statistics
GET /api/dashboard/language-pairs # Language pair analysis  
GET /api/dashboard/platforms      # Platform distribution
GET /api/dashboard/regions        # Regional statistics
```

### Authentication & Access Control
```bash
POST /api/auth/login              # JWT authentication
POST /api/auth/register           # User registration
POST /api/research/apply          # Apply for researcher access
GET /api/admin/applications       # Admin: review applications
```

## Project Structure

```
CodeBoard/
├── backend/                           # Express.js API server
│   ├── src/
│   │   ├── services/
│   │   │   ├── fastTextService.ts        # FastText integration (primary)
│   │   │   ├── enhancedNlpService.ts     # ELD engine (fallback)
│   │   │   ├── votingService.ts          # Community voting and tagging
│   │   │   └── cacheService.ts           # Performance optimization
│   │   ├── routes/                       # API endpoints
│   │   │   ├── auth.ts                   # Authentication
│   │   │   ├── examples.ts               # Example management
│   │   │   ├── voting.ts                 # Community voting and quality
│   │   │   ├── dashboard.ts              # Analytics
│   │   │   └── admin.ts                  # Admin functions
│   │   ├── utils/
│   │   │   └── supabase.ts               # Supabase client
│   │   ├── scripts/
│   │   │   └── testFastTextIntegration.ts # FastText testing
│   │   └── app.ts                        # Main application
├── frontend/                            # Next.js React application
│   ├── app/                            # App Router pages
│   │   ├── dashboard/                   # Analytics dashboard
│   │   ├── admin/                       # Admin panel
│   │   └── research/                    # Research tools
│   ├── components/                     # UI components  
│   │   ├── ui/                         # Radix UI components
│   │   ├── tagging/                    # Manual tagging interface
│   │   └── voting/                     # Community voting panel
│   └── lib/                           # API client and utilities
└── README.md
```

## Performance Benchmarks

### FastText vs Traditional Methods

| Metric | Traditional | FastText | Benefit |
|--------|-------------|----------|---------|
| **Memory Usage** | 600MB+ | **~20MB** | **30x smaller** |
| **Speed** | ~10ms/text | **~1-5ms/text** | **2-10x faster** |
| **Languages** | 55 | **176+** | **3x more** |
| **Hosting Cost** | High | **Free tier** | **Optimal for budget** |
| **Reliability** | Variable | **Consistent** | **Production ready** |

### Real-World Test Results

**English-Spanish Code-Switching**
- Text: "Hello, ¿cómo estás today?"
- FastText: Detects 2 languages reliably
- Processing: <2ms with consistent performance

**Multi-Script (Hindi-English)**  
- Text: "नमस्ते, how are you?"
- FastText: Handles multi-script well
- Processing: <5ms with script preservation

**Community Verification & Quality System**
- **Vote Types**: Accurate/Inaccurate (language detection), Helpful/Unhelpful (research value)
- **Confidence Scoring**: 1-5 scale for vote confidence with user comments
- **Real-time Quality Metrics**: Automatic score calculation via database triggers
- **Verification Status**: Pending → Community Verified → Verified → Disputed
- **Manual Tagging**: User-contributed switch point annotations with segment details
- **Quality Thresholds**: Score ≥70% + 3+ votes = Verified; Score ≤30% = Disputed
- **Research-grade Corpus**: Community-verified data with transparent quality indicators

## Core Features

**Language Detection**
- 176+ language support with FastText
- Lightweight processing optimized for hosting constraints
- Real-time detection with automatic fallback to ELD
- Consistent performance across different text types

**Community Features**
- **Community Voting System**: 4 vote types (Accurate, Inaccurate, Helpful, Unhelpful) with confidence scoring
- **Manual Tagging Interface**: Interactive switch point editing for registered users
- **Quality Verification**: Real-time quality scoring and automatic verification status updates
- **User Contributions**: Points system for votes (1pt) and manual tags (5pts)
- **Leaderboard System**: Community rankings based on contribution activity
- **User-contributed Corrections**: Switch point annotations and language boundary refinement

**Research Tools**
- Role-based access (Community/Researcher/Admin tiers)
- Advanced analytics dashboard with data visualization
- CSV/JSON export functionality for research data
- Comprehensive filtering and search capabilities

**Production Ready**
- Supabase integration for scalable database management
- JWT authentication with OAuth providers (Google, GitHub)
- Comprehensive error handling and validation
- TypeScript strict mode compliance
- Optimized for free hosting tiers (<200MB memory)

## User Tiers

**Community Tier**
- Submit and explore code-switching examples
- Basic dashboard access
- **Community voting** on example accuracy and helpfulness (4 vote types)
- **Manual tagging** of language switch points with confidence scoring
- Participate in **quality verification** and earn contribution points

**Researcher Tier**  
- All Community features
- **Advanced analytics dashboard** with research-grade data visualization
- **Data export capabilities** (CSV/JSON) with quality filters
- Research application submission workflow
- Access to **quality metrics** and verification statistics

**Admin Tier**
- All Researcher features
- **User management** and research application review
- **System administration** tools and community moderation
- **Platform configuration** access and quality threshold management
- **Leaderboard management** and contribution monitoring

## Contributing

This platform follows modern development practices:
- TypeScript for type safety across the entire stack
- FastText for efficient language detection
- Supabase for modern database management
- Community-driven data verification
- Production-ready deployment configuration

---

*CodeBoard provides a modern, efficient platform for code-switching research with community-driven verification and optimized hosting costs.*
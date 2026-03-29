# HR Dashboard Documentation

## Overview
The HR Dashboard is a comprehensive human resource management system built with Next.js, providing real-time personnel management, performance tracking, onboarding, ID card generation, payroll management, and disciplinary actions.

---

## Table of Contents
1. [Dashboard Features](#dashboard-features)
2. [Module Documentation](#module-documentation)
3. [API Endpoints](#api-endpoints)
4. [Component Structure](#component-structure)
5. [Usage Guide](#usage-guide)

---

## Dashboard Features

### Main Dashboard (`/hr-dashboard`)
**Purpose**: Central hub for HR analytics and quick actions

**Key Features**:
- **Real-time Statistics**: Total staff count, role distribution (SM, BDM, BD, TL)
- **Performance Tracking**: Top performers with KPI achievement visualization
- **Recent Onboarding**: Table of recently added staff members
- **Quick Actions**: Direct access to onboarding, ID card generation, and payslips
- **6-Month Performance Chart**: Visual trend analysis using Chart.js
- **Dark/Light Mode**: Theme toggle support

**Data Sources**:
- Staff list from `/hr/get-staff-list`
- Performance data from `/hr/performance/{role}` endpoints

---

## Module Documentation

### 1. Staff Onboarding (`/hr-dashboard/onboarding`)

**Purpose**: Register and deploy new staff members across the organization

#### Features:
- **Role Selection**: Deploy as BD, BDM, SM, or TL
- **Regional Assignment**: Assign to specific regions and teams
- **Leadership Designation**: Mark as Team Lead or Regional Leader
- **Personal Information**: Complete bio-data collection
- **Financial Details**: Bank account information for payroll
- **Document Upload**: Passport photo and valid ID
- **Staff Directory**: Searchable table with pagination

#### Form Fields:
```javascript
{
  // Deployment Setup
  role: "bd" | "bdm" | "sm" | "tl",
  regionalId: String,        // Optional region assignment
  teamId: String,            // Optional team assignment
  isTeamLead: Boolean,
  isRegionalLeader: Boolean,
  
  // Personal Information
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  gender: "male" | "female",
  maritalStatus: String,
  dateOfBirth: String,
  address: String,
  localGovt: String,
  state: String,
  
  // Financial Details
  accountName: String,
  accountNumber: String,
  bankName: String,
  
  // Documents
  validId: String,
  passportPhoto: Base64/File,
  
  // Security
  password: String          // Optional, defaults to phone number
}
```

#### Staff Directory Features:
- **Search**: Filter by name, email, or phone
- **Pagination**: 10 items per page
- **Role Badges**: Color-coded role identification
- **Profile Preview**: Passport photo and ID card status

---

### 2. ID Card Generator (`/hr-dashboard/id-cards`)

**Purpose**: Generate, preview, and download official staff ID cards

#### Features:
- **Staff Search**: Real-time search across all staff members
- **Photo Upload**: Passport photo (pre-filled from staff profile or new upload)
- **Signature Upload**: Digital signature capture
- **Live Preview**: Real-time ID card rendering
- **Download Options**: 
  - PNG Image (high-resolution)
  - PDF Document (print-ready)
  - Direct Print

#### ID Card Layout:
```
┌─────────────────────────────────┐
│    KASUWAR ZAMANI LOGO          │
│   Official Staff Identity Card  │
├─────────────────────────────────┤
│         [PASSPORT PHOTO]        │
│                                 │
│           FULL NAME             │
│           ROLE TITLE            │
│                                 │
│  State: [STATE]    ID: [ID]     │
│                                 │
│  [SIGNATURE]      [QR CODE]     │
└─────────────────────────────────┘
```

#### Technical Implementation:
- **QR Code Generation**: Dynamic QR with staff details
- **html2canvas**: Screenshot rendering for download
- **jsPDF**: PDF generation with precise dimensions (85.6mm standard)
- **Print Styling**: Dedicated print layout

---

### 3. Payslip Management (`/hr-dashboard/payslips`)

**Purpose**: Generate and distribute monthly payslips via email

#### Features:
- **Staff Selection**: Choose individual or view all records
- **Period Selection**: Month and year
- **Earnings Breakdown**:
  - Base Earnings (₦)
  - Bonus/Extras (₦)
  - Deductions (₦)
- **Auto-Calculation**: Net pay computation
- **Email Dispatch**: Automatic email delivery to staff
- **History View**: Comprehensive payment logs

#### Payslip Generator Fields:
```javascript
{
  staffId: String,           // Required
  month: String,             // e.g., "January"
  year: Number,              // e.g., 2026
  amountEarned: Number,      // Base salary
  otherAmount: Number,       // Bonuses, allowances
  deductions: Number,        // Taxes, penalties
  comment: String            // Optional remarks
}
```

#### History Table Features:
- **Filtering**: View by individual staff or all records
- **Breakdown Display**: Base, Other, Deductions per record
- **Net Amount**: Highlighted in emerald green
- **Date Stamps**: Creation date for audit trail
- **Reference IDs**: Short transaction identifiers

---

### 4. Staff Performance (`/hr-dashboard/performance`)

**Purpose**: Monitor and analyze individual staff KPI achievements

#### Features:
- **Role Filtering**: View by SM, BDM, BD, TL, or All
- **Year Selection**: Historical performance data (2024-2027)
- **Search**: Filter by staff name or region
- **KPI Visualization**: Progress bars with color-coded achievement levels
- **Detailed Analytics Modal**:
  - Personnel profile
  - Monthly metrics breakdown
  - 12-month performance chart
  - Achievement trends

#### Performance Metrics:
```javascript
{
  staff: {
    firstName: String,
    lastName: String,
    role: String,
    region: String
  },
  yearlyPerformance: {
    january: { achievement: Number, metrics: Object },
    february: { achievement: Number, metrics: Object },
    // ... all months
  }
}
```

#### KPI Color Coding:
- **≥80%**: Emerald (Excellent)
- **≥60%**: Blue (Good)
- **≥40%**: Amber (Average)
- **<40%**: Rose (Needs Improvement)

#### Chart Features:
- **Bar Chart**: Monthly achievement distribution
- **Responsive Design**: Adapts to screen size
- **Interactive Tooltips**: Detailed values on hover
- **Trend Indicators**: Month-over-month comparison

---

### 5. Disciplinary Actions (`/hr-dashboard/disciplinary`)

**Purpose**: Issue warnings and track personnel conduct

#### Features:
- **Searchable Staff Selector**: Advanced dropdown with search
- **Action Types**:
  - 1st Warning (Amber)
  - 2nd Warning (Orange)
  - Suspension (Rose)
  - Termination (Red)
- **Severity Levels**: Low, Medium, High, Critical
- **Reason & Description**: Detailed documentation
- **Disciplinary Archive**: Complete history of all actions

#### Warning Payload:
```javascript
{
  staffId: String,
  reason: String,            // Short title
  description: String,       // Detailed explanation
  severity: "low" | "medium" | "high" | "critical",
  type: "1st Warning" | "2nd Warning" | "Suspension" | "Termination"
}
```

#### Archive Table Features:
- **Complete Logs**: All issued warnings across organization
- **Staff Details**: Name, role, contact
- **Action Badges**: Color-coded by type
- **Severity Indicators**: Visual priority markers
- **Date Tracking**: When action was issued
- **Status**: Active/Resolved state

---

## API Endpoints

### Base Configuration
```javascript
BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
```

### HR Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/hr/get-staff-list` | GET | Retrieve all staff members | None |
| `/hr/register-staff` | POST | Register new staff member | Staff object (see Onboarding) |
| `/hr/generate-id-card` | POST | Generate ID card with uploads | `FormData` with `userId`, `passportPhoto`, `signaturePhoto` |
| `/hr/payslip` | POST | Create and send payslip | `{ staffId, month, year, amountEarned, otherAmount, deductions, comment }` |
| `/hr/payslip/:staffId` | GET | Get payslips for specific staff | `staffId` (URL parameter) |
| `/hr/payslips` | GET | Get all payslips | None |
| `/hr/warning` | POST | Issue disciplinary warning | `{ staffId, reason, description, severity, type }` |
| `/hr/all-warnings` | GET | Get all disciplinary records | None |

### Performance Endpoints

| Endpoint | Method | Description | Query Parameters |
|----------|--------|-------------|------------------|
| `/hr/performance/bd` | GET | Get BD performance data | `year` (e.g., 2026) |
| `/hr/performance/bdm` | GET | Get BDM performance data | `year` |
| `/hr/performance/sm` | GET | Get SM performance data | `year` |
| `/hr/performance/tl` | GET | Get TL performance data | `year` |

### Regional Endpoints (Used in Onboarding)

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/admin/regional/zones` | GET | Get all regions/zones | None |
| `/admin/regional/zones/:zoneId/teams` | GET | Get teams in a zone | `zoneId` (URL parameter) |

---

## Component Structure

```
app/
└── hr-dashboard/
    ├── layout.jsx              # Main layout with sidebar & navbar
    ├── page.jsx                # Dashboard home
    ├── onboarding/
    │   └── page.jsx            # Staff registration & directory
    ├── id-cards/
    │   └── page.jsx            # ID card generator
    ├── payslips/
    │   └── page.jsx            # Payslip management
    ├── performance/
    │   └── page.jsx            # Performance analytics
    └── disciplinary/
        └── page.jsx            # Disciplinary actions

components/
└── hr-dashboard/
    └── Sidebar.jsx             # Navigation sidebar

configs/
└── api.jsx                     # API configuration & endpoints
```

---

## Usage Guide

### Getting Started

1. **Access the Dashboard**
   - Navigate to `/hr-dashboard`
   - Ensure you're authenticated as HR Administrator

2. **Quick Navigation**
   - Use the sidebar for module access
   - Dashboard provides quick action buttons

### Common Workflows

#### Onboard New Staff
1. Go to **Onboarding** module
2. Select deployment tier (BD/BDM/SM/TL)
3. Assign region and team (optional)
4. Fill personal and financial details
5. Upload passport photo (<50KB)
6. Submit → Staff appears in directory

#### Generate ID Card
1. Go to **ID Card Print** module
2. Search for staff member
3. Upload/confirm passport photo
4. Upload signature image
5. Click **Generate & Upload**
6. Download as PNG or PDF

#### Send Payslip
1. Go to **Manage Payslips** module
2. Select staff member
3. Enter earnings and deductions
4. Add optional comments
5. Click **Send Payslip**
6. View history in **History** tab

#### Review Performance
1. Go to **Staff Performance** module
2. Filter by role and year
3. Search for specific staff
4. Click **Detailed Report** for analytics modal
5. Review monthly charts and metrics

#### Issue Disciplinary Action
1. Go to **Disciplinary** module
2. Search and select staff member
3. Enter reason and description
4. Select severity level
5. Choose action type (1st Warning, 2nd Warning, etc.)
6. Click **Confirm & Issue**
7. View archive for historical records

---

## Technical Notes

### Authentication
- All API calls use `withCredentials: true` for session management
- Token-based authentication required for HR endpoints

### File Uploads
- Passport photos: Max 50KB, base64 encoding
- Signature images: Any size, base64 encoding
- ID card generation uses `FormData` for multipart uploads

### Responsive Design
- Mobile-first approach
- Sidebar collapses on mobile with hamburger menu
- Tables have horizontal scroll on small screens
- All modules are print-friendly where applicable

### State Management
- React hooks (`useState`, `useEffect`) for local state
- Axios for API calls
- Toast notifications for user feedback
- Chart.js for data visualization

### Performance Optimization
- Pagination in staff directory (10 items/page)
- Lazy loading for heavy libraries (html2canvas, jsPDF)
- Debounced search inputs
- Memoized chart components

---

## Support & Maintenance

### Error Handling
- Try-catch blocks on all async operations
- User-friendly toast notifications
- Console logging for debugging
- Fallback UI states for empty data

### Data Validation
- Required field checks
- Email format validation
- File size limits (passport <50KB)
- Numeric input validation for payslips

### Security Considerations
- Password defaults to phone number if not provided
- Sensitive data masked in UI
- Role-based access control (HR only)
- CSRF protection via credentials

---

**Version**: 1.0  
**Last Updated**: March 2026  
**Maintained By**: HR Development Team

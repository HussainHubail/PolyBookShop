# Dashboard Statistics Setup

## Overview
The dashboard now displays real-time statistics:

### For Admin/Librarian:
- **Total Books**: Count of all books in the system
- **Active Members**: Members with verified emails
- **Active Loans**: Ongoing and overdue loans
- **Completed Loans**: Returned loans

### For Members:
- **Active Loans**: Your current borrowed books
- **Total Borrowed**: All-time borrowing history
- **Unpaid Fines**: Outstanding fine amount
- **Active Holds**: Account holds preventing borrowing

## Adding Fake Members for Testing

To populate the dashboard with test data, run the seed script:

```bash
cd Backend
npx ts-node scripts/seed-fake-members.ts
```

This will create 5 fake members:
- **Login IDs**: MEM-ABC123, MEM-DEF456, MEM-GHI789, MEM-JKL012, MEM-MNO345
- **Password**: Member@123 (all members)
- **Status**: Active with verified emails

## API Endpoints

### GET /api/stats/dashboard
Returns overall system statistics (accessible by all authenticated users)

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalBooks": 15,
    "activeMembers": 6,
    "activeLoans": 3,
    "completedLoans": 8,
    "totalUnpaidFines": 5.50,
    "activeHolds": 1
  }
}
```

### GET /api/stats/member
Returns member-specific statistics (accessible by members only)

**Response:**
```json
{
  "success": true,
  "stats": {
    "activeLoans": 2,
    "totalBorrowed": 10,
    "unpaidFines": 3.50,
    "activeHolds": 0,
    "maxBorrowedBooks": 5
  }
}
```

## Features

- ✅ Real-time data fetching on dashboard load
- ✅ Loading state with spinner
- ✅ Different stats for members vs staff
- ✅ Automatic refresh on user change
- ✅ Error handling with fallback to zero values

## Notes

- Stats are fetched when the dashboard loads
- Member stats only appear for MEMBER account type
- All stats default to 0 if fetching fails
- The dashboard shows a loading spinner while fetching data

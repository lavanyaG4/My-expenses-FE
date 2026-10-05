# MyCash — Frontend Requirement Document

**Product:** MyCash  
**Version:** 1.0 — MVP  
**Status:** Draft for UI development  
**Frontend Type:** React-based expense tracker UI  
**Backend API:** Node.js + Express + MongoDB (from backend requirement)

---

## 1. Project Summary

MyCash is a personal expense tracker frontend that consumes the backend REST API for expense management and dashboard summary. The MVP focuses on a simple, responsive UI to create, list, update, delete expenses, and show summary totals.

The frontend should be built using basic modern web technologies and should remain easy to connect with the backend without major redesign.

---

## 2. Goal of the Frontend

The frontend should allow a user to:

- Add a new expense
- View all expenses
- View one expense by ID
- Edit an existing expense
- Delete an expense
- See dashboard summary data
- Handle loading, validation, and API error states

---

## 3. Basic Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React.js |
| Build Tool | Vite (recommended) |
| Styling | CSS / Tailwind CSS |
| HTTP Client | Axios |
| Icons | React Icons |
| State Handling | React State / Context (simple approach) |
| API Base URL | `http://localhost:8000` |

> The UI should remain lightweight and easily maintainable for the MVP.

---

## 4. Scope

### In Scope

- Expense create form
- Expense list view
- Expense edit/delete actions
- Dashboard totals section
- API integration with backend
- Loading and error handling
- Responsive layout

### Out of Scope

- Authentication
- Multi-user data isolation
- AI chat in this MVP
- Charts and advanced reports
- File upload or OCR
- Budget notifications

---

## 5. Core Functional Requirements

### 5.1 Expense Management

| ID | Requirement |
| --- | --- |
| FE-01 | The frontend shall allow the user to add a new expense. |
| FE-02 | The frontend shall display all expenses returned by the backend. |
| FE-03 | The frontend shall allow viewing one expense detail by ID. |
| FE-04 | The frontend shall allow editing an existing expense. |
| FE-05 | The frontend shall allow deleting an expense. |
| FE-06 | The frontend shall validate input before sending API requests. |

### 5.2 Dashboard Summary

| ID | Requirement |
| --- | --- |
| FE-07 | The frontend shall display total expenses amount. |
| FE-08 | The frontend shall display number of distinct categories. |
| FE-09 | The frontend shall display total number of transactions. |

### 5.3 Future AI Placeholder

AI chat is not required in the MVP. The UI can reserve a section for a future AI panel, but it should not block MVP delivery.

---

## 6. UI Requirements

### 6.1 Main Page Layout

The homepage should contain:

1. Header section with app name
2. Expense form card
3. Dashboard summary cards
4. Expense list section
5. Optional future AI assistant area

### 6.2 Form Fields

The expense form should include:

- Amount
- Category
- Description (optional)
- Expense date

### 6.3 Input Rules

- Amount must be a positive number
- Category is required
- Description is optional
- Expense date is required
- Empty/invalid fields should be blocked with friendly messages

---

## 7. API Integration Requirements

The frontend will connect to the backend using these APIs:

### Backend Endpoints to Consume

- `GET /expenses` → list all expenses
- `POST /expenses` → create expense
- `GET /expenses/:id` → get one expense
- `PUT /expenses/:id` → update expense
- `DELETE /expenses/:id` → delete expense
- `GET /dashboard/summary` → summary totals

### API Behavior Expectations

- Use JSON request/response format
- Show loading state while request is in progress
- Show success or error message after each action
- Handle not-found and validation errors properly

---

## 8. UI Components

Suggested component structure:

```text
src/
├── components/
│   ├── Header.jsx
│   ├── ExpenseForm.jsx
│   ├── ExpenseList.jsx
│   ├── DashboardSummary.jsx
│   └── Loader.jsx
├── pages/
│   └── HomePage.jsx
├── services/
│   └── api.js
├── styles/
│   └── global.css
└── App.jsx
```

---

## 9. Design Guidelines

### Visual Style

- Clean dashboard layout
- Soft gradient background
- White rounded cards
- Simple shadows
- Modern, minimal UI

### Suggested Colors

- Purple / blue / cyan gradient background
- Primary button in blue gradient
- Light grey background for cards

### Typography

- Poppins or Inter

---

## 10. Validation and Error Handling

### Validation

- Amount must be greater than 0
- Category cannot be empty
- Expense date must be valid
- Chat input is not required in MVP

### Error States

The UI should show user-friendly messages for:

- Server unavailable
- Validation failed
- Expense not found
- Request timeout
- Failed save/update/delete

Examples:

- "Expense added successfully"
- "Please enter a valid amount"
- "Unable to connect to server"

---

## 11. User Flow

```text
User opens the app
↓
User fills expense form
↓
User clicks Add Expense
↓
Frontend sends POST /expenses
↓
Backend saves expense in MongoDB
↓
Expense list refreshes
↓
User can edit or delete entries
↓
Dashboard summary updates automatically
```

---

## 12. Acceptance Criteria

The frontend MVP is ready when:

1. A user can create an expense from the form.
2. The list of expenses is displayed correctly.
3. A user can update an expense.
4. A user can delete an expense.
5. Dashboard totals are shown from the backend summary API.
6. Invalid inputs are blocked with validation messages.
7. The UI handles API errors gracefully.
8. The frontend is responsive and simple to maintain.

---

## 13. Future Enhancements

- AI chat assistant
- Monthly expense reports
- Charts and analytics
- Budget alerting
- Dark mode
- Receipt scanning
- CSV import/export
- Multi-currency support

---

## 14. Final Note

This frontend requirement is intentionally kept simple and aligned with the backend requirement. The current MVP focuses on a clean CRUD interface and dashboard summary display, while reserving AI and advanced reporting for a later phase.

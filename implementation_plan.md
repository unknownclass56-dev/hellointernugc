# Training Dashboard Simplification and Enhanced Certificate Flow

## Goal Description

Refactor the student dashboard to focus solely on the Training tab, remove Attendance, Online Lecture, and Assignments sections, enforce single enrollment per training, prevent duplicate assignment submissions, and introduce an admin assignment review workflow that gates certificate generation. Add certificate verification via mobile number, email, or certificate ID, and enable PDF download from the student training dashboard.

## User Review Required

> [!IMPORTANT]
> The proposed changes affect multiple routes and database tables:
> - `training_enrollments` constraint (unique on student_id + training_id)
> - `training_assignments` unique constraint on student_id + training_id (one submission per training)
> - New admin route/component for reviewing assignments
> - New certificate verification API endpoints
> Ensure these align with your backend architecture (Supabase) and that you are comfortable with schema migrations.

## Open Questions

> [!IMPORTANT]
> 1. **Enrollment Constraint**: Should the system simply block duplicate enrollments with an error message, or should the UI hide already enrolled trainings?
> 2. **Assignment Uniqueness**: Should re‑submission be completely blocked, or allow updates to the existing submission?
> 3. **Admin Review UI**: Do you want a new page under `/admin/training/assignments` listing pending assignments with a "Review" button that toggles status to `reviewed`?
> 4. **Certificate Generation Trigger**: After an admin marks an assignment as `reviewed`, should the certificate be auto‑generated or require the student to click a "Generate Certificate" button?
> 5. **Verification Methods**: Should all three methods (mobile, email, ID) be available simultaneously, or pick one as primary?
> 6. **PDF Generation**: Do you have a preferred PDF library (e.g., `@react-pdf/renderer`) or should we generate a static HTML-to-PDF using Supabase Functions?

## Proposed Changes

---
### Frontend

#### [MODIFY] [trainings.tsx](file:///c:/Users/rauna/Desktop/hellointernugc/src/routes/dashboard/student/trainings.tsx)
- Remove Nav items for `assignments` and `attendance` (lines 136‑140).
- Adjust `navItems` array to only include `learning` and `profile` (or keep `certificate` if still needed).
- Hide the `assignments` tab content and related UI elements (lines 462‑560).
- Add a check in enrollment fetch to filter out trainings where the student is already enrolled; prevent re‑enrollment UI.
- Update `submitAssignment` to check for existing assignment for the same training before allowing insert; show error toast.

#### [NEW] [adminAssignments.tsx](file:///c:/Users/rauna/Desktop/hellointernugc/src/routes/dashboard/admin/assignments.tsx)
- New admin page listing pending assignments (`status: submitted`).
- Button "Review" marks assignment status to `reviewed` via Supabase update.
- Once reviewed, automatically set related enrollment status to `completed` (or trigger certificate generation).

#### [NEW] [CertificateVerification.tsx](file:///c:/Users/rauna/Desktop/hellointernugc/src/components/CertificateVerification.tsx)
- Component with three input options: mobile number, email, certificate ID.
- Calls new API endpoints to validate and returns success/failure.

#### [MODIFY] [TrainingCertificate.tsx](file:///c:/Users/rauna/Desktop/hellointernugc/src/components/TrainingCertificate.tsx)
- Add "Download PDF" button that invokes `/api/certificate/pdf?id=...`.
- Show verification UI (maybe a modal) after generation.

---
### Backend (Supabase)

#### Schema Migrations
- **Enrollments**: Add unique composite index on (`student_id`, `training_id`).
- **Assignments**: Add unique composite index on (`student_id`, `training_id`).
- Update `training_assignments` table to include `status` enum (`submitted`, `reviewed`, `graded`).

#### New RPC Functions (SQL)
- `fn_can_enroll(student_id uuid, training_id uuid) RETURNS boolean` – checks existing enrollment.
- `fn_submit_assignment(...)` – wraps insert with duplicate check.
- `fn_review_assignment(assignment_id uuid)` – sets status to `reviewed` and, if all assignments for a training are reviewed, marks enrollment as `completed`.
- `fn_generate_certificate(enrollment_id uuid) RETURNS void` – creates a record in `certificates` table.
- `fn_verify_certificate_by_mobile(mobile text, cert_id uuid)`, `fn_verify_certificate_by_email(email text, cert_id uuid)`, `fn_verify_certificate_by_id(cert_id uuid)` – return boolean.

#### API Routes (Next.js / Vite integration)
- `/api/assignments/review` – POST with assignment_id.
- `/api/certificate/verify` – POST with method and identifier.
- `/api/certificate/pdf` – GET returns PDF blob.

---
### UI/UX Enhancements
- Use cohesive dark‑mode friendly palette (retain existing gradient colors).
- Add micro‑animations for button states (e.g., `hover:scale-105`).
- Ensure all new components have accessible focus states.
- Add toast notifications for success/error.

## Verification Plan

### Automated Tests
- Run existing unit tests and add new tests for:
  - Enrollment duplicate prevention.
  - Assignment duplicate prevention.
  - Admin review flow changes state correctly.
  - Certificate verification endpoints return expected results.

### Manual Verification
- Simulate a student enrolling in a training, attempt second enrollment – should show error.
- Submit an assignment, attempt second submission for same training – should be blocked.
- As admin, review assignment and confirm certificate becomes downloadable.
- Test verification via mobile, email, and ID.
- Verify PDF download renders correctly.

## Implementation Steps
- Update frontend files as described.
- Create new adminAssignments.tsx and CertificateVerification.tsx.
- Add PDF download button to TrainingCertificate.tsx.
- Write Supabase migration SQL scripts.
- Implement RPC functions and API routes.
- Add toast notifications and micro‑animations.
- Update tests and run verification.

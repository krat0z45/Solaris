# **App Name**: Solaris Manager

## Core Features:

- User Authentication: Secure user login and registration with Firebase Authentication, supporting 'admin' and 'manager' roles.
- Project Management: Create, read, update, and delete projects. Associate projects with clients and managers.
- Client Management: Manage client information, including name, contact details, email, and address, stored in Firestore.
- Weekly Progress Reports: Log weekly progress, milestones, and summaries for each project. Automatically determine the ISO week.
- Dynamic Milestone Checklist: Dynamically adjust the list of project milestones in each weekly report based on the type of project.
- PDF Report Generation: Generate professional PDF reports from the logged progress. These are basic, automatically generated reports.
- Role-Based Access Control: Implement role-based access control to restrict access to certain features based on the user's role.

## Style Guidelines:

- Primary color: Deep blue (#1E3A8A) to convey professionalism and reliability.
- Background color: Light gray (#F9FAFB) for a clean and modern look.
- Accent color: Teal (#0D9488) for highlights and calls to action.
- Body and headline font: 'Inter' sans-serif for a modern, neutral look.
- Use clean, line-based icons to represent different project types and actions.
- Employ a responsive, grid-based layout for optimal viewing on various devices.
- Use subtle transitions and animations to enhance user experience when navigating and submitting data.
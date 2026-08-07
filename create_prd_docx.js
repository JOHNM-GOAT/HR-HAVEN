const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType } = require('docx');

const artifactPath = 'C:\\Users\\micmi\\.gemini\\antigravity-ide\\brain\\3c9cbfcf-e348-473e-a6fc-781f2f1b533b\\AxionHR_Haven_PRD.docx';

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        // Document Header Title
        new Paragraph({
          text: "AxionHR Haven - Product Requirements Document (PRD)",
          heading: HeadingLevel.TITLE,
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Tagline: ", bold: true }),
            new TextRun({ text: "From Early Signs to a Safe Haven\n" }),
            new TextRun({ text: "Version: ", bold: true }),
            new TextRun({ text: "1.0.0 (Stage 1 Specification)\n" }),
            new TextRun({ text: "Status: ", bold: true }),
            new TextRun({ text: "Approved & Implemented\n" }),
            new TextRun({ text: "Target Platform: ", bold: true }),
            new TextRun({ text: "Next.js (TypeScript + Tailwind CSS Enterprise Application)\n" })
          ],
          spacing: { after: 300 }
        }),

        // 1. Executive Summary & Vision
        new Paragraph({ text: "1. Executive Summary & Vision", heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } }),
        new Paragraph({ text: "1.1 Product Vision", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({
          text: "AxionHR Haven is an AI-powered workplace well-being platform designed to prevent employee burnout and foster healthier work habits directly within daily workflows. By replacing infrequent, reactive surveys with continuous, privacy-first telemetry insights, proactive wellness tools, and personalized guidance, AxionHR Haven transforms workplace health management into an integrated, supportive ecosystem.",
          spacing: { after: 150 }
        }),
        new Paragraph({ text: "1.2 Core Value Proposition", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "• Proactive vs. Reactive: Detects early burnout telemetry (meeting density, overtime, late-night activity, consecutive workdays) before physical or mental exhaustion occurs.", spacing: { after: 80 } }),
        new Paragraph({ text: "• Privacy-First Anonymity: Protects individual employee identities through strict data aggregation boundaries for HR reporting.", spacing: { after: 80 } }),
        new Paragraph({ text: "• Cognitive Inclusivity: Provides adaptive focus modes, soundscapes, and typography tailored for diverse working styles, including neurodivergent employees.", spacing: { after: 80 } }),
        new Paragraph({ text: "• Daily Integration: Seamlessly embeds 1-tap mood check-ins, guided 2-minute micro-breaks, and peer appreciation into daily operations.", spacing: { after: 200 } }),

        // 2. Problem Statement & Market Opportunity
        new Paragraph({ text: "2. Problem Statement & Market Opportunity", heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } }),
        new Paragraph({ text: "2.1 The Problem", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "1. Ineffective Pulse Surveys: Quarterly or annual employee surveys suffer from low response rates (survey fatigue) and reflect past grievances rather than real-time well-being.", spacing: { after: 80 } }),
        new Paragraph({ text: "2. Burnout Epidemic: Over 65% of knowledge workers experience symptoms of burnout caused by back-to-back meeting schedules and after-hours communication creep.", spacing: { after: 80 } }),
        new Paragraph({ text: "3. Lack of Boundary Enforcement: Remote and hybrid work environments blur the lines between work and personal life, leading to chronic overworking.", spacing: { after: 80 } }),
        new Paragraph({ text: "4. One-Size-Fits-All Interfaces: Standard corporate software lacks accessibility options for neurodivergent employees, compounding daily cognitive fatigue.", spacing: { after: 150 } }),

        new Paragraph({ text: "2.2 Product Objectives & Success Metrics (OKRs)", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "• OKR 1: Reduce average employee Burnout Risk Scores across high-risk departments by 25% within 90 days of deployment.", spacing: { after: 80 } }),
        new Paragraph({ text: "• OKR 2: Achieve >85% daily engagement with 1-tap anonymous mood check-ins.", spacing: { after: 80 } }),
        new Paragraph({ text: "• OKR 3: Maintain 100% data privacy compliance (zero individual telemetry exposure to managers or HR).", spacing: { after: 80 } }),
        new Paragraph({ text: "• OKR 4: Encourage adoption of Work-Life Boundary Guards, aiming for >60% quiet-hour schedule activation.", spacing: { after: 200 } }),

        // 3. User Personas
        new Paragraph({ text: "3. User Personas", heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } }),
        new Paragraph({ text: "Persona 1: Alex Mercer (Overwhelmed Software Engineer)", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "Background: Senior Engineer managing complex deliverables with 24+ weekly meeting hours. Pain Points: Late-night Slack alerts, back-to-back syncs, eye strain. Goal: Automated help protecting quiet hours and guided quick stretch breaks.", spacing: { after: 120 } }),
        new Paragraph({ text: "Persona 2: Sarah Lin (People Operations / HR Director)", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "Background: Manages employee retention & culture across 500+ employees. Pain Points: Low survey engagement; lacks real-time insight into team burnout risk. Goal: Wants aggregated, anonymized department health heatmaps.", spacing: { after: 120 } }),
        new Paragraph({ text: "Persona 3: Marcus Vance (UX Designer - Neurodivergent User)", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "Background: Lead designer with ADHD who struggles with visual clutter and notification interruptions. Goal: Needs adaptive focus mode with soundscapes and dyslexia-friendly typography.", spacing: { after: 200 } }),

        // 4. Functional Requirements & Feature Specifications
        new Paragraph({ text: "4. Functional Requirements & Feature Specifications", heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } }),
        new Paragraph({ text: "Module 1: Authentication & Role-Based Access Control (RBAC)", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "• Dedicated enterprise login page with dark blue branding layout.", spacing: { after: 60 } }),
        new Paragraph({ text: "• Support for separate Employee Portal and HR Administrator Portal sign-in modes.", spacing: { after: 60 } }),
        new Paragraph({ text: "• Instant 1-tap demo quick-login buttons (Demo Employee View, Demo HR Admin View).", spacing: { after: 120 } }),

        new Paragraph({ text: "Module 2: Burnout Risk Engine & AI Predictive Analytics", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "• Burnout Risk Score Gauge (0–100): Calculates real-time risk scores based on meeting density, overtime, PTO usage, late messages, and consecutive workdays.", spacing: { after: 60 } }),
        new Paragraph({ text: "• Telemetry Trend Visualization: Recharts area chart comparing weekly meeting hours against late-night activity.", spacing: { after: 60 } }),
        new Paragraph({ text: "• AI Early Alerts: Automated risk factor breakdown with recommended corrective actions.", spacing: { after: 120 } }),

        new Paragraph({ text: "Module 3: Physical Health & Smart Micro-Breaks", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "• Hydration Tracker: Interactive 8-cup daily water intake logger.", spacing: { after: 60 } }),
        new Paragraph({ text: "• Calendar-Aware Reminders: Prompts for Hydration, 20-20-20 Eye Rest, Posture Stretch, and Walking Breaks that pause during active meetings.", spacing: { after: 60 } }),
        new Paragraph({ text: "• Guided 2-Minute Micro-Break Modal: Step-by-step interactive countdown timer with visual breathing & stretching routines.", spacing: { after: 120 } }),

        new Paragraph({ text: "Module 4: Mental Well-Being & AI Coach", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "• One-Tap Daily Mood Check-In: 5-point emoji selector (Thriving, Good, Okay, Stressed, Exhausted) with energy levels.", spacing: { after: 60 } }),
        new Paragraph({ text: "• Privacy Guarantee: Individual entries are confidential; data is aggregated anonymously for HR baseline reporting.", spacing: { after: 60 } }),
        new Paragraph({ text: "• AI Haven Wellness Coach: Conversational assistant tailored to workplace well-being.", spacing: { after: 120 } }),

        new Paragraph({ text: "Module 5: Work-Life Boundary Guard", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "• After-Hours Disconnect Shield: Holds non-urgent late notifications until morning (8:30 AM).", spacing: { after: 60 } }),
        new Paragraph({ text: "• Quiet Hours Scheduler: Configurable evening disconnect and morning end times.", spacing: { after: 120 } }),

        new Paragraph({ text: "Module 6: Social Connectivity & Peer Recognition Hub", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "• Appreciation Badges: Digital badges (Lifesaver, Focus Champion, Team Anchor, Positive Energy) with custom notes.", spacing: { after: 60 } }),
        new Paragraph({ text: "• Virtual Coffee Vouchers: Option to attach virtual coffee treats to peer awards.", spacing: { after: 60 } }),
        new Paragraph({ text: "• Confidential Teammate Check-In Suggestion: Discretely request an HR wellness check-in for an overworked colleague.", spacing: { after: 120 } }),

        new Paragraph({ text: "Module 7: Cognitive Inclusivity & Adaptive Focus Mode", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "• Dyslexia-Friendly Font Override: Toggles OpenDyslexic typography with optimized spacing.", spacing: { after: 60 } }),
        new Paragraph({ text: "• High-Contrast UI Mode: Enhances visual contrast ratios.", spacing: { after: 60 } }),
        new Paragraph({ text: "• Pomodoro Deep Focus Timer: 25-minute focus timer with ambient soundscapes (Rain, Lo-Fi, Waves, Forest).", spacing: { after: 120 } }),

        new Paragraph({ text: "Module 8: HR Executive Anonymized Heatmap", heading: HeadingLevel.HEADING_2, spacing: { before: 150, after: 100 } }),
        new Paragraph({ text: "• Department Heatmap: Displays risk levels across departments without showing individual employee identities.", spacing: { after: 60 } }),
        new Paragraph({ text: "• HR Interventions: One-click deployment of team-wide 'Focus Fridays' or extra leave days.", spacing: { after: 200 } }),

        // 5. Data Privacy, Security & Compliance
        new Paragraph({ text: "5. Data Privacy, Security & Compliance", heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } }),
        new Paragraph({ text: "1. Aggregation Thresholds: HR reports only display telemetry for departments with at least 5 employees.", spacing: { after: 80 } }),
        new Paragraph({ text: "2. Zero Content Monitoring: Message contents (Slack/Emails) are never read or stored; only metadata timestamps are evaluated.", spacing: { after: 80 } }),
        new Paragraph({ text: "3. Employee Ownership: Employees can view their complete individual telemetry dashboard; managers only see anonymized aggregate metrics.", spacing: { after: 80 } }),
        new Paragraph({ text: "4. Compliance Standards: Built to adhere to GDPR, CCPA, and HIPAA guidelines.", spacing: { after: 200 } }),

        // 6. Design System Specifications Table
        new Paragraph({ text: "6. UI/UX Design Specifications", heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Design Element", bold: true })] }),
                new TableCell({ children: [new Paragraph({ text: "Specification", bold: true })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Sidebar Background" })] }),
                new TableCell({ children: [new Paragraph({ text: "Deep Dark Blue #0b192e" })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Main Canvas" })] }),
                new TableCell({ children: [new Paragraph({ text: "Light Neutral Slate #f8fafc / bg-slate-100" })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Card Container" })] }),
                new TableCell({ children: [new Paragraph({ text: "White #ffffff with border border-slate-200" })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Primary Accent" })] }),
                new TableCell({ children: [new Paragraph({ text: "Bright Blue #2563eb" })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Typography" })] }),
                new TableCell({ children: [new Paragraph({ text: "Inter / OpenDyslexic (Accessible Fallback)" })] })
              ]
            })
          ],
          width: { size: 100, type: WidthType.PERCENTAGE }
        })
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(artifactPath, buffer);
  console.log('Successfully generated docx file at:', artifactPath);
}).catch(err => {
  console.error('Error generating docx:', err);
  process.exit(1);
});

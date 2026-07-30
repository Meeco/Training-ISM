import React, { useState, useMemo } from "react";
import meecoLogo from "./assets/images/meeco-logo.svg";

/* ---------- Types ---------- */
type ViewId = "welcome" | "m1" | "m2" | "m3" | "m4" | "m5" | "quiz";

interface PollOption {
  l: string;
  p: number;
}
interface Poll {
  q: string;
  opts: PollOption[];
}
interface Scenario {
  q: string;
  a: string;
}
interface Check {
  q: string;
  opts: string[];
  correct: number;
  exp: string;
}
interface ModuleWidgets {
  poll: Poll;
  scenario: Scenario;
  check: Check;
}

// type QuestionType = "mcq" | "scenario" | "short";
interface ChoiceQuestion {
  id: string;
  type: "mcq" | "scenario";
  cat: string;
  lo: string;
  q: string;
  opts: string[];
  correct: number;
  exp: string;
}
interface ShortQuestion {
  id: string;
  type: "short";
  cat: string;
  lo: string;
  q: string;
  model: string;
}
type Question = ChoiceQuestion | ShortQuestion;

interface NavItem {
  id: ViewId;
  num: string;
  label: string;
}
interface LearnerInfo {
  name: string;
  email: string;
  dept: string;
}

/* ---------- Theme ---------- */
// Meeco brand palette, dark variant. Accent is Meeco red (#E51E3C); the danger
// colour is shifted to a warm coral so it stays distinguishable from the accent.
const C = {
  bg: "#141013",
  panel: "#1e1a1c",
  p2: "#282326",
  bd: "#3a3436",
  tx: "#f7f5f5",
  mut: "#948b8d",
  ac: "#e51e3c",
  acbg: "rgba(229,30,60,0.14)",
  dg: "#ff8a6b",
  dgbg: "rgba(255,138,107,0.12)",
  ok: "#4ed18a",
  okbg: "rgba(78,209,138,0.12)",
  am: "#e8b23a",
};
const MONO = "'IBM Plex Mono', monospace";

const ORDER: ViewId[] = ["welcome", "m1", "m2", "m3", "m4", "m5", "quiz"];

/* ---------- Content data ---------- */
const WIDGETS: Record<Exclude<ViewId, "welcome" | "quiz">, ModuleWidgets> = {
  m1: {
    poll: {
      q: "In your team, when are security requirements usually defined?",
      opts: [
        { l: "During design / planning", p: 42 },
        { l: "During coding", p: 18 },
        { l: "During QA / testing", p: 12 },
        { l: "Rarely defined explicitly", p: 28 },
      ],
    },
    scenario: {
      q: "A developer builds GET /api/orders/{id}. It returns the order if the ID exists — it does not check the order belongs to the requester. What is the risk, is it design or implementation, and what should happen?",
      a: "Risk: Broken Access Control (IDOR). Any authenticated user can enumerate IDs and read other customers' orders. This is a design-level flaw — the access-control model never required an ownership check. What should happen: add a server-side authorization check (order.ownerId === session.userId), add a test for it, and treat any prior exposure as a potential privacy incident to report.",
    },
    check: {
      q: "Security requirements are best treated as:",
      opts: [
        "A document the security team owns",
        "Acceptance criteria defined alongside the feature",
        "Something added during QA",
        "Optional for internal tools",
      ],
      correct: 1,
      exp: "Security requirements belong with the feature's acceptance criteria so they're designed and tested from the start — not bolted on later.",
    },
  },
  m2: {
    poll: {
      q: "Which OWASP risk do you encounter most in your work?",
      opts: [
        { l: "Broken access control", p: 31 },
        { l: "Injection", p: 19 },
        { l: "Security misconfiguration", p: 27 },
        { l: "Vulnerable dependencies", p: 23 },
      ],
    },
    scenario: {
      q: 'Code review shows: query = "SELECT * FROM users WHERE email = \'" + userInput + "\'". The author says inputs are "validated on the frontend". What is the risk and what should happen?',
      a: "Risk: SQL injection. Frontend validation is trivially bypassed — the server must never trust client input. What should happen: rewrite using a parameterised query / prepared statement (placeholder + bound value), add server-side validation, and block the PR until fixed. Frontend checks are UX, not security.",
    },
    check: {
      q: "The most reliable defence against SQL injection is:",
      opts: [
        "Escaping quotes manually",
        "Frontend input validation",
        "Parameterised queries / prepared statements",
        "A web application firewall",
      ],
      correct: 2,
      exp: "Parameterised queries separate code from data so input can never alter the query structure. The others help but don't fix the root cause.",
    },
  },
  m3: {
    poll: {
      q: "Does your test/staging environment use real production data?",
      opts: [
        { l: "Yes, regularly", p: 22 },
        { l: "Sometimes", p: 34 },
        { l: "No, synthetic/masked only", p: 33 },
        { l: "Not sure", p: 11 },
      ],
    },
    scenario: {
      q: "To reproduce a bug, an engineer copies the production database (real customer emails, addresses) into the shared staging environment. What is the risk and what should happen?",
      a: 'Risk: a privacy breach. Production personal data now sits in a lower-controlled environment accessible to more people, with weaker monitoring — a disclosure even if "nothing happened". What should happen: use a masked/synthetic dataset instead, delete the copied data, and report it to ISMS as a potential privacy incident. Reproduce with anonymised data going forward.',
    },
    check: {
      q: "Under data minimisation you should:",
      opts: [
        "Collect everything in case it's useful later",
        "Collect and retain only what the purpose requires",
        "Keep all logs indefinitely for audits",
        "Store PII in plaintext for convenience",
      ],
      correct: 1,
      exp: "Data minimisation (an Australian Privacy Principle) means collecting and keeping only what the stated purpose needs, then deleting it when it's no longer required.",
    },
  },
  m4: {
    poll: {
      q: "Have you ever pasted code or data into a public AI tool?",
      opts: [
        { l: "Yes", p: 38 },
        { l: "No", p: 29 },
        { l: "Only non-sensitive content", p: 26 },
        { l: "Not sure", p: 7 },
      ],
    },
    scenario: {
      q: "A production bug throws an error containing a customer's email and a stack trace. To debug faster, an engineer pastes the whole error into a public AI chatbot. What is the risk and what is the safe alternative?",
      a: "Risk: sensitive-data leakage. Customer personal data and internal source paths are now in an unapproved third party, outside our control — a privacy and confidentiality incident. Safe alternative: use the approved enterprise AI tool, and strip/anonymise the customer data and secrets first. Report the leak to ISMS so it can be assessed.",
    },
    check: {
      q: "AI-generated code should be:",
      opts: [
        "Trusted if tests pass",
        "Shipped quickly to save time",
        "Reviewed, tested and security-checked like human code",
        "Exempt from code review",
      ],
      correct: 2,
      exp: "AI output is a suggestion, not a guarantee. It gets the same human review, testing and security review as any code — you remain accountable for what you commit.",
    },
  },
  m5: {
    poll: {
      q: "If you're unsure whether something is a security incident, you would:",
      opts: [
        { l: "Report it anyway", p: 54 },
        { l: "Investigate it first", p: 21 },
        { l: "Ask a colleague", p: 20 },
        { l: "Wait and see", p: 5 },
      ],
    },
    scenario: {
      q: "You notice a previous commit in a public repository contains a live cloud access key. What should you do — and not do?",
      a: "Do: report to ISMS immediately (Slack channel #incidents), and rotate/revoke the key. Note when you found it and preserve evidence (the commit, logs). Do NOT: quietly delete the commit and move on, investigate the blast radius yourself, or assume someone else has it handled. Early reporting matters more than certainty — even if it turns out the key was inactive.",
    },
    check: {
      q: "If you discover exposed credentials, your first step is to:",
      opts: [
        "Investigate how far the breach spread",
        "Delete the commit and say nothing",
        "Report to ISMS immediately and preserve evidence",
        "Wait until you're certain it's real",
      ],
      correct: 2,
      exp: "Report promptly and preserve evidence. You're not expected to run the investigation — early reporting lets the right people respond before damage spreads.",
    },
  },
};

const QUIZ: Question[] = [
  // MCQ (15)
  {
    id: "q1",
    type: "mcq",
    cat: "Secure Development",
    lo: "Recognise that security begins at design.",
    q: "When does secure development begin?",
    opts: [
      "During the final QA/testing phase",
      "During requirements and design",
      "After the first security incident",
      "Only for customer-facing features",
    ],
    correct: 1,
    exp: "Security is designed in from requirements onward, not added at the end. Design-stage decisions prevent the most serious flaws.",
  },
  {
    id: "q2",
    type: "mcq",
    cat: "Secure Development",
    lo: "Understand the purpose of threat modelling.",
    q: "The main purpose of threat modelling is to:",
    opts: [
      "Document code for auditors",
      "Identify what could go wrong early so you can design defences",
      "Replace penetration testing",
      "Satisfy a compliance checkbox",
    ],
    correct: 1,
    exp: 'Threat modelling asks "what can go wrong, who do we trust, what\'s the worst case?" early, so defences are designed rather than retrofitted.',
  },
  {
    id: "q3",
    type: "mcq",
    cat: "Secure Coding",
    lo: "Apply injection defences.",
    q: "Which approach best prevents SQL injection?",
    opts: [
      "Validating input only on the frontend",
      "Concatenating user input into the query string",
      "Using parameterised queries / prepared statements",
      "Removing single quotes from input",
    ],
    correct: 2,
    exp: "Parameterised queries keep data separate from query structure, so input cannot change the command. Frontend checks are bypassable.",
  },
  {
    id: "q4",
    type: "mcq",
    cat: "Secure Coding",
    lo: "Identify broken access control.",
    q: "An endpoint returns any record by ID without checking ownership. This is an example of:",
    opts: [
      "SQL injection",
      "Broken access control (IDOR)",
      "Cross-site scripting",
      "A misconfiguration only",
    ],
    correct: 1,
    exp: "Returning resources without verifying the requester owns them is Broken Access Control — specifically IDOR.",
  },
  {
    id: "q5",
    type: "mcq",
    cat: "Secure Coding",
    lo: "Configure secure sessions.",
    q: "Which set of cookie attributes best protects session tokens?",
    opts: [
      "No flags, for compatibility",
      "HttpOnly, Secure, SameSite",
      "Only Secure",
      "Only SameSite",
    ],
    correct: 1,
    exp: "HttpOnly blocks JS access, Secure forces HTTPS, SameSite mitigates CSRF. Rotate the session on login too.",
  },
  {
    id: "q6",
    type: "mcq",
    cat: "Secure Coding",
    lo: "Handle errors safely.",
    q: "What should a production API return when an unexpected error occurs?",
    opts: [
      "The full stack trace to the client",
      "A generic error to the client; log details server-side",
      "The SQL error verbatim",
      "Nothing at all",
    ],
    correct: 1,
    exp: "Detailed errors leak internals to attackers. Return a generic message to users and log full detail securely server-side.",
  },
  {
    id: "q7",
    type: "mcq",
    cat: "Privacy",
    lo: "Define personal information.",
    q: "Which of these is personal information under the Australian Privacy Principles?",
    opts: [
      "An aggregated, anonymised count",
      "A user's email address and IP address",
      "A randomly generated UUID with no link to a person",
      "A public API version number",
    ],
    correct: 1,
    exp: "Information about a reasonably identifiable individual — emails, IPs, device IDs — is personal information under the APPs.",
  },
  {
    id: "q8",
    type: "mcq",
    cat: "Privacy",
    lo: "Apply safe logging.",
    q: "Which is the safest logging practice?",
    opts: [
      "Log full request bodies for debugging",
      "Log passwords to trace login issues",
      "Log identifiers and outcomes; redact PII and secrets",
      "Log everything and delete it never",
    ],
    correct: 2,
    exp: "Log what you need to operate (IDs, outcomes) and keep PII, tokens and secrets out of logs entirely.",
  },
  {
    id: "q9",
    type: "mcq",
    cat: "AI Governance",
    lo: "Apply acceptable-use rules.",
    q: "Which AI tools may you use for work?",
    opts: [
      "Any tool that is free",
      "Approved/enterprise AI systems only",
      "Whatever your team prefers",
      "Any tool, as long as you're careful",
    ],
    correct: 1,
    exp: "Only approved systems. Unapproved tools have unknown data handling — never put company or customer data into them.",
  },
  {
    id: "q10",
    type: "mcq",
    cat: "AI Governance",
    lo: "Recognise prompt injection.",
    q: "Prompt injection is best described as:",
    opts: [
      "A bug in your IDE's autocomplete",
      "Malicious instructions hidden in content the model processes",
      "A way to speed up model responses",
      "A type of SQL injection",
    ],
    correct: 1,
    exp: "Prompt injection hides adversarial instructions in inputs/retrieved content to make the model ignore its rules. Treat model I/O as untrusted.",
  },
  {
    id: "q11",
    type: "mcq",
    cat: "AI Governance",
    lo: "Hold AI code to the same standard.",
    q: "AI-generated code should be held to:",
    opts: [
      "A lower bar, since AI wrote it",
      "The same standards as human-written code",
      "No review if it compiles",
      "Review only if it's customer-facing",
    ],
    correct: 1,
    exp: "AI code gets the same human review, testing and security review. You are accountable for what you commit.",
  },
  {
    id: "q12",
    type: "mcq",
    cat: "DevSecOps",
    lo: "Keep secrets out of code/CI.",
    q: "Where should production secrets live?",
    opts: [
      "Hard-coded in the repo for convenience",
      "In a secrets manager / injected at runtime",
      "In a committed .env file",
      "In CI logs so they're easy to find",
    ],
    correct: 1,
    exp: "Secrets belong in a managed secret store and are injected at runtime — never committed or printed to logs.",
  },
  {
    id: "q13",
    type: "mcq",
    cat: "DevSecOps",
    lo: "Relate Essential Eight to engineering.",
    q: "The ACSC Essential Eight strategy most directly relevant to dependency risk is:",
    opts: [
      "Daily backups only",
      "Patching applications and managing dependencies",
      "Disabling all macros",
      "Restricting admin to one person",
    ],
    correct: 1,
    exp: "Patching applications (and keeping dependencies current) is an Essential Eight strategy that engineers act on directly via updates and scanning.",
  },
  {
    id: "q14",
    type: "mcq",
    cat: "Incident Reporting",
    lo: "Prioritise early reporting.",
    q: "You're fairly sure — but not certain — that data was exposed. You should:",
    opts: [
      "Wait until you're 100% certain",
      "Report it promptly to ISMS anyway",
      "Quietly fix it and move on",
      "Ask on a public channel first",
    ],
    correct: 1,
    exp: "Early reporting beats certainty. Report promptly; you're not expected to confirm or investigate the incident yourself.",
  },
  {
    id: "q15",
    type: "mcq",
    cat: "Secure Coding",
    lo: "Validate input correctly.",
    q: "The most robust input validation strategy is:",
    opts: [
      "Blocklist known-bad characters",
      "Allowlist what is explicitly permitted",
      "Trust validated client input",
      "Validate length only",
    ],
    correct: 1,
    exp: "Allowlisting (accept only known-good) is far harder to bypass than trying to enumerate every bad input.",
  },
  // Scenario (10)
  {
    id: "q16",
    type: "scenario",
    cat: "Secure Development",
    lo: "Diagnose a design-level access flaw.",
    q: "A new microservice exposes /api/invoices/{id} and returns the invoice for any valid ID. There is no ownership check. The biggest problem is:",
    opts: [
      "Performance under load",
      "A design-level Broken Access Control flaw (IDOR)",
      "Missing input validation on the ID format",
      "Verbose logging",
    ],
    correct: 1,
    exp: "Without an ownership check, any user can read others' invoices. It's a design-level access-control failure, regardless of input validation.",
  },
  {
    id: "q17",
    type: "scenario",
    cat: "Secure Coding",
    lo: "Spot injection in review.",
    q: "A PR builds a query by string-concatenating a search term from the URL. The author validates it on the client. You should:",
    opts: [
      "Approve — client validation is enough",
      "Request parameterised queries and server-side validation before merge",
      "Approve if there's a WAF",
      "Add a comment but approve anyway",
    ],
    correct: 1,
    exp: "Client validation is bypassable. Block the merge until the query is parameterised and validated server-side.",
  },
  {
    id: "q18",
    type: "scenario",
    cat: "Secure Coding",
    lo: "Avoid logging secrets/PII.",
    q: 'During an outage someone adds log.info("login", {email, password}) to debug. The correct response is:',
    opts: [
      "Keep it — it's only temporary",
      "Remove it; log a userId and outcome instead, never credentials/PII",
      "Keep it but lower the log level",
      "Encrypt the log file and keep the line",
    ],
    correct: 1,
    exp: "Credentials and PII must never be logged. Log a non-sensitive identifier and the result, and remove the line.",
  },
  {
    id: "q19",
    type: "scenario",
    cat: "Privacy",
    lo: "Protect production data in non-prod.",
    q: "An engineer copies real production customer data into staging to reproduce a bug. This is:",
    opts: [
      "Fine — it's internal",
      "A privacy incident; use masked/synthetic data and report it",
      "Acceptable if deleted within a week",
      "Only a problem if staging is public",
    ],
    correct: 1,
    exp: "Personal data in a lower-controlled environment is a privacy breach. Use masked/synthetic data and report the copy to ISMS.",
  },
  {
    id: "q20",
    type: "scenario",
    cat: "Privacy",
    lo: "Audit third-party data flows.",
    q: "A new analytics SDK is found sending users' email addresses in event payloads. The right action is:",
    opts: [
      "Leave it — analytics needs it",
      "Stop sending PII, verify the data flow, and confirm an approved basis exists",
      "Hash the email and keep sending it without review",
      "Ignore it; the vendor is trusted",
    ],
    correct: 1,
    exp: "Sharing personal data with a third party needs an approved basis. Stop the leak, review what's sent, and treat it as a potential privacy incident.",
  },
  {
    id: "q21",
    type: "scenario",
    cat: "AI Governance",
    lo: "Prevent data leakage to AI tools.",
    q: "To debug faster, a teammate pastes a customer error containing personal data into a public AI chatbot. You should:",
    opts: [
      "Do the same — it's quicker",
      "Use the approved AI tool, strip the PII/secrets first, and report the leak",
      "Only do it for low-priority bugs",
      "Paste it but delete the chat afterwards",
    ],
    correct: 1,
    exp: "Pasting customer data into an unapproved tool is a data-leakage incident. Use approved tooling, anonymise first, and report it.",
  },
  {
    id: "q22",
    type: "scenario",
    cat: "AI Governance",
    lo: "Verify AI-suggested dependencies.",
    q: "An AI assistant suggests importing a package you've never heard of, and it isn't in your lockfile. You should:",
    opts: [
      "Install it — the AI is usually right",
      "Verify the package is real, trusted and needed before adding it (watch for hallucinated/slop-squatted names)",
      "Add it and fix problems later",
      "Disable dependency scanning to save time",
    ],
    correct: 1,
    exp: "AI can hallucinate package names that attackers register (slopsquatting). Verify legitimacy and necessity before adding any dependency.",
  },
  {
    id: "q23",
    type: "scenario",
    cat: "DevSecOps",
    lo: "Handle hardcoded secrets.",
    q: "A scanner flags an API key hard-coded in a committed config file. The right response is:",
    opts: [
      "Add it to .gitignore and leave the key",
      "Rotate the key, move it to the secrets manager, and report the exposure",
      "Delete the file from the latest commit only",
      "Nothing — it's an internal repo",
    ],
    correct: 1,
    exp: "A committed secret is exposed in history. Rotate it, move it to managed secrets, and report it — removing the file alone doesn't undo exposure.",
  },
  {
    id: "q24",
    type: "scenario",
    cat: "Incident Reporting",
    lo: "Respond to exposed credentials.",
    q: "You find a live cloud key in a public repo's commit history. Your first move is:",
    opts: [
      "Investigate how much was accessed",
      "Report to ISMS immediately and rotate the key, preserving evidence",
      "Quietly delete the commit",
      "Wait to see if anything bad happens",
    ],
    correct: 1,
    exp: "Report promptly and revoke the key while preserving evidence. You're not expected to run the investigation yourself.",
  },
  {
    id: "q25",
    type: "scenario",
    cat: "Secure Development",
    lo: "Make risk-based security decisions.",
    q: "You're deciding how much security effort a feature needs. The best basis is:",
    opts: [
      "The same maximum effort for everything",
      "The risk: data sensitivity, exposure and impact",
      "Whatever the deadline allows",
      "Only what the linter enforces",
    ],
    correct: 1,
    exp: "Risk-based decisions scale effort to impact — a payments endpoint warrants more than an internal read-only dashboard. Document the trade-off.",
  },
  // Short answer (5)
  {
    id: "q26",
    type: "short",
    cat: "Privacy",
    lo: "Define personal information in context.",
    q: 'In your own words, what is "personal information", and give two examples you might handle in your work.',
    model:
      "Personal information is any information about an identified or reasonably identifiable individual. Examples relevant to engineering: a user's email address, IP/device identifier, name, location, or support-ticket contents. Combinations of fields that re-identify someone also count.",
  },
  {
    id: "q27",
    type: "short",
    cat: "Secure Coding",
    lo: "Recall OWASP risks and mitigations.",
    q: "Name two OWASP Top 10 risks and one mitigation for each.",
    model:
      "Examples: (1) Injection → use parameterised queries and server-side allowlist validation. (2) Broken Access Control → enforce server-side ownership/role checks on every request. Others: insecure session management → HttpOnly/Secure/SameSite cookies; vulnerable dependencies → scan and patch.",
  },
  {
    id: "q28",
    type: "short",
    cat: "AI Governance",
    lo: "State the rules for AI + customer data.",
    q: "What are the rules for using customer data with AI tools at Meeco?",
    model:
      "Use approved/enterprise AI systems only. Never paste customer/personal data, confidential information, secrets, or proprietary source code into unapproved or public tools. Anonymise or strip sensitive data before using any AI tool, respect data classification, and report any accidental exposure to ISMS.",
  },
  {
    id: "q29",
    type: "short",
    cat: "Incident Reporting",
    lo: "Describe the reporting process.",
    q: "Describe the steps you would take if you suspected a security or privacy incident.",
    model:
      "Report promptly to ISMS via Slack (#incidents) and notify your Tech Lead/Manager; don't wait for certainty. Preserve evidence (don't delete logs/commits, note the time, capture screenshots). Rotate exposed secrets but still report. Don't investigate independently or broadcast details publicly.",
  },
  {
    id: "q30",
    type: "short",
    cat: "Secure Development",
    lo: "Explain and apply data minimisation.",
    q: "Explain data minimisation and give one concrete way you apply it in your work.",
    model:
      'Data minimisation means collecting and retaining only the personal data the purpose actually requires, and deleting it when no longer needed. Applied examples: don\'t store fields "just in case"; mask/anonymise data in test environments; keep PII out of logs; set retention TTLs on exports and logs.',
  },
];

const OVERVIEW = [
  {
    num: "01",
    title: "Security Responsibilities",
    desc: "Security-by-design, threat modelling, risk-based decisions",
  },
  {
    num: "02",
    title: "Secure Coding & OWASP",
    desc: "Injection, access control, sessions, logging, validation",
  },
  {
    num: "03",
    title: "Privacy & Personal Information",
    desc: "APPs, data minimisation, logs, test data, third parties",
  },
  {
    num: "04",
    title: "AI Usage & Governance",
    desc: "Approved tools, AI risks, reviewing AI code, secure AI development",
  },
  {
    num: "05",
    title: "Incident Reporting",
    desc: "What to report, how to escalate, preserving evidence",
  },
];

const OWASP = [
  { id: "A01", name: "Broken Access Control" },
  { id: "A02", name: "Cryptographic Failures" },
  { id: "A03", name: "Injection" },
  { id: "A04", name: "Insecure Design" },
  { id: "A05", name: "Security Misconfiguration" },
  { id: "A06", name: "Vulnerable Components" },
  { id: "A07", name: "Auth Failures" },
  { id: "A08", name: "Integrity Failures" },
  { id: "A09", name: "Logging & Monitoring Failures" },
  { id: "A10", name: "Server-Side Request Forgery" },
];

const SNIPPETS = [
  {
    title: "Injection",
    tag: "A03",
    bad: 'q = "SELECT * FROM users\n  WHERE email = \'"\n  + input + "\'"',
    good: 'q = "SELECT * FROM users\n  WHERE email = ?"\ndb.execute(q, [input])',
    note: "Parameterised queries keep user input as data, never as part of the command.",
  },
  {
    title: "Broken Access Control",
    tag: "A01",
    bad: 'if (req.body.role ===\n    "admin") grant()',
    good: 'role = roleFor(\n  session.userId)\nif (role === "admin")\n  grant()',
    note: "Never trust a role sent by the client. Resolve authority from the server-side session.",
  },
  {
    title: "Secure Logging",
    tag: "A09",
    bad: 'log.info("login",\n  {email, password})',
    good: 'log.info("login", {\n  userId, result:"ok"\n}) // no PII/secrets',
    note: "Log identifiers and outcomes. Keep credentials and personal data out of logs entirely.",
  },
  {
    title: "Error Handling",
    tag: "A05",
    bad: "res.send(err.stack)",
    good: 'log.error(err)\nres.status(500)\n  .send("Server error")',
    note: "Return a generic message to users; log full detail securely on the server.",
  },
];

const AI_RISKS = [
  {
    name: "Hallucinations",
    desc: "Confident, wrong output — incl. fake APIs/packages.",
  },
  {
    name: "Prompt injection",
    desc: "Hidden instructions hijack the model's behaviour.",
  },
  {
    name: "Sensitive data leakage",
    desc: "Data in prompts can be retained or exposed.",
  },
  {
    name: "Data poisoning",
    desc: "Tainted training/RAG data corrupts results.",
  },
  {
    name: "Model abuse",
    desc: "Misuse to generate harmful or unauthorised output.",
  },
  {
    name: "Copyright concerns",
    desc: "Generated code may carry licence/IP risk.",
  },
  {
    name: "Untrusted outputs",
    desc: "Never execute model output without validation.",
  },
];

const HEADS: Record<ViewId, { kicker: string; title: string; desc: string }> = {
  welcome: {
    kicker: "INFORMATION SECURITY AWARENESS",
    title: "Software Development Security Essentials",
    desc: "Engineering-specific security training for ISO 27001 readiness and our enterprise AI rollout. This training will take approximately 30–45 minutes, ending in a mandatory assessment.",
  },
  m1: {
    kicker: "MODULE 01",
    title: "Security Responsibilities in Software Development",
    desc: "Where security really starts, and why every engineer owns it.",
  },
  m2: {
    kicker: "MODULE 02",
    title: "Secure Coding & OWASP Risks",
    desc: "The vulnerabilities you'll actually meet — and the secure patterns that close them.",
  },
  m3: {
    kicker: "MODULE 03",
    title: "Privacy & Personal Information",
    desc: "Handling personal data responsibly under the Australian Privacy Principles.",
  },
  m4: {
    kicker: "MODULE 04",
    title: "Corporate AI Usage & AI Governance",
    desc: "Using enterprise AI safely, and building AI features securely. Critical module.",
  },
  m5: {
    kicker: "MODULE 05",
    title: "Incident Reporting & Escalation",
    desc: "How to recognise, report and escalate security, privacy and AI incidents.",
  },
  quiz: {
    kicker: "FINAL ASSESSMENT",
    title: "Knowledge Assessment",
    desc: "30 questions across all five modules. Pass mark 80%. Your result is recorded for the ISMS audit trail.",
  },
};

const NAV: NavItem[] = [
  { id: "welcome", num: "00", label: "Welcome" },
  { id: "m1", num: "01", label: "Security Responsibilities" },
  { id: "m2", num: "02", label: "Secure Coding & OWASP" },
  { id: "m3", num: "03", label: "Privacy & Personal Info" },
  { id: "m4", num: "04", label: "AI Usage & Governance" },
  { id: "m5", num: "05", label: "Incident Reporting" },
  { id: "quiz", num: "✓", label: "Final Assessment" },
];

/* ---------- Small presentational components ---------- */

const Card: React.FC<React.PropsWithChildren<{ style?: React.CSSProperties }>> = ({
  style,
  children,
}) => (
  <div
    style={{
      background: C.panel,
      border: `1px solid ${C.bd}`,
      borderRadius: 10,
      padding: "18px 20px",
      ...style,
    }}
  >
    {children}
  </div>
);

const Callout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div
    style={{
      background: C.p2,
      borderLeft: `3px solid ${C.ac}`,
      borderRadius: 6,
      padding: "14px 18px",
      fontSize: 14,
      lineHeight: 1.55,
    }}
  >
    <strong style={{ color: C.ac }}>In your daily work: </strong>
    {children}
  </div>
);

const PollWidget: React.FC<{ poll: Poll }> = ({ poll }) => {
  const [sel, setSel] = useState<number | undefined>(undefined);
  const answered = sel !== undefined;
  return (
    <Card style={{ padding: "20px 22px", marginBottom: 16 }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: C.ac,
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        ◉ AUDIENCE POLL
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>{poll.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {poll.opts.map((o, i) => {
          const mine = sel === i;
          if (!answered) {
            return (
              <button
                key={i}
                onClick={() => setSel(i)}
                style={{
                  textAlign: "left",
                  background: C.p2,
                  border: `1px solid ${C.bd}`,
                  borderRadius: 8,
                  padding: "11px 14px",
                  color: C.tx,
                  fontSize: 13.5,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {o.l}
              </button>
            );
          }
          return (
            <div
              key={i}
              style={{
                position: "relative",
                background: C.p2,
                border: `1px solid ${mine ? C.ac : C.bd}`,
                borderRadius: 8,
                padding: "11px 14px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${o.p}%`,
                  background: mine ? C.acbg : "rgba(148,139,141,0.14)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13.5,
                }}
              >
                <span>
                  {o.l}
                  {mine && <span style={{ color: C.ac, marginLeft: 8 }}>✓ you</span>}
                </span>
                <span style={{ fontFamily: MONO, color: C.mut }}>{o.p}%</span>
              </div>
            </div>
          );
        })}
      </div>
      {answered && (
        <div style={{ fontSize: 12, color: C.mut, marginTop: 12 }}>
          Anonymous poll — no single right answer. Compare your instinct with the room and discuss.
        </div>
      )}
    </Card>
  );
};

const ScenarioWidget: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ padding: "20px 22px", marginBottom: 16 }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: C.am,
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        ⚡ SCENARIO EXERCISE
      </div>
      <div
        style={{
          fontSize: 14.5,
          lineHeight: 1.55,
          marginBottom: 14,
          color: C.tx,
        }}
      >
        {scenario.q}
      </div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: open ? "transparent" : C.ac,
          color: open ? C.ac : C.bg,
          border: `1px solid ${C.ac}`,
          borderRadius: 7,
          padding: "9px 16px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {open ? "Hide analysis" : "Reveal analysis"}
      </button>
      {open && (
        <div
          style={{
            marginTop: 14,
            background: C.p2,
            borderLeft: `3px solid ${C.ac}`,
            borderRadius: 6,
            padding: "14px 16px",
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "#d9d0d1",
          }}
        >
          {scenario.a}
        </div>
      )}
    </Card>
  );
};

const CheckWidget: React.FC<{ check: Check }> = ({ check }) => {
  const [sel, setSel] = useState<number | undefined>(undefined);
  const answered = sel !== undefined;
  return (
    <Card style={{ padding: "20px 22px" }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: C.ac,
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        ✓ KNOWLEDGE CHECK
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>{check.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {check.opts.map((o, i) => {
          const isC = i === check.correct,
            mine = sel === i;
          let bd = C.bd,
            bg = C.p2,
            icon: React.ReactNode = null;
          if (answered) {
            if (isC) {
              bd = C.ok;
              bg = C.okbg;
              icon = <span style={{ color: C.ok }}>✓</span>;
            } else if (mine) {
              bd = C.dg;
              bg = C.dgbg;
              icon = <span style={{ color: C.dg }}>✗</span>;
            }
          }
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setSel(i)}
              style={{
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                background: bg,
                border: `1px solid ${bd}`,
                borderRadius: 8,
                padding: "11px 14px",
                color: C.tx,
                fontSize: 13.5,
                cursor: answered ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <span>{o}</span>
              {icon}
            </button>
          );
        })}
      </div>
      {answered && (
        <div
          style={{
            marginTop: 12,
            fontSize: 13,
            lineHeight: 1.55,
            color: sel === check.correct ? C.ok : "#d9d0d1",
          }}
        >
          <strong>{sel === check.correct ? "Correct. " : "Not quite. "}</strong>
          {check.exp}
        </div>
      )}
    </Card>
  );
};

const ModuleInteractive: React.FC<{
  view: Exclude<ViewId, "welcome" | "quiz">;
}> = ({ view }) => {
  const wd = WIDGETS[view];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        marginTop: 30,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: C.mut,
          letterSpacing: 1,
        }}
      >
        INTERACTIVE — DISCUSS, EXPLORE, CHECK
      </div>
      <PollWidget poll={wd.poll} />
      <ScenarioWidget scenario={wd.scenario} />
      <CheckWidget check={wd.check} />
    </div>
  );
};

/* ---------- Module bodies ---------- */

const Welcome: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 14,
        marginBottom: 28,
      }}
    >
      {[
        ["5", "Focused modules"],
        ["30", "Assessment questions"],
        ["80%", "Pass mark"],
      ].map(([n, l]) => (
        <div
          key={l}
          style={{
            background: C.panel,
            border: `1px solid ${C.bd}`,
            borderRadius: 10,
            padding: 18,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              color: C.ac,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {n}
          </div>
          <div style={{ color: C.mut, fontSize: 13, marginTop: 4 }}>{l}</div>
        </div>
      ))}
    </div>
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.bd}`,
        borderRadius: 12,
        padding: "26px 28px",
        marginBottom: 24,
      }}
    >
      <h3 style={{ margin: "0 0 14px", fontSize: 17 }}>What this training covers</h3>
      <p
        style={{
          color: C.mut,
          fontSize: 14,
          lineHeight: 1.6,
          margin: "0 0 16px",
        }}
      >
        This is engineering-specific training required as part of our ISO 27001 compliance. A key
        focus of this session is the rollout of enterprise AI tooling. More specifically, the
        security decisions you make in your daily work, including (but not limited to) designing,
        coding, handling data, using AI, and reporting incidents.
      </p>
      <div
        style={{
          background: C.p2,
          borderLeft: `3px solid ${C.am}`,
          borderRadius: 6,
          padding: "12px 16px",
          fontSize: 13.5,
          color: "#d9d0d1",
          lineHeight: 1.55,
        }}
      >
        This does not replace general cyber-awareness training (phishing, passwords, social
        engineering, malware) - you will receive training on this separately.
      </div>
    </div>
    <h3
      style={{
        margin: "0 0 14px",
        fontSize: 16,
        color: C.mut,
        fontFamily: MONO,
        letterSpacing: 1,
      }}
    >
      MODULE OVERVIEW
    </h3>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginBottom: 32,
      }}
    >
      {OVERVIEW.map((o) => (
        <div
          key={o.num}
          style={{
            display: "flex",
            gap: 16,
            background: C.panel,
            border: `1px solid ${C.bd}`,
            borderRadius: 10,
            padding: "16px 18px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              color: C.ac,
              fontSize: 15,
              fontWeight: 600,
              flex: "0 0 28px",
            }}
          >
            {o.num}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14.5 }}>{o.title}</div>
            <div style={{ color: C.mut, fontSize: 13, marginTop: 2 }}>{o.desc}</div>
          </div>
        </div>
      ))}
    </div>
    <button
      onClick={onStart}
      style={{
        background: C.ac,
        color: C.bg,
        border: "none",
        borderRadius: 8,
        padding: "14px 26px",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      Begin Module 01 →
    </button>
  </div>
);

const KeyMessage: React.FC<{
  label: string;
  children: React.ReactNode;
  tone?: "accent" | "amber";
}> = ({ label, children, tone = "accent" }) => {
  const bg =
    tone === "accent"
      ? "linear-gradient(135deg,#3a121c,#220c11)"
      : "linear-gradient(135deg,#33240e,#241a0c)";
  const border = tone === "accent" ? "#5e1826" : "#5a4419";
  const color = tone === "accent" ? C.ac : C.am;
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: "22px 26px",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: 1.5,
          color,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.4 }}>{children}</div>
    </div>
  );
};

const Module1: React.FC = () => (
  <div>
    <KeyMessage label="Key Message">
      Security is not a final testing activity. It begins during design.
    </KeyMessage>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        marginBottom: 26,
      }}
    >
      {[
        [
          "Security is everyone's responsibility",
          "Not a gate owned by one team. Every PR, config and dependency is a security decision.",
        ],
        [
          "Security-by-Design",
          "Safe defaults, least privilege, fail closed. The secure path should be the easy path (ACSC Secure-by-Design).",
        ],
        [
          "Security requirements",
          "Write them as acceptance criteria: authZ, validation, logging, data handling — sized to risk.",
        ],
        [
          "Threat modelling",
          'Ask "what can go wrong?" early. Who/what are we trusting? What\'s the worst case if this input is hostile?',
        ],
        [
          "Risk-based decisions",
          "Effort scales with impact. An internal dashboard ≠ a payments endpoint. Document the trade-off.",
        ],
        [
          "Secure development lifecycle",
          "Security threads through design → code → review → test → deploy → operate, not bolted on at the end.",
        ],
      ].map(([t, d]) => (
        <div
          key={t}
          style={{
            background: C.panel,
            border: `1px solid ${C.bd}`,
            borderRadius: 10,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              color: C.ac,
              fontWeight: 600,
              marginBottom: 6,
              fontSize: 14.5,
            }}
          >
            {t}
          </div>
          <div style={{ color: C.mut, fontSize: 13.5, lineHeight: 1.55 }}>{d}</div>
        </div>
      ))}
    </div>
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.bd}`,
        borderRadius: 10,
        padding: "20px 22px",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: C.am,
          letterSpacing: 1,
          marginBottom: 14,
        }}
      >
        REAL-WORLD EXAMPLES
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.p2, borderRadius: 8, padding: 16 }}>
          <div
            style={{
              fontSize: 12,
              color: "#f0883e",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            CAUSED BY A DESIGN DECISION
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#d9d0d1" }}>
            An API returns a record by ID with no ownership check. Any user can enumerate IDs and
            read others' data (IDOR). The flaw is the access-control model, not a typo.
          </div>
        </div>
        <div style={{ background: C.p2, borderRadius: 8, padding: 16 }}>
          <div
            style={{
              fontSize: 12,
              color: "#f0883e",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            CAUSED BY AN IMPLEMENTATION DECISION
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#d9d0d1" }}>
            The design required server-side authZ, but one new endpoint shipped without the check
            copied in. Correct design, incorrect implementation.
          </div>
        </div>
      </div>
    </div>
    <Callout>
      before coding a feature, spend two minutes asking "who could misuse this, and what data could
      leak?" That habit prevents most design-level flaws.
    </Callout>
  </div>
);

const Module2: React.FC = () => (
  <div>
    <h3
      style={{
        margin: "0 0 12px",
        fontSize: 15,
        color: C.mut,
        fontFamily: MONO,
        letterSpacing: 1,
      }}
    >
      OWASP TOP 10 — AT A GLANCE
    </h3>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,1fr)",
        gap: 8,
        marginBottom: 26,
      }}
    >
      {OWASP.map((o) => (
        <div
          key={o.id}
          style={{
            display: "flex",
            gap: 12,
            background: C.panel,
            border: `1px solid ${C.bd}`,
            borderRadius: 8,
            padding: "11px 14px",
            alignItems: "center",
            fontSize: 13.5,
          }}
        >
          <span style={{ fontFamily: MONO, color: C.ac, fontSize: 12 }}>{o.id}</span>
          <span>{o.name}</span>
        </div>
      ))}
    </div>
    <h3
      style={{
        margin: "0 0 14px",
        fontSize: 15,
        color: C.mut,
        fontFamily: MONO,
        letterSpacing: 1,
      }}
    >
      VULNERABLE vs SECURE
    </h3>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        marginBottom: 24,
      }}
    >
      {SNIPPETS.map((s) => (
        <div
          key={s.title}
          style={{
            background: C.panel,
            border: `1px solid ${C.bd}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 18px",
              borderBottom: `1px solid ${C.bd}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.mut }}>{s.tag}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div
              style={{
                padding: "14px 16px",
                borderRight: `1px solid ${C.bd}`,
                background: "rgba(255,138,107,0.06)",
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  color: C.dg,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                ✕ VULNERABLE
              </div>
              <pre
                style={{
                  margin: 0,
                  fontFamily: MONO,
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: C.tx,
                  whiteSpace: "pre-wrap",
                }}
              >
                {s.bad}
              </pre>
            </div>
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(78,209,138,0.06)",
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  color: C.ok,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                ✓ SECURE
              </div>
              <pre
                style={{
                  margin: 0,
                  fontFamily: MONO,
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: C.tx,
                  whiteSpace: "pre-wrap",
                }}
              >
                {s.good}
              </pre>
            </div>
          </div>
          <div
            style={{
              padding: "11px 18px",
              borderTop: `1px solid ${C.bd}`,
              fontSize: 13,
              color: C.mut,
              lineHeight: 1.5,
            }}
          >
            {s.note}
          </div>
        </div>
      ))}
    </div>
    <Callout>
      validate input on the server with an allowlist, parameterise every query, set cookie flags,
      and never return raw stack traces to users. These few habits close most OWASP categories.
    </Callout>
  </div>
);

const Module3: React.FC = () => (
  <div>
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.bd}`,
        borderRadius: 10,
        padding: "20px 22px",
        marginBottom: 22,
      }}
    >
      <div style={{ color: C.ac, fontWeight: 600, marginBottom: 8 }}>
        What is personal information?
      </div>
      <p
        style={{
          color: "#d9d0d1",
          fontSize: 14,
          lineHeight: 1.6,
          margin: "0 0 12px",
        }}
      >
        Any information about an identified individual, or one who is reasonably identifiable —
        names, emails, IPs, device IDs, location, and combinations that re-identify someone. Meeco
        is Australian-based and processes personal information of customers, users, employees and
        partners globally.
      </p>
      <p style={{ color: C.mut, fontSize: 13, lineHeight: 1.55, margin: 0 }}>
        The <strong>Australian Privacy Principles (APPs)</strong>, regulated by the OAIC
        (oaic.gov.au), govern how we collect, use, store and disclose it. Build to{" "}
        <strong>Privacy by Design</strong>: privacy as a default, not an afterthought.
      </p>
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        marginBottom: 22,
      }}
    >
      {[
        [
          "Data minimisation",
          'Collect and keep only what the purpose needs. Don\'t store a field "just in case".',
        ],
        ["Purpose limitation", "Use data only for what it was collected for. New use = new basis."],
        [
          "Data retention",
          "Delete when no longer needed. Set TTLs; don't hoard logs and exports forever.",
        ],
        [
          "Access controls",
          "Least privilege to personal data. Access should be need-to-know and auditable.",
        ],
      ].map(([t, d]) => (
        <div
          key={t}
          style={{
            background: C.panel,
            border: `1px solid ${C.bd}`,
            borderRadius: 10,
            padding: "16px 18px",
          }}
        >
          <div
            style={{
              color: C.ac,
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 5,
            }}
          >
            {t}
          </div>
          <div style={{ color: C.mut, fontSize: 13, lineHeight: 1.5 }}>{d}</div>
        </div>
      ))}
    </div>
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.bd}`,
        borderRadius: 10,
        padding: "20px 22px",
        marginBottom: 22,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: C.am,
          letterSpacing: 1,
          marginBottom: 14,
        }}
      >
        DEVELOPER RESPONSIBILITIES — PRACTICAL
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          [
            "APP LOGS",
            "Don't log full request bodies, tokens, or PII. Log identifiers and outcomes, redact the rest.",
          ],
          [
            "ANALYTICS",
            "Verify what third-party SDKs actually send. Email/IP in event payloads is a disclosure.",
          ],
          [
            "PROD SUPPORT",
            "Access production data only with a justified need; never copy records to your laptop or chat.",
          ],
          [
            "TEST ENVS",
            "Use synthetic or masked data. Real production data in staging is a breach waiting to happen.",
          ],
          [
            "3RD-PARTY",
            "Sharing personal data with a vendor needs an approved basis and contract — check before integrating.",
          ],
        ].map(([label, d]) => (
          <div key={label} style={{ display: "flex", gap: 12 }}>
            <span
              style={{
                color: C.dg,
                fontFamily: MONO,
                fontSize: 12,
                flex: "0 0 90px",
              }}
            >
              {label}
            </span>
            <span style={{ fontSize: 13.5, color: "#d9d0d1", lineHeight: 1.5 }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
    <Callout>
      treat personal data as radioactive — minimise it, mask it in non-prod, keep it out of logs,
      and know where it flows. See oaic.gov.au for the APPs.
    </Callout>
  </div>
);

const Module4: React.FC = () => (
  <div>
    <div
      style={{
        background: "linear-gradient(135deg,#3a121c,#220c11)",
        border: "1px solid #5e1826",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: 1.5,
          color: C.ac,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Acceptable Use
      </div>
      <div style={{ fontSize: 15.5, lineHeight: 1.5, color: C.tx }}>
        Use <strong>approved AI systems only</strong>. Never paste customer data,
        internal/confidential information, secrets, or proprietary source code into unapproved or
        public AI tools. When unsure of a tool's classification, ask before you paste.
      </div>
    </div>
    <h3
      style={{
        margin: "0 0 12px",
        fontSize: 15,
        color: C.mut,
        fontFamily: MONO,
        letterSpacing: 1,
      }}
    >
      DATA CLASSIFICATION — WHAT GOES WHERE
    </h3>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          background: "rgba(78,209,138,0.07)",
          border: "1px solid #26543c",
          borderRadius: 10,
          padding: "16px 18px",
        }}
      >
        <div
          style={{
            color: C.ok,
            fontWeight: 600,
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          ✓ GENERALLY OK (approved tools)
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            color: "#d9d0d1",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          <li>Public/non-sensitive technical questions</li>
          <li>Generic boilerplate and refactors</li>
          <li>Synthetic or anonymised examples</li>
        </ul>
      </div>
      <div
        style={{
          background: "rgba(255,138,107,0.07)",
          border: "1px solid #5e3229",
          borderRadius: 10,
          padding: "16px 18px",
        }}
      >
        <div
          style={{
            color: C.dg,
            fontWeight: 600,
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          ✕ DO NOT PASTE
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            color: "#d9d0d1",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          <li>Customer / personal data</li>
          <li>Internal or confidential information</li>
          <li>Proprietary source code / secrets</li>
        </ul>
      </div>
    </div>
    <h3
      style={{
        margin: "0 0 12px",
        fontSize: 15,
        color: C.mut,
        fontFamily: MONO,
        letterSpacing: 1,
      }}
    >
      KNOW THE RISKS
    </h3>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,1fr)",
        gap: 10,
        marginBottom: 24,
      }}
    >
      {AI_RISKS.map((r) => (
        <div
          key={r.name}
          style={{
            background: C.panel,
            border: `1px solid ${C.bd}`,
            borderRadius: 9,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              color: "#f0883e",
              fontWeight: 600,
              fontSize: 13.5,
              marginBottom: 4,
            }}
          >
            {r.name}
          </div>
          <div style={{ color: C.mut, fontSize: 12.5, lineHeight: 1.5 }}>{r.desc}</div>
        </div>
      ))}
    </div>
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.bd}`,
        borderRadius: 10,
        padding: "20px 22px",
        marginBottom: 18,
      }}
    >
      <div style={{ color: C.ac, fontWeight: 600, marginBottom: 8 }}>
        AI-generated code = same standards as human-written code
      </div>
      <p style={{ color: "#d9d0d1", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
        Every AI suggestion gets <strong>human review</strong>, <strong>testing</strong>, and{" "}
        <strong>security review</strong>. You are accountable for code you commit. Watch for
        hallucinated APIs, made-up package names (slopsquatting), insecure defaults, and
        licence/copyright issues from generated code.
      </p>
    </div>
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.bd}`,
        borderRadius: 10,
        padding: "20px 22px",
        marginBottom: 22,
      }}
    >
      <div style={{ color: C.ac, fontWeight: 600, marginBottom: 10 }}>
        Building AI-enabled features? Secure AI development
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          fontSize: 13,
          color: "#d9d0d1",
          lineHeight: 1.5,
        }}
      >
        <div>
          • <strong>Threat model</strong> the AI component explicitly
        </div>
        <div>
          • <strong>RAG security</strong>: trust boundaries on retrieved content
        </div>
        <div>
          • <strong>Prompt injection</strong>: treat model output as untrusted input
        </div>
        <div>
          • <strong>Data access controls</strong>: the model inherits user permissions, not god-mode
        </div>
        <div>
          • <strong>Model security</strong>: guard against poisoning, abuse and leakage
        </div>
        <div>
          • <strong>Untrusted outputs</strong>: never execute model output without validation
        </div>
      </div>
    </div>
    <Callout>
      approved tools only, no sensitive data in prompts, and review AI code as if a stranger wrote
      it. ACSC AI guidance: cyber.gov.au.
    </Callout>
  </div>
);

const Module5: React.FC = () => (
  <div>
    <KeyMessage label="Key Message" tone="amber">
      Early reporting is more important than certainty.
      <div
        style={{
          fontSize: 14,
          color: "#d9d0d1",
          lineHeight: 1.5,
          marginTop: 8,
          fontWeight: 400,
        }}
      >
        You are <strong>not</strong> expected to investigate incidents yourself — you are expected
        to report them promptly. A false alarm costs minutes; a delayed real incident costs far
        more.
      </div>
    </KeyMessage>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 12,
        marginBottom: 24,
      }}
    >
      {[
        [
          "Security incidents",
          "Exposed credentials, unauthorised access, vulnerable production systems.",
        ],
        [
          "Privacy incidents",
          "Personal data exposed, sent to the wrong party, or accessed without basis.",
        ],
        [
          "AI-related incidents",
          "Sensitive data sent to AI tools, harmful AI output shipped, prompt-injection abuse.",
        ],
      ].map(([t, d]) => (
        <div
          key={t}
          style={{
            background: C.panel,
            border: `1px solid ${C.bd}`,
            borderRadius: 10,
            padding: "16px 18px",
          }}
        >
          <div
            style={{
              color: C.ac,
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 5,
            }}
          >
            {t}
          </div>
          <div style={{ color: C.mut, fontSize: 12.5, lineHeight: 1.5 }}>{d}</div>
        </div>
      ))}
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 22,
      }}
    >
      <Card>
        <div style={{ color: C.ac, fontWeight: 600, marginBottom: 10 }}>
          How to report &amp; escalate
        </div>
        <ol
          style={{
            margin: 0,
            paddingLeft: 18,
            color: "#d9d0d1",
            fontSize: 13.5,
            lineHeight: 1.7,
          }}
        >
          <li>
            Report to ISMS immediately via Slack:{" "}
            <span style={{ fontFamily: MONO, color: C.ac }}>#incidents</span>
          </li>
          <li>Tell your Tech Lead / Engineering Manager</li>
          <li>Tag @channel to ensure the security officers are notified.</li>
          <li>Don't broadcast details in public channels</li>
          <li>Always review the Security Event Reporting Procedure in Confluence.</li>
        </ol>
      </Card>
      <Card>
        <div style={{ color: C.ac, fontWeight: 600, marginBottom: 10 }}>Preserve evidence</div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            color: "#d9d0d1",
            fontSize: 13.5,
            lineHeight: 1.7,
          }}
        >
          <li>Don't delete logs, messages or commits</li>
          <li>Don't "fix and forget" — note the time you noticed</li>
          <li>Capture screenshots / IDs</li>
          <li>Rotate exposed secrets, but tell ISMS too</li>
        </ul>
      </Card>
    </div>
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.bd}`,
        borderRadius: 10,
        padding: "18px 20px",
        marginBottom: 22,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: C.am,
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        REPORT THESE — EXAMPLES
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 10,
          fontSize: 13,
          color: "#d9d0d1",
          lineHeight: 1.5,
        }}
      >
        {[
          "An API key or password committed to a repo",
          "Customer data visible to the wrong account",
          "A production system found unpatched / exploitable",
          "Someone pasting customer data into a public AI tool",
          "A suspicious or unexpected third-party package",
          "A privacy data breach (see OAIC data breach response)",
        ].map((e) => (
          <div key={e} style={{ background: C.p2, borderRadius: 7, padding: "11px 14px" }}>
            {e}
          </div>
        ))}
      </div>
    </div>
    <Callout>
      if something feels wrong, report it. When in doubt, report — that single habit is the most
      valuable thing in this module.
    </Callout>
  </div>
);

/* ---------- Assessment ---------- */

function isChoice(q: Question): q is ChoiceQuestion {
  return q.type !== "short";
}

const QuestionCard: React.FC<{
  q: Question;
  num: number;
  submitted: boolean;
  answer?: number;
  onPick: (qid: string, i: number) => void;
  shortOpen: boolean;
  onToggleShort: (qid: string) => void;
}> = ({ q, num, submitted, answer, onPick, shortOpen, onToggleShort }) => {
  const header = (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "baseline",
        marginBottom: 10,
      }}
    >
      <span style={{ fontFamily: MONO, color: C.ac, fontSize: 14, fontWeight: 600 }}>Q{num}</span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: 0.5,
          color: C.ac,
          background: C.acbg,
          padding: "2px 8px",
          borderRadius: 20,
        }}
      >
        {q.cat}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          color: C.mut,
          marginLeft: "auto",
        }}
      >
        {q.type === "mcq" ? "MULTIPLE CHOICE" : q.type === "scenario" ? "SCENARIO" : "SHORT ANSWER"}
      </span>
    </div>
  );
  if (q.type === "short") {
    return (
      <Card>
        {header}
        <div style={{ fontSize: 14.5, lineHeight: 1.5, marginBottom: 6 }}>{q.q}</div>
        <div style={{ fontSize: 11.5, color: C.mut, marginBottom: 10 }}>Objective: {q.lo}</div>
        <textarea
          rows={3}
          placeholder="Type your answer…"
          style={{
            width: "100%",
            background: C.p2,
            border: `1px solid ${C.bd}`,
            borderRadius: 7,
            padding: "10px 12px",
            color: C.tx,
            fontSize: 13.5,
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={() => onToggleShort(q.id)}
          style={{
            marginTop: 10,
            background: "transparent",
            color: C.ac,
            border: `1px solid ${C.ac}`,
            borderRadius: 7,
            padding: "7px 14px",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {shortOpen ? "Hide model answer" : "Show model answer"}
        </button>
        {shortOpen && (
          <div
            style={{
              marginTop: 12,
              background: C.p2,
              borderLeft: `3px solid ${C.ok}`,
              borderRadius: 6,
              padding: "12px 14px",
              fontSize: 13,
              lineHeight: 1.55,
              color: "#d9d0d1",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: C.ok,
                marginBottom: 6,
                letterSpacing: 1,
              }}
            >
              MODEL ANSWER
            </div>
            {q.model}
          </div>
        )}
      </Card>
    );
  }
  return (
    <Card>
      {header}
      <div style={{ fontSize: 14.5, lineHeight: 1.5, marginBottom: 6 }}>{q.q}</div>
      <div style={{ fontSize: 11.5, color: C.mut, marginBottom: 12 }}>Objective: {q.lo}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.opts.map((o, i) => {
          const mine = answer === i,
            isC = i === q.correct;
          let bd: string = mine ? C.ac : C.bd,
            bg: string = mine ? C.acbg : C.p2,
            icon: React.ReactNode = null;
          if (submitted) {
            if (isC) {
              bd = C.ok;
              bg = C.okbg;
              icon = <span style={{ color: C.ok }}>✓</span>;
            } else if (mine) {
              bd = C.dg;
              bg = C.dgbg;
              icon = <span style={{ color: C.dg }}>✗</span>;
            }
          }
          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => onPick(q.id, i)}
              style={{
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                background: bg,
                border: `1px solid ${bd}`,
                borderRadius: 8,
                padding: "10px 14px",
                color: C.tx,
                fontSize: 13.5,
                cursor: submitted ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <span>{o}</span>
              {icon}
            </button>
          );
        })}
      </div>
      {submitted && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12.5,
            lineHeight: 1.55,
            color: "#d9d0d1",
            background: C.p2,
            borderRadius: 6,
            padding: "10px 12px",
          }}
        >
          <strong style={{ color: answer === q.correct ? C.ok : C.dg }}>
            {answer === q.correct ? "Correct. " : "Incorrect. "}
          </strong>
          {q.exp}
        </div>
      )}
    </Card>
  );
};

interface AssessmentResult {
  total: number;
  correct: number;
  score: number;
  pass: boolean;
  wrong: ChoiceQuestion[];
}

const Assessment: React.FC = () => {
  const [info, setInfo] = useState<LearnerInfo>({
    name: "",
    email: "",
    dept: "",
  });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [shortOpen, setShortOpen] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const scored = useMemo(() => QUIZ.filter(isChoice), []);

  const result: AssessmentResult = useMemo(() => {
    const correctQs = scored.filter((q) => answers[q.id] === q.correct);
    const score = Math.round((correctQs.length / scored.length) * 100);
    return {
      total: scored.length,
      correct: correctQs.length,
      score,
      pass: score >= 80,
      wrong: scored.filter((q) => answers[q.id] !== q.correct),
    };
  }, [answers, scored]);

  function pick(qid: string, i: number) {
    if (!submitted) setAnswers((a) => ({ ...a, [qid]: i }));
  }
  function toggleShort(qid: string) {
    setShortOpen((s) => ({ ...s, [qid]: !s[qid] }));
  }

  function submit() {
    if (!info.name.trim() || !info.email.trim() || !info.dept) {
      setErr("Please enter your name, email and department before submitting.");
      return;
    }
    setSubmitted(true);
    setErr("");
  }
  function restart() {
    setSubmitted(false);
    setAnswers({});
    setShortOpen({});
    setErr("");
  }

  function emailText(): string {
    const wrong =
      result.wrong.map((q) => `  Q${QUIZ.indexOf(q) + 1} (${q.cat}): ${q.q}`).join("\n") ||
      "  None";
    const date = new Date().toISOString().slice(0, 10);
    return [
      "To: security@meeco.me",
      "Subject: Technical Security Awareness Training Results",
      "",
      `Employee Name: ${info.name || "________"}`,
      `Employee Email: ${info.email || "________"}`,
      `Department: ${info.dept || "________"}`,
      `Completion Date: ${date}`,
      `Final Score: ${result.score}% (${result.correct}/${result.total} auto-scored)`,
      `Result: ${result.pass ? "PASS" : "FAIL"}`,
      "",
      "Incorrect Questions:",
      wrong,
      "",
      "Short-answer questions (Q26–Q30): self-reviewed against model answers; flagged for ISMS review.",
      "",
      "Training Completion Status: Completed",
      "",
      "Recipient: security@meeco.me",
    ].join("\n");
  }

  function copyEmail() {
    const t = emailText();
    if (navigator.clipboard) navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  function mailto() {
    const lines = emailText().split("\n");
    const subj = "Technical Security Awareness Training Results";
    const body = lines.slice(3).join("\n");
    window.location.href = `mailto:security@meeco.me?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
  }
  function download() {
    const blob = new Blob([emailText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "security-training-result.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: C.p2,
    border: `1px solid ${C.bd}`,
    borderRadius: 7,
    padding: "10px 12px",
    color: C.tx,
    fontSize: 13.5,
    fontFamily: "inherit",
  };

  if (!submitted) {
    return (
      <div>
        <div
          style={{
            background: C.panel,
            border: `1px solid ${C.bd}`,
            borderRadius: 12,
            padding: "22px 24px",
            marginBottom: 24,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Before you begin</div>
          <div
            style={{
              color: C.mut,
              fontSize: 13.5,
              lineHeight: 1.55,
              marginBottom: 16,
            }}
          >
            30 questions · ~30 minutes · pass mark 80%. The 25 multiple-choice and scenario
            questions are auto-scored; the 5 short-answer questions are self-reviewed against model
            answers and flagged for ISMS review. Your result generates an email summary for the ISMS
            team.
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input
              placeholder="Full name"
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Work email"
              value={info.email}
              onChange={(e) => setInfo({ ...info, email: e.target.value })}
              style={inputStyle}
            />
            <select
              value={info.dept}
              onChange={(e) => setInfo({ ...info, dept: e.target.value })}
              style={{ ...inputStyle, color: info.dept ? C.tx : C.mut }}
            >
              <option value="">Department / role…</option>
              {[
                "Software Development",
                "Senior Developer",
                "Technical Lead",
                "Architecture",
                "DevOps",
                "QA Engineering",
                "Engineering Management",
              ].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {QUIZ.map((q, i) => (
            <QuestionCard
              key={q.id}
              q={q}
              num={i + 1}
              submitted={false}
              answer={answers[q.id]}
              onPick={pick}
              shortOpen={!!shortOpen[q.id]}
              onToggleShort={toggleShort}
            />
          ))}
        </div>
        {err && (
          <div
            style={{
              marginTop: 16,
              color: C.dg,
              fontSize: 13.5,
              background: C.dgbg,
              border: `1px solid ${C.dg}`,
              borderRadius: 8,
              padding: "12px 16px",
            }}
          >
            {err}
          </div>
        )}
        <button
          onClick={submit}
          style={{
            marginTop: 20,
            background: C.ac,
            color: C.bg,
            border: "none",
            borderRadius: 8,
            padding: "15px 28px",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Submit assessment &amp; generate result
        </button>
      </div>
    );
  }

  const ring = result.pass ? C.ok : C.dg;
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "center",
          background: C.panel,
          border: `1px solid ${result.pass ? "#26543c" : "#5e3229"}`,
          borderRadius: 14,
          padding: "28px 30px",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: "50%",
            border: `6px solid ${ring}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 104px",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 26,
              fontWeight: 600,
              color: ring,
            }}
          >
            {result.score}%
          </div>
          <div style={{ fontSize: 10, color: C.mut }}>
            {result.correct}/{result.total}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: ring,
              marginBottom: 4,
            }}
          >
            {result.pass ? "PASS — well done" : "NOT YET — review & retry"}
          </div>
          <div style={{ color: C.mut, fontSize: 14, lineHeight: 1.55 }}>
            {result.pass
              ? "You met the 80% pass mark on the auto-scored questions. Send your result to ISMS below to complete your record."
              : "You need 80% on the auto-scored questions. Review the explanations below, then retake the assessment."}
          </div>
        </div>
      </div>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: C.mut,
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        REVIEW — AUTO-SCORED QUESTIONS
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {scored.map((q) => (
          <QuestionCard
            key={q.id}
            q={q}
            num={QUIZ.indexOf(q) + 1}
            submitted
            answer={answers[q.id]}
            onPick={pick}
            shortOpen={false}
            onToggleShort={toggleShort}
          />
        ))}
      </div>

      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: C.mut,
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        SHORT-ANSWER — SELF-REVIEW (ISMS reviewed)
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 28,
        }}
      >
        {QUIZ.filter((q) => q.type === "short").map((q) => (
          <QuestionCard
            key={q.id}
            q={q}
            num={QUIZ.indexOf(q) + 1}
            submitted
            answer={undefined}
            onPick={pick}
            shortOpen={!!shortOpen[q.id]}
            onToggleShort={toggleShort}
          />
        ))}
      </div>

      <div
        style={{
          background: C.panel,
          border: `1px solid ${C.bd}`,
          borderRadius: 12,
          padding: "24px 26px",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 6 }}>
          Submit your result to ISMS
        </div>
        <div
          style={{
            color: C.mut,
            fontSize: 13.5,
            lineHeight: 1.55,
            marginBottom: 16,
          }}
        >
          This generates the standard result email for the ISMS team — evidence for the ISO 27001
          audit. Send it via your mail client, or copy/download the record.
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={mailto}
            style={{
              background: C.ac,
              color: C.bg,
              border: "none",
              borderRadius: 8,
              padding: "11px 20px",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ✉ Open in mail client
          </button>
          <button
            onClick={copyEmail}
            style={{
              background: "transparent",
              color: C.ac,
              border: `1px solid ${C.ac}`,
              borderRadius: 8,
              padding: "11px 20px",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {copied ? "✓ Copied" : "Copy email text"}
          </button>
          <button
            onClick={download}
            style={{
              background: "transparent",
              color: C.mut,
              border: `1px solid ${C.bd}`,
              borderRadius: 8,
              padding: "11px 20px",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Download .txt record
          </button>
          <button
            onClick={restart}
            style={{
              background: "transparent",
              color: C.mut,
              border: `1px solid ${C.bd}`,
              borderRadius: 8,
              padding: "11px 20px",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Retake assessment
          </button>
        </div>
        <pre
          style={{
            background: C.bg,
            border: `1px solid ${C.bd}`,
            borderRadius: 8,
            padding: "16px 18px",
            fontFamily: MONO,
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "#d9d0d1",
            whiteSpace: "pre-wrap",
            margin: 0,
            maxHeight: 320,
            overflow: "auto",
          }}
        >
          {emailText()}
        </pre>
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: `1px solid ${C.bd}`,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              color: C.am,
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            FOR ADMINISTRATORS — ELECTRONIC COLLECTION
          </div>
          <div style={{ color: C.mut, fontSize: 12.5, lineHeight: 1.6 }}>
            To automate collection, replace the mail step with a POST to a form endpoint (e.g. an
            internal LMS, Microsoft Forms, or a serverless webhook) capturing: full name, email,
            department, completion date, score, and pass/fail. Route submissions to
            security@meeco.me or an ISMS dashboard. Retain records as ISO 27001 training evidence.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Root component ---------- */

const TrainingSDLC: React.FC = () => {
  const [view, setView] = useState<ViewId>("welcome");
  const [visited, setVisited] = useState<Record<string, boolean>>({
    welcome: true,
  });

  function go(v: ViewId) {
    setView(v);
    setVisited((s) => ({ ...s, [v]: true }));
  }

  const idx = ORDER.indexOf(view);
  const showFooter = view !== "quiz";
  const prev = idx > 0 ? ORDER[idx - 1] : null;
  const next = idx < ORDER.length - 1 ? ORDER[idx + 1] : null;
  const nLabels: Record<ViewId, string> = {
    welcome: "Welcome",
    m1: "Module 01",
    m2: "Module 02",
    m3: "Module 03",
    m4: "Module 04",
    m5: "Module 05",
    quiz: "Final Assessment",
  };

  const visitedCount = Object.keys(visited).length;
  const progressPct = Math.round((visitedCount / ORDER.length) * 100);
  const head = HEADS[view];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        background: C.bg,
        color: C.tx,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      }}
    >
      <aside
        style={{
          width: 288,
          flex: "0 0 288px",
          background: "#11151c",
          borderRight: `1px solid ${C.bd}`,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <div
          style={{
            padding: "24px 22px 18px",
            borderBottom: "1px solid #282326",
          }}
        >
          <img
            src={meecoLogo}
            alt="Meeco"
            style={{ height: 32, width: "auto", display: "block", marginBottom: 16 }}
          />
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: 2,
              color: C.ac,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Meeco · ISMS
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>
            Software Development Security Essentials
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.mut,
              marginTop: 6,
              fontFamily: MONO,
            }}
          >
            ISO 27001 · 30–45 min · v1.0
          </div>
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "14px 12px" }}>
          {NAV.map((n) => {
            const active = view === n.id,
              done = visited[n.id] && !active;
            return (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 12px",
                  marginBottom: 3,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13.5,
                  textAlign: "left",
                  background: active ? C.acbg : "transparent",
                  color: active ? C.ac : done ? C.tx : C.mut,
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    width: 24,
                    flex: "0 0 24px",
                    textAlign: "center",
                    opacity: 0.85,
                  }}
                >
                  {n.num}
                </span>
                <span style={{ flex: 1, textAlign: "left" }}>{n.label}</span>
                <span
                  style={{
                    color: C.ac,
                    fontSize: 12,
                    width: 14,
                    textAlign: "center",
                  }}
                >
                  {done ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "16px 22px", borderTop: "1px solid #282326" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: C.mut,
              fontFamily: MONO,
              marginBottom: 7,
            }}
          >
            <span>PROGRESS</span>
            <span>{progressPct}%</span>
          </div>
          <div
            style={{
              height: 5,
              background: "#282326",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: C.ac,
                borderRadius: 4,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: "auto", height: "100vh" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "48px 56px 96px" }}>
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: 2,
                color: C.ac,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              {head.kicker}
            </div>
            <h1
              style={{
                fontSize: 34,
                fontWeight: 700,
                margin: "0 0 12px",
                lineHeight: 1.15,
                letterSpacing: "-0.5px",
              }}
            >
              {head.title}
            </h1>
            <p
              style={{
                fontSize: 16,
                color: C.mut,
                margin: 0,
                maxWidth: 640,
                lineHeight: 1.55,
              }}
            >
              {head.desc}
            </p>
          </div>

          {view === "welcome" && <Welcome onStart={() => go("m1")} />}
          {view === "m1" && <Module1 />}
          {view === "m2" && <Module2 />}
          {view === "m3" && <Module3 />}
          {view === "m4" && <Module4 />}
          {view === "m5" && <Module5 />}
          {(view === "m1" || view === "m2" || view === "m3" || view === "m4" || view === "m5") && (
            <ModuleInteractive view={view} />
          )}
          {view === "quiz" && <Assessment />}

          {showFooter && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 40,
                paddingTop: 24,
                borderTop: "1px solid #282326",
              }}
            >
              <button
                onClick={() => prev && go(prev)}
                disabled={!prev}
                style={{
                  background: "transparent",
                  border: `1px solid ${prev ? C.bd : "transparent"}`,
                  color: prev ? C.mut : "transparent",
                  borderRadius: 8,
                  padding: "12px 20px",
                  fontSize: 14,
                  cursor: prev ? "pointer" : "default",
                  fontFamily: "inherit",
                }}
              >
                {prev ? `← ${nLabels[prev]}` : ""}
              </button>
              <button
                onClick={() => next && go(next)}
                style={{
                  background: C.ac,
                  border: "none",
                  color: C.bg,
                  borderRadius: 8,
                  padding: "12px 22px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {next ? `${next === "quiz" ? "Start assessment" : nLabels[next]} →` : ""}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrainingSDLC;

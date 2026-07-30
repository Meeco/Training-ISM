import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import meecoLogo from "./assets/images/meeco-logo.svg";

/**
 * Security, Privacy & AI Awareness Training
 * Converted from an HTML/DC design reference into a single-file React + TypeScript component.
 * Inline styles are preserved 1:1 from the original design so visual output matches exactly.
 * See README.md in this folder for full handoff notes.
 */

// ---------- Props ----------
export interface TrainingAwarenessProps {
  companyName?: string;
  trainingVersion?: string;
  passMark?: number; // 50-100
  accent?: string; // hex color
}

// ---------- Content types ----------
type Block =
  | { isCards: true; gridCols: string; cards: { tag: string; color: string; title: string; items: string[] }[] }
  | { isBullets: true; title: string; items: { h: string; t: string }[] }
  | { isColumns: true; leftTitle: string; leftAccent: string; leftMark: string; left: string[]; rightTitle: string; rightAccent: string; rightMark: string; right: string[] }
  | { isCallout: true; accentC: string; tint: string; title: string; text: string }
  | { isBanner: true; text: string };

interface QuestionScreen {
  type: "question";
  module: number;
  variant: "scenario" | "check";
  id: string;
  context?: string;
  prompt: string;
  correctKey: string;
  explainRight: string;
  explainWrong: string;
  options: { key: string; text: string }[];
}
interface PhishScreen {
  type: "phish";
  module: number;
  id: string;
  kicker: string;
  title: string;
  intro: string;
  from: string;
  time: string;
  subject: string;
  greeting: string;
}
interface ContentScreen {
  type: "content";
  module: number;
  kicker: string;
  title: string;
  intro?: string;
  blocks: Block[];
}
interface DividerScreen {
  type: "divider";
  module: number;
  mins: string;
  title: string;
  intro: string;
  points: string[];
}
type Screen = QuestionScreen | PhishScreen | ContentScreen | DividerScreen;

interface FinalQuestion {
  section: string;
  prompt: string;
  correct: string;
  explain: string;
  options: { key: string; text: string }[];
}

// ---------- Content builders (verbatim from design reference) ----------
const cards = (cols: number, arr: { tag: string; color: string; title: string; items: string[] }[]): Block => ({ isCards: true, gridCols: `repeat(${cols},1fr)`, cards: arr });
const bul = (title: string, items: { h: string; t: string }[]): Block => ({ isBullets: true, title, items });
const cal = (t: "good" | "warn" | "bad" | "info", title: string, text: string): Block => {
  const tone = { good: { accentC: "#1f7a52", tint: "#e4f3ec" }, warn: { accentC: "#b9791d", tint: "#f8efdc" }, bad: { accentC: "#b23a3a", tint: "#fbece9" }, info: { accentC: "#2f6fb0", tint: "#eaf0f7" } }[t];
  return { isCallout: true, accentC: tone.accentC, tint: tone.tint, title, text };
};
const cols = (lt: string, la: string, lm: string, l: string[], rt: string, ra: string, rm: string, r: string[]): Block => ({ isColumns: true, leftTitle: lt, leftAccent: la, leftMark: lm, left: l, rightTitle: rt, rightAccent: ra, rightMark: rm, right: r });
const ban = (text: string): Block => ({ isBanner: true, text });

const DEPT_OPTIONS = ["Board / Director", "Executive", "Senior Management", "Project Management", "Finance", "Product Development", "Product Design", "Administration", "Human Resources", "Customer-Facing / Sales", "Other"];

const OBJECTIVES = [
  "Recognise your information security responsibilities",
  "Handle company and customer information appropriately",
  "Protect personal information",
  "Identify phishing and social engineering attempts",
  "Apply secure password and MFA practices",
  "Use approved AI tools safely",
  "Recognise potential incidents",
  "Report incidents immediately",
  "Understand your accountability for security",
].map((t, n) => ({ n: String(n + 1).padStart(2, "0"), t }));

const MODULE_TITLES = [
  "Information Classification & Data Handling",
  "Privacy & Personal Information",
  "Phishing, Social Engineering & Deepfakes",
  "Passwords, MFA & Account Security",
  "Responsible Use of Corporate AI",
  "Incident Recognition & Reporting",
];

function buildScreens(): Screen[] {
  const S: Screen[] = [];
  // Module 1
  S.push({ type: "divider", module: 1, mins: "5 minutes", title: MODULE_TITLES[0], intro: "How we label information by sensitivity, and the everyday habits that keep it protected.", points: ["The four classification levels and what they mean", "Need-to-know and least-privilege in plain terms", "A real sharing request to decide on"] });
  S.push({
    type: "content", module: 1, kicker: "CLASSIFICATION", title: "Four levels, from open to highly protected",
    intro: "Every piece of information we handle sits in one of four levels. The level tells you how carefully to treat it.",
    blocks: [cards(4, [
      { tag: "PUBLIC", color: "#2f8f5b", title: "Freely shareable", items: ["Website & marketing content", "Published announcements", "Public brochures"] },
      { tag: "INTERNAL", color: "#2f6fb0", title: "Staff-only, low risk", items: ["Internal procedures", "Team updates", "General how-to guides"] },
      { tag: "CONFIDENTIAL", color: "#b9791d", title: "Limited, need-to-know", items: ["Contracts", "Commercial proposals", "Project plans"] },
      { tag: "RESTRICTED", color: "#b23a3a", title: "Highest protection", items: ["Customer records", "Employee records", "Security credentials"] },
    ]), cal("info", "Not sure which level?", "Treat it as the more sensitive level and check with the information owner. It is always safer to over-protect than to under-protect.")],
  });
  S.push({
    type: "content", module: 1, kicker: "GOOD HABITS", title: "Two principles that guide every decision", intro: "",
    blocks: [bul("", [
      { h: "Need-to-know —", t: "access and share information only when your job genuinely requires it." },
      { h: "Least privilege —", t: "keep access to the minimum needed; do not collect or hold more than you need." },
      { h: "Appropriate sharing —", t: "share through approved systems, with authorised people, for a clear business reason." },
      { h: "Secure handling —", t: "lock your screen, store documents securely, and never leave printouts or devices unattended." },
    ])],
  });
  S.push({ type: "question", module: 1, variant: "scenario", id: "sc1", context: "A colleague in Marketing emails you: \"Can you send me the full customer list? We want to plan a campaign.\" You have access to it — they do not.", prompt: "What is the best response?", correctKey: "b", explainRight: "Even within the same company, access follows need-to-know. Confirm there is an approved business reason and let the data owner provide only what is required, through an approved system.", explainWrong: "Same company is not the same as authorised. Don't send it on request — confirm the business need and route it through the data owner and an approved system.", options: [{ key: "a", text: "Send the full list — we all work for the same company." }, { key: "b", text: "Check they have an approved business need, then ask the data owner to share only what is required via an approved system." }, { key: "c", text: "Send a trimmed version to be helpful, without checking." }] });
  S.push({ type: "question", module: 1, variant: "check", id: "kc1", prompt: "Which of these is Restricted information?", correctKey: "c", explainRight: "Customer records and security credentials need the highest level of protection — that's Restricted.", explainWrong: "Website content and brochures are Public; internal procedures are Internal. Restricted covers the most sensitive items like customer records and credentials.", options: [{ key: "a", text: "Content published on the company website" }, { key: "b", text: "An internal \"how to book leave\" guide" }, { key: "c", text: "Customer records and security credentials" }] });

  // Module 2
  S.push({ type: "divider", module: 2, mins: "5 minutes", title: MODULE_TITLES[1], intro: "What counts as personal information, and the practical habits that keep it private.", points: ["What personal information is — with examples", "Authorised access and avoiding unauthorised disclosure", "Handling a misdirected email"] });
  S.push({
    type: "content", module: 2, kicker: "PERSONAL INFORMATION", title: "If it can identify a person, it's personal information",
    intro: "Personal information is anything that can identify someone — on its own, or combined with other details.",
    blocks: [cards(2, [
      { tag: "CUSTOMER INFORMATION", color: "#2f6fb0", title: "About the people we serve", items: ["Names, emails, phone numbers", "Identification documents", "Customer account records"] },
      { tag: "EMPLOYEE INFORMATION", color: "#8A1120", title: "About our own people", items: ["Home address & contact details", "Bank, super & payroll details", "Employment & leave records"] },
    ]), cal("info", "The Australian Privacy Principles, in plain terms", "Collect only what is needed, use it only for the reason it was provided, keep it secure, and let people access their own information. We protect it because it was trusted to us — not just because it is required.")],
  });
  S.push({
    type: "content", module: 2, kicker: "YOUR OBLIGATIONS", title: "Authorised access, no unauthorised disclosure", intro: "",
    blocks: [bul("", [
      { h: "Access only what you're authorised to —", t: "if you can see information you shouldn't, don't open it; report it." },
      { h: "Use it only for its purpose —", t: "don't reuse customer or staff data for something it wasn't provided for." },
      { h: "Never disclose to unauthorised people —", t: "inside or outside the company, including casual conversations." },
      { h: "Keep it accurate and secure —", t: "and dispose of it securely when it's no longer needed." },
    ])],
  });
  S.push({ type: "question", module: 2, variant: "scenario", id: "sc2", context: "You've just emailed a spreadsheet of customer details to the wrong recipient — an external address. You realise within a minute.", prompt: "What should you do first?", correctKey: "c", explainRight: "Speed limits the harm. Report it immediately, attempt to recall the message, and notify your manager or privacy contact. A misdirected email containing personal information is a reportable privacy incident.", explainWrong: "Don't quietly delete it or hope it isn't opened. This is a reportable privacy incident — report it straight away, try to recall it, and tell your manager or privacy contact.", options: [{ key: "a", text: "Delete it from your Sent items and move on." }, { key: "b", text: "Do nothing — they probably won't open it." }, { key: "c", text: "Report it immediately, try to recall the message, and notify your manager or privacy contact." }] });
  S.push({ type: "question", module: 2, variant: "check", id: "kc2", prompt: "What's the best way to reduce the risk of sending information to the wrong person?", correctKey: "b", explainRight: "A two-second check of the recipient — and sharing only the minimum needed — prevents most misdirected-information incidents.", explainWrong: "Speed and \"cc everyone\" are how mistakes happen. Double-check the recipient and share only the minimum necessary.", options: [{ key: "a", text: "Send quickly so nothing is delayed" }, { key: "b", text: "Double-check the recipient and share only the minimum needed" }, { key: "c", text: "Always cc your whole team for a record" }] });

  // Module 3
  S.push({ type: "divider", module: 3, mins: "7 minutes", title: MODULE_TITLES[2], intro: "How attackers try to trick people — including with AI-generated voices and video — and the one habit that defeats them.", points: ["The many shapes phishing takes", "Spotting the red flags in a real email", "Verifying unusual requests independently"] });
  S.push({
    type: "content", module: 3, kicker: "KNOW THE SHAPES", title: "Phishing comes through every channel now",
    intro: "It's not just email. Attackers use whatever channel works — and AI now makes fakes more convincing.",
    blocks: [cards(3, [
      { tag: "EMAIL", color: "#2f6fb0", title: "Email phishing", items: ["Fake invoices & links", "Lookalike sender addresses"] },
      { tag: "SMS", color: "#2f6fb0", title: "SMS phishing", items: ["\"Failed delivery\" texts", "Fake account alerts"] },
      { tag: "VOICE", color: "#2f6fb0", title: "Voice phishing", items: ["Calls posing as IT or a bank", "Pressure to act now"] },
      { tag: "IMPERSONATION", color: "#b9791d", title: "Executive impersonation & BEC", items: ["\"CEO\" urgent requests", "Changed supplier bank details"] },
      { tag: "DEEPFAKE", color: "#b23a3a", title: "Deepfake audio & video", items: ["Cloned voices on calls", "Faked video on meetings"] },
      { tag: "AI FRAUD", color: "#b23a3a", title: "AI-generated fraud", items: ["Flawless, personalised messages", "Fake documents & sites"] },
    ]), cal("warn", "Common lures to watch for", "Urgent invoice payments · a \"CEO\" requesting an urgent funds transfer · password reset or account verification requests · unexpected document links. They work by creating pressure, urgency, and a sense of authority.")],
  });
  S.push({ type: "phish", module: 3, id: "ph1", kicker: "SPOT THE SIGNS", title: "Find the red flags in this email", intro: "This message is a phishing attempt. Click each part that looks suspicious — there are six red flags to find.", from: "Accounts Payable <billing@inv0ice-suppliers.com>", time: "08:14", subject: "URGENT: Overdue invoice — pay today to avoid suspension", greeting: "Dear Valued Customer," });
  S.push({
    type: "content", module: 3, kicker: "THE GOLDEN RULE", title: "Verify unusual requests through a separate, trusted channel", intro: "",
    blocks: [ban("When a request is unusual, urgent, or about money or credentials — stop and verify it another way before you act."), cols("DO", "#1f7a52", "✓", ["Call back on a number you already have on file", "Confirm in person or via a known internal channel", "Slow down — it's okay to take a minute"], "DON'T", "#b23a3a", "✕", ["Trust contact details inside the message itself", "Act on urgency or authority alone", "Click links or open attachments you didn't expect"])],
  });
  S.push({ type: "question", module: 3, variant: "check", id: "kc3", prompt: "An urgent email asks you to change a supplier's bank details. What's the safest way to verify it?", correctKey: "b", explainRight: "Always verify through a channel you already trust. Call the supplier on a number you already have — never one provided in the suspicious message.", explainWrong: "Replying to the email or trusting the logo only checks the attacker's own message. Verify using a phone number you already have on file.", options: [{ key: "a", text: "Reply to the email and ask if it's genuine" }, { key: "b", text: "Call a phone number you already have on file for that supplier" }, { key: "c", text: "Pay now and confirm the details later" }] });

  // Module 4
  S.push({ type: "divider", module: 4, mins: "3 minutes", title: MODULE_TITLES[3], intro: "Simple account habits that stop most attacks in their tracks.", points: ["Long, unique passphrases over complex ones", "Why password reuse is risky", "How MFA protects you even if a password leaks"] });
  S.push({
    type: "content", module: 4, kicker: "ACCOUNT SECURITY", title: "Strong, unique, and backed by MFA", intro: "",
    blocks: [bul("", [
      { h: "Use long passphrases —", t: "length matters more than odd symbols. A memorable phrase beats \"P@ss1!\"." },
      { h: "Never reuse passwords —", t: "if one site is breached, attackers try the same password everywhere else (credential stuffing)." },
      { h: "Use the approved password manager —", t: "so every account can have a different, strong password you don't have to remember." },
      { h: "Turn on MFA everywhere —", t: "a second step (an app prompt or code) blocks attackers even when they have your password." },
      { h: "Protect your credentials —", t: "never enter them after clicking a link in a message, and never share them — not even with IT." },
    ]), cal("good", "Why MFA matters", "Multi-factor authentication significantly reduces the risk of account compromise. Even if your password is stolen, the attacker still can't get in without your second factor.")],
  });
  S.push({ type: "question", module: 4, variant: "check", id: "kc4", prompt: "Which is the strongest approach to protecting your account?", correctKey: "c", explainRight: "A long, unique passphrase stored in the approved password manager, combined with MFA, gives you both strength and a second line of defence.", explainWrong: "Short complex passwords, reused passwords, and personal details are all weak. The strongest approach is a long unique passphrase plus MFA.", options: [{ key: "a", text: "A short but complex password like \"P@ss1!\"" }, { key: "b", text: "One strong password reused across your accounts" }, { key: "c", text: "A long unique passphrase in a password manager, plus MFA" }, { key: "d", text: "Your name and birth year, so it's easy to recall" }] });

  // Module 5
  S.push({ type: "divider", module: 5, mins: "5 minutes", title: MODULE_TITLES[4], intro: "How to get the benefits of approved AI tools without putting information — or yourself — at risk.", points: ["Approved tools and prohibited uses", "What you must never put into an AI tool", "Why human review always stays in the loop"] });
  S.push({
    type: "content", module: 5, kicker: "USING AI WELL", title: "Approved tools, with a human always in charge",
    intro: "AI tools can help us work faster — but only when used through approved tools, with care about what goes in and trust in what comes out.",
    blocks: [cols("APPROVED & ENCOURAGED", "#1f7a52", "✓", ["Use only company-approved AI tools", "Draft, summarise and brainstorm with non-sensitive content", "Always review and verify the output yourself"], "PROHIBITED", "#b23a3a", "✕", ["Personal or unapproved AI accounts for work", "Entering sensitive or confidential data", "Treating AI output as final or authoritative"]), cal("warn", "AI can be confidently wrong", "AI tools can invent facts, figures and names that sound right but aren't — these are called \"hallucinations\". Always check anything you'll rely on or share.")],
  });
  S.push({
    type: "content", module: 5, kicker: "DATA PROTECTION", title: "Never put these into an AI tool", intro: "",
    blocks: [cards(3, [
      { tag: "PROHIBITED", color: "#b23a3a", title: "Customer personal information", items: [] },
      { tag: "PROHIBITED", color: "#b23a3a", title: "Employee records", items: [] },
      { tag: "PROHIBITED", color: "#b23a3a", title: "Confidential contracts", items: [] },
      { tag: "PROHIBITED", color: "#b23a3a", title: "Credentials & passwords", items: [] },
      { tag: "PROHIBITED", color: "#b23a3a", title: "Secrets & API keys", items: [] },
      { tag: "PROHIBITED", color: "#b23a3a", title: "Commercially sensitive information", items: [] },
    ]), ban("AI assists humans — it does not replace human accountability. You are responsible for anything you submit to it or send on from it.")],
  });
  S.push({ type: "question", module: 5, variant: "scenario", id: "sc3", context: "You want to summarise a signed customer contract quickly, so you think about pasting the whole thing into an AI assistant.", prompt: "Is this permitted?", correctKey: "b", explainRight: "Contracts are confidential and often contain personal information. Use only an approved tool, and only after removing sensitive details — or follow the specific guidance in our AI policy.", explainWrong: "AI chats are not private, and deleting afterwards doesn't undo the exposure. Contracts are confidential — use an approved tool, with sensitive details removed, per policy.", options: [{ key: "a", text: "Yes — AI chats are private anyway." }, { key: "b", text: "No — contracts are confidential. Use an approved tool only, with sensitive details removed or as the AI policy allows." }, { key: "c", text: "Yes, as long as you delete the chat afterwards." }] });
  S.push({ type: "question", module: 5, variant: "check", id: "kc5", prompt: "Before using an approved AI tool with work content, you should…", correctKey: "b", explainRight: "Remove confidential and personal details before you start, and always keep a human review of whatever the tool produces.", explainWrong: "Don't paste everything in, use a personal account, or trust the output blindly. Strip sensitive details first and review the result yourself.", options: [{ key: "a", text: "Paste everything in to save time" }, { key: "b", text: "Remove confidential and personal details, and keep a human review of the output" }, { key: "c", text: "Use your personal AI account so it's separate from work" }] });

  // Module 6
  S.push({ type: "divider", module: 6, mins: "5 minutes", title: MODULE_TITLES[5], intro: "How to recognise when something has gone wrong — and why reporting early matters more than being certain.", points: ["Security, privacy and AI incidents — and near misses", "Everyday examples to recognise", "The right steps when you've clicked something"] });
  S.push({
    type: "content", module: 6, kicker: "RECOGNISE IT", title: "What counts as an incident", intro: "",
    blocks: [bul("", [
      { h: "Security incident —", t: "anything that could compromise our information or systems." },
      { h: "Privacy incident —", t: "personal information accessed, shared or lost when it shouldn't be." },
      { h: "AI-related incident —", t: "AI used unsafely, or producing harmful or incorrect output that affects work." },
      { h: "Near miss —", t: "it almost happened. Still worth reporting — it helps prevent the real thing." },
    ]), cards(3, [
      { tag: "EXAMPLE", color: "#2f6fb0", title: "Lost laptop or phone", items: [] },
      { tag: "EXAMPLE", color: "#2f6fb0", title: "A phishing email received", items: [] },
      { tag: "EXAMPLE", color: "#2f6fb0", title: "Customer information disclosed", items: [] },
      { tag: "EXAMPLE", color: "#2f6fb0", title: "A misdirected email", items: [] },
      { tag: "EXAMPLE", color: "#2f6fb0", title: "Suspicious AI behaviour", items: [] },
      { tag: "EXAMPLE", color: "#2f6fb0", title: "Unauthorised access", items: [] },
    ])],
  });
  S.push({
    type: "content", module: 6, kicker: "REPORT EARLY", title: "When in doubt, report", intro: "",
    blocks: [ban("When in doubt, report. It is always better to raise something that turns out to be nothing than to stay silent about something that matters."), bul("", [
      { h: "Early reporting limits harm —", t: "the sooner we know, the more we can do." },
      { h: "You won't be blamed —", t: "for reporting in good faith. Reporting is the right thing to do." },
      { h: "How to report —", t: "contact IT / Security or the ISMS team immediately, and follow their guidance." },
    ])],
  });
  S.push({ type: "question", module: 6, variant: "scenario", id: "sc4", context: "You clicked a link in a suspicious email and entered your username and password before realising it looked wrong.", prompt: "What are the correct steps now?", correctKey: "c", explainRight: "Report it to IT / Security immediately, change your password, and follow their guidance. Fast reporting lets us protect your account and contain any damage.", explainWrong: "Waiting or quietly changing your password isn't enough — your credentials may already be compromised. Report immediately, change your password, and follow IT / Security's guidance.", options: [{ key: "a", text: "Wait and see if anything bad happens" }, { key: "b", text: "Quietly change your password and move on" }, { key: "c", text: "Report to IT / Security immediately, change your password, and follow their guidance" }] });
  S.push({ type: "question", module: 6, variant: "check", id: "kc6", prompt: "You notice something that might be a security or privacy issue, but you're not certain. What should you do?", correctKey: "c", explainRight: "When in doubt, report. You don't need to be sure — raising it lets the right people assess it.", explainWrong: "Don't wait for certainty or for someone else to act. When in doubt, report it.", options: [{ key: "a", text: "Ignore it unless you're completely certain" }, { key: "b", text: "Wait to see if someone else reports it" }, { key: "c", text: "Report it — when in doubt, report" }] });

  return S;
}

function buildQuestions(): FinalQuestion[] {
  return [
    { section: "Information Handling", prompt: "A document contains customer account records. How should it be classified?", correct: "d", explain: "Customer records are among our most sensitive data and must be classified Restricted — the highest level of protection.", options: [{ key: "a", text: "Public" }, { key: "b", text: "Internal" }, { key: "c", text: "Confidential" }, { key: "d", text: "Restricted" }] },
    { section: "Information Handling", prompt: "A colleague from another team asks for a full customer list \"just to have it on hand.\" What's the best response?", correct: "c", explain: "Need-to-know applies even internally. Decline the open-ended request and direct them to ask the data owner for the specific information they actually need.", options: [{ key: "a", text: "Share it — you're both employees" }, { key: "b", text: "Share it if they ask nicely" }, { key: "c", text: "Decline, and direct them to request the specific data they need from the data owner" }, { key: "d", text: "Forward it to your manager to send on" }] },
    { section: "Privacy", prompt: "Which of these is personal information?", correct: "b", explain: "An employee's home address and phone number can identify a specific person, so it is personal information. Public materials and the office address are not.", options: [{ key: "a", text: "A published company press release" }, { key: "b", text: "An employee's home address and phone number" }, { key: "c", text: "The office street address on the website" }, { key: "d", text: "A product brochure" }] },
    { section: "Privacy", prompt: "You discover you can open an HR folder you were never meant to access. What should you do?", correct: "c", explain: "Don't browse or copy anything. Report the access issue so it can be corrected — looking through it would be unauthorised access.", options: [{ key: "a", text: "Have a quick look to confirm what's there" }, { key: "b", text: "Download a copy in case you need it" }, { key: "c", text: "Report the access issue and don't open the files" }, { key: "d", text: "Mention it to a colleague and leave it" }] },
    { section: "Phishing & Social Engineering", prompt: "A supplier emails new bank details for an outstanding invoice, marked urgent. What's the best action?", correct: "c", explain: "Changed bank details with urgency is a classic business email compromise. Verify by calling a number you already have on file before changing anything.", options: [{ key: "a", text: "Pay quickly to avoid a late fee" }, { key: "b", text: "Reply to the email to confirm it's genuine" }, { key: "c", text: "Verify via a phone number you already have before changing any details" }, { key: "d", text: "Forward it straight to finance to pay" }] },
    { section: "Phishing & Social Engineering", prompt: "The \"CEO\" texts you to urgently buy gift cards and keep it confidential. What does this indicate?", correct: "b", explain: "Urgency, secrecy, an unusual payment method, and senior authority are hallmarks of executive impersonation. It is not a genuine request.", options: [{ key: "a", text: "A genuine urgent request from leadership" }, { key: "b", text: "An executive impersonation scam" }, { key: "c", text: "A normal procurement process" }, { key: "d", text: "A routine IT systems test" }] },
    { section: "Phishing & Social Engineering", prompt: "On a video call, a \"manager\" asks you to transfer funds. The voice and video seem slightly off. What's the best step?", correct: "c", explain: "Deepfakes can fake a face and voice. Don't treat the call as proof of identity — pause and verify the request through a separate, trusted channel.", options: [{ key: "a", text: "Comply — the video proves it's really them" }, { key: "b", text: "Transfer the funds and confirm afterwards" }, { key: "c", text: "Pause and verify the request through a separate, trusted channel" }, { key: "d", text: "Ignore it completely and say nothing" }] },
    { section: "Passwords & MFA", prompt: "Which is the strongest approach to passwords?", correct: "c", explain: "A long, unique passphrase kept in the approved password manager is both strong and practical — far better than short complex strings or reused passwords.", options: [{ key: "a", text: "A short complex password like \"P@ss1!\"" }, { key: "b", text: "One strong password reused everywhere" }, { key: "c", text: "A long, unique passphrase stored in a password manager" }, { key: "d", text: "Your pet's name plus the current year" }] },
    { section: "Passwords & MFA", prompt: "Why does multi-factor authentication (MFA) matter?", correct: "c", explain: "MFA adds a second check, so a stolen password alone is not enough for an attacker to get in. It does not replace your password.", options: [{ key: "a", text: "It removes the need to have a password" }, { key: "b", text: "It makes logging in faster" }, { key: "c", text: "It adds a second check, so a stolen password alone isn't enough" }, { key: "d", text: "It's only needed for system administrators" }] },
    { section: "Passwords & MFA", prompt: "An MFA prompt appears on your phone that you did not request. What should you do?", correct: "c", explain: "An unexpected prompt may mean someone has your password and is trying to get in. Deny it and report it as possible credential theft — never approve to make it stop.", options: [{ key: "a", text: "Approve it to clear the notification" }, { key: "b", text: "Approve it a few times until it stops" }, { key: "c", text: "Deny it and report it as possible credential theft" }, { key: "d", text: "Ignore it and carry on" }] },
    { section: "Responsible AI Use", prompt: "You'd like help drafting a summary of a customer contract using an AI tool. What's appropriate?", correct: "b", explain: "Use only an approved tool, and remove confidential and personal details first — or follow the specific guidance in the AI policy. Never paste sensitive documents into any AI tool.", options: [{ key: "a", text: "Paste the full contract into any AI tool" }, { key: "b", text: "Use only an approved tool, and remove confidential and personal details first" }, { key: "c", text: "Upload it to your personal AI account" }, { key: "d", text: "It's fine — AI tools keep everything private" }] },
    { section: "Responsible AI Use", prompt: "An approved AI tool gives you a confident answer to use with a customer. What must you do?", correct: "b", explain: "AI can be confidently wrong. Apply human review and verify the content before you rely on it or send it on — you remain accountable for the output.", options: [{ key: "a", text: "Send it as-is — AI is accurate" }, { key: "b", text: "Review and verify it yourself before using it" }, { key: "c", text: "Never use AI output for anything" }, { key: "d", text: "Assume it's correct if it sounds right" }] },
    { section: "Incident Reporting", prompt: "Which of these is a reportable incident?", correct: "b", explain: "Sending a spreadsheet of customer data to the wrong external email is a privacy incident and must be reported. The other options are normal activities.", options: [{ key: "a", text: "You finished a task ahead of schedule" }, { key: "b", text: "You sent a spreadsheet of customer data to the wrong external email" }, { key: "c", text: "You took a coffee break" }, { key: "d", text: "You updated your password" }] },
    { section: "Incident Reporting", prompt: "You clicked a link in a suspicious email and entered your password. What now?", correct: "c", explain: "Report it immediately to IT / Security and follow their guidance. Fast reporting lets the team protect your account and contain any harm.", options: [{ key: "a", text: "Say nothing and hope it's fine" }, { key: "b", text: "Change your password sometime later" }, { key: "c", text: "Report it immediately to IT / Security and follow their guidance" }, { key: "d", text: "Just delete the email" }] },
  ];
}

function shuffle<T>(a: T[]): T[] {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[x[i], x[j]] = [x[j], x[i]]; }
  return x;
}
function genId(): string {
  let s = ""; const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)];
  return "SPA-2026-" + s;
}
function fmtDate(d: Date): string { return d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }); }
function fmtDuration(ms: number): string { const s = Math.max(1, Math.round(ms / 1000)); const m = Math.floor(s / 60); const r = s % 60; return m > 0 ? `${m}m ${r}s` : `${r}s`; }

const SECTION_IDS = ["overview", "details", "objectives", "module-1", "module-2", "module-3", "module-4", "module-5", "module-6", "assessment"];

// ---------- Component ----------
export default function TrainingAwareness({ companyName = "Meeco", trainingVersion = "v2026.1", passMark = 75, accent = "#E51E3C" }: TrainingAwarenessProps) {
  const screens = useMemo(buildScreens, []);
  const questions = useMemo(buildQuestions, []);
  const aOrder = useMemo(() => questions.map(q => shuffle(q.options)), [questions]);

  const [form, setForm] = useState({ name: "", email: "", dept: "" });
  const [detailsError, setDetailsError] = useState("");
  const [kc, setKc] = useState<Record<string, string>>({});
  const [phish, setPhish] = useState<Record<string, Record<string, boolean>>>({});
  const [phishReveal, setPhishReveal] = useState<Record<string, boolean>>({});
  const [aAns, setAAns] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [tStart] = useState(Date.now());
  const [tEnd, setTEnd] = useState<number | null>(null);
  const [completionId, setCompletionId] = useState("");
  const [activeId, setActiveId] = useState("overview");
  const [reached, setReached] = useState(0);
  const [copied, setCopied] = useState(false);

  const rafRef = useRef<number | null>(null);

  const allSectionIds = useCallback(() => (submitted ? [...SECTION_IDS, "results"] : SECTION_IDS), [submitted]);

  const updateSpy = useCallback(() => {
    const ids = allSectionIds();
    const line = Math.max(120, window.innerHeight * 0.3);
    let activeIdx = 0;
    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(ids[i]);
      if (el && el.getBoundingClientRect().top <= line) activeIdx = i;
    }
    setActiveId(ids[activeIdx]);
    setReached(r => Math.max(r, activeIdx));
  }, [allSectionIds]);

  useEffect(() => {
    let lastY = -1;
    const tick = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (y !== lastY) { lastY = y; updateSpy(); }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    updateSpy();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 18; window.scrollTo({ top: y, behavior: "smooth" }); }
  };

  const formValid = () => !!(form.name.trim() && /.+@.+\..+/.test(form.email) && form.dept);

  const onBegin = () => scrollTo("details");
  const detailsNext = () => {
    if (!form.name.trim()) return setDetailsError("Please enter your full name.");
    if (!/.+@.+\..+/.test(form.email)) return setDetailsError("Please enter a valid work email address.");
    if (!form.dept) return setDetailsError("Please select your department.");
    setDetailsError("");
    scrollTo("objectives");
  };
  const startModules = () => scrollTo("module-1");
  const answer = (id: string, key: string) => { if (kc[id] != null) return; setKc(s => ({ ...s, [id]: key })); };
  const toggleFlag = (sid: string, fid: string) => setPhish(s => ({ ...s, [sid]: { ...(s[sid] || {}), [fid]: true } }));
  const revealPhish = (sid: string) => setPhishReveal(s => ({ ...s, [sid]: true }));
  const pickA = (idx: number, key: string) => { if (submitted) return; setAAns(s => ({ ...s, [idx]: key })); };
  const answeredCount = Object.keys(aAns).length;
  const allAns = answeredCount === 14;
  const submitAssessment = () => {
    if (!allAns) return;
    setSubmitted(true); setTEnd(Date.now()); setCompletionId(genId());
    setTimeout(() => scrollTo("results"), 80);
  };
  const retry = () => { setSubmitted(false); setAAns({}); setTEnd(null); scrollTo("assessment"); };
  const doPrint = () => window.print();

  // ---------- derived ----------
  const buildPhish = (s: PhishScreen) => {
    const got = phish[s.id] || {}; const revealed = !!phishReveal[s.id];
    const ids = ["from", "subj", "greet", "bank", "link", "threat"];
    const isF = (id: string) => got[id] || revealed;
    const found = ids.filter(isF).length;
    const complete = found === 6;
    return { isF, found, pct: Math.round((found / 6) * 100) + "%", complete, hint: complete ? "You found all six red flags." : found === 0 ? "Click anything that looks suspicious — the sender, the tone, the link, and more." : `Keep looking — there are ${6 - found} more to find.` };
  };

  const moduleDone = (num: number) => screens.filter(s => s.module === num).every(s => {
    if (s.type === "question") return kc[s.id] != null;
    if (s.type === "phish") return buildPhish(s).found === 6;
    return true;
  });

  const progress = () => {
    let total = 0, done = 0;
    screens.forEach(s => {
      if (s.type === "question") { total++; if (kc[s.id] != null) done++; }
      if (s.type === "phish") { total++; if (buildPhish(s).found === 6) done++; }
    });
    total += 14; done += answeredCount;
    return Math.round((done / total) * 100);
  };

  const results = () => {
    let correct = 0; const incorrect: { idx: number; q: FinalQuestion }[] = [];
    questions.forEach((q, idx) => { if (aAns[idx] === q.correct) correct++; else incorrect.push({ idx, q }); });
    const pct = Math.round((correct / questions.length) * 100);
    return { correct, pct, passed: pct >= passMark, incorrect };
  };

  // ---------- shared style helpers ----------
  const optStyle = (state: string): React.CSSProperties => {
    const base: React.CSSProperties = { display: "flex", gap: 12, alignItems: "center", width: "100%", padding: "13px 15px", border: "1.5px solid #E3DADB", borderRadius: 12, background: "#fff", cursor: "pointer", fontSize: 14.5, color: "#3A3436", fontFamily: "inherit", transition: "all .15s", textAlign: "left" };
    if (state === "selected") return { ...base, borderColor: accent, background: "#FCE9EB" };
    if (state === "correct") return { ...base, borderColor: "#1f7a52", background: "#eaf5ee", cursor: "default" };
    if (state === "wrong") return { ...base, borderColor: "#b23a3a", background: "#fbece9", cursor: "default" };
    if (state === "dim") return { ...base, opacity: 0.55, cursor: "default" };
    return base;
  };
  const badgeStyle = (state: string): React.CSSProperties => {
    const base: React.CSSProperties = { width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, flex: "none", fontFamily: "'IBM Plex Mono',monospace" };
    if (state === "correct") return { ...base, background: "#1f7a52", color: "#fff" };
    if (state === "wrong") return { ...base, background: "#b23a3a", color: "#fff" };
    if (state === "selected") return { ...base, background: accent, color: "#fff" };
    return { ...base, background: "#EFE7E8", color: "#8F8688" };
  };
  const cta: React.CSSProperties = { padding: "13px 30px", borderRadius: 11, border: "none", fontSize: 15, fontWeight: 600, color: "#fff", background: accent, cursor: "pointer", fontFamily: "inherit" };
  const ghost: React.CSSProperties = { padding: "11px 20px", borderRadius: 10, border: "1px solid #E3DADB", background: "#fff", color: "#4A4345", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
  const inputStyle: React.CSSProperties = { padding: "11px 13px", borderRadius: 9, border: "1.5px solid #D9D0D1", fontSize: 14.5, fontFamily: "inherit", color: "#3A3436", background: "#fff", outline: "none", width: "100%" };

  // ---------- block renderer ----------
  const renderBlock = (blk: Block, i: number) => {
    if ("isCards" in blk) return (
      <div key={i} style={{ display: "grid", gridTemplateColumns: blk.gridCols, gap: 12 }}>
        {blk.cards.map((c, ci) => (
          <div key={ci} style={{ background: "#fff", border: "1px solid #EAE3E4", borderTop: `4px solid ${c.color}`, borderRadius: 12, padding: "15px 15px 14px" }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, letterSpacing: ".12em", fontWeight: 600, color: c.color }}>{c.tag}</div>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: "#1A1A1A", margin: "6px 0 9px", lineHeight: 1.25 }}>{c.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {c.items.map((it, ii) => <div key={ii} style={{ fontSize: 12.5, color: "#5B5458", lineHeight: 1.4 }}>{it}</div>)}
            </div>
          </div>
        ))}
      </div>
    );
    if ("isBullets" in blk) return (
      <div key={i}>
        {blk.title && <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A", marginBottom: 11 }}>{blk.title}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {blk.items.map((b, bi) => (
            <div key={bi} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: accent, marginTop: 7, flex: "none" }} />
              <div style={{ fontSize: 14.5, lineHeight: 1.45 }}><span style={{ fontWeight: 600, color: "#1A1A1A" }}>{b.h}</span> <span style={{ color: "#5B5458" }}>{b.t}</span></div>
            </div>
          ))}
        </div>
      </div>
    );
    if ("isColumns" in blk) return (
      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "#fff", border: "1px solid #EAE3E4", borderRadius: 12, padding: "15px 16px" }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".1em", fontWeight: 600, color: blk.leftAccent, marginBottom: 10 }}>{blk.leftTitle}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {blk.left.map((li, li_i) => <div key={li_i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}><div style={{ color: blk.leftAccent, fontWeight: 700, fontSize: 13, flex: "none" }}>{blk.leftMark}</div><div style={{ fontSize: 13, color: "#4A4345", lineHeight: 1.4 }}>{li}</div></div>)}
          </div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #EAE3E4", borderRadius: 12, padding: "15px 16px" }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".1em", fontWeight: 600, color: blk.rightAccent, marginBottom: 10 }}>{blk.rightTitle}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {blk.right.map((ri, ri_i) => <div key={ri_i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}><div style={{ color: blk.rightAccent, fontWeight: 700, fontSize: 13, flex: "none" }}>{blk.rightMark}</div><div style={{ fontSize: 13, color: "#4A4345", lineHeight: 1.4 }}>{ri}</div></div>)}
          </div>
        </div>
      </div>
    );
    if ("isCallout" in blk) return (
      <div key={i} style={{ background: blk.tint, borderLeft: `4px solid ${blk.accentC}`, borderRadius: "0 10px 10px 0", padding: "14px 18px" }}>
        {blk.title && <div style={{ fontWeight: 600, color: "#1A1A1A", marginBottom: 4, fontSize: 14.5 }}>{blk.title}</div>}
        <div style={{ color: "#4A4345", fontSize: 13.5, lineHeight: 1.5 }}>{blk.text}</div>
      </div>
    );
    if ("isBanner" in blk) return (
      <div key={i} style={{ background: "#1A1A1A", color: "#fff", borderRadius: 12, padding: "16px 20px", fontSize: 15.5, fontWeight: 600, lineHeight: 1.4 }}>{blk.text}</div>
    );
    return null;
  };

  // ---------- question / phish renderers ----------
  const renderQuestion = (s: QuestionScreen) => {
    const sel = kc[s.id]; const answered = sel != null;
    const good = sel === s.correctKey;
    return (
      <div style={{ marginBottom: 32, maxWidth: 840, background: "#fff", border: "1px solid #ECE4E5", borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FCE9EB", borderRadius: 20, padding: "5px 13px", marginBottom: 13 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: accent }} />
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".12em", fontWeight: 600, color: accent }}>{s.variant === "scenario" ? "SCENARIO" : "KNOWLEDGE CHECK"}</span>
        </div>
        {s.context && <div style={{ background: "#FBF7F7", border: "1px solid #ECE4E5", borderRadius: 12, padding: "14px 16px", marginBottom: 14, fontSize: 14, color: "#4A4345", lineHeight: 1.55 }}>{s.context}</div>}
        <h3 style={{ fontSize: 19, fontWeight: 700, color: "#1A1A1A", margin: "0 0 14px", lineHeight: 1.3 }}>{s.prompt}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {s.options.map((o, idx) => {
            const letter = "ABCD"[idx]; const isSel = sel === o.key; const isCorr = o.key === s.correctKey;
            let st = "idle", badge: string = letter;
            if (answered) { if (isCorr) { st = "correct"; badge = "✓"; } else if (isSel) { st = "wrong"; badge = "✕"; } else st = "dim"; }
            return (
              <button key={o.key} onClick={answered ? undefined : () => answer(s.id, o.key)} style={optStyle(st)}>
                <div style={badgeStyle(st)}>{badge}</div>
                <div style={{ flex: 1, textAlign: "left", lineHeight: 1.4 }}>{o.text}</div>
              </button>
            );
          })}
        </div>
        {answered && (
          <div style={{ background: good ? "#eaf5ee" : "#fbece9", borderRadius: 12, padding: "14px 16px", marginTop: 14, borderLeft: `4px solid ${good ? "#1f7a52" : "#b23a3a"}` }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".12em", fontWeight: 600, color: good ? "#1f7a52" : "#b23a3a", marginBottom: 5 }}>{good ? "CORRECT" : "NOT QUITE"}</div>
            <div style={{ fontSize: 13.5, color: "#4A4345", lineHeight: 1.5 }}>{good ? s.explainRight : s.explainWrong}</div>
          </div>
        )}
      </div>
    );
  };

  const renderPhish = (s: PhishScreen) => {
    const { isF, found, pct, complete, hint } = buildPhish(s);
    const tagStyle = (f: boolean): React.CSSProperties => ({ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, fontWeight: 600, color: f ? "#b23a3a" : "#4A4345", background: f ? "#fbece9" : "transparent", border: "none", padding: "3px 5px", borderRadius: 5, cursor: "pointer", textAlign: "left", textDecoration: f ? "line-through" : "none" });
    const subjStyle = (f: boolean): React.CSSProperties => ({ display: "block", marginTop: 6, fontSize: 14, fontWeight: 700, color: f ? "#b23a3a" : "#1A1A1A", background: f ? "#fbece9" : "transparent", border: "none", padding: "3px 5px", borderRadius: 5, cursor: "pointer", textAlign: "left", width: "100%" });
    const lineStyle = (f: boolean): React.CSSProperties => ({ fontSize: 13.5, color: f ? "#b23a3a" : "#4A4345", background: f ? "#fbece9" : "transparent", border: "none", padding: "2px 5px", borderRadius: 5, cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontWeight: f ? 600 : 400 });
    const inlineStyle = (f: boolean): React.CSSProperties => ({ fontSize: 13.5, color: f ? "#b23a3a" : "#2f6fb0", background: f ? "#fbece9" : "transparent", border: "none", padding: "0 3px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, textDecoration: "underline" });
    const linkStyle = (f: boolean): React.CSSProperties => ({ fontSize: 13, color: f ? "#b23a3a" : "#2f6fb0", background: f ? "#fbece9" : "#FCE9EB", border: `1px solid ${f ? "#eccac4" : "#F7D3D9"}`, padding: "8px 10px", borderRadius: 8, cursor: "pointer", textAlign: "left", fontFamily: "'IBM Plex Mono',monospace", wordBreak: "break-all" });
    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".16em", color: accent, fontWeight: 600 }}>{s.kicker}</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A", margin: "7px 0 5px" }}>{s.title}</h3>
          <div style={{ color: "#5B5458", fontSize: 14, lineHeight: 1.5, maxWidth: 760 }}>{s.intro}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18, alignItems: "start" }}>
          <div style={{ border: "1px solid #E8DFE0", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
            <div style={{ padding: "13px 16px", borderBottom: "1px solid #EFE7E8", background: "#FBF7F7" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <button onClick={() => toggleFlag(s.id, "from")} style={tagStyle(isF("from"))}>{s.from}</button>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "#9A9295" }}>{s.time}</div>
              </div>
              <button onClick={() => toggleFlag(s.id, "subj")} style={subjStyle(isF("subj"))}>{s.subject}</button>
            </div>
            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 11, fontSize: 13.5, color: "#4A4345", lineHeight: 1.5 }}>
              <button onClick={() => toggleFlag(s.id, "greet")} style={lineStyle(isF("greet"))}>{s.greeting}</button>
              <div>Please find attached our latest invoice. Note our <button onClick={() => toggleFlag(s.id, "bank")} style={inlineStyle(isF("bank"))}>bank account details have changed</button> — pay to the new account below.</div>
              <button onClick={() => toggleFlag(s.id, "link")} style={linkStyle(isF("link"))}>View invoice → http://secure-pay-portal.account-verify.ru</button>
              <button onClick={() => toggleFlag(s.id, "threat")} style={lineStyle(isF("threat"))}>If payment is not received within 2 hours your account will be suspended.</button>
              <div style={{ color: "#8F8688", fontSize: 12.5 }}>Regards,<br />Accounts Team</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ border: "1px solid #E8DFE0", borderRadius: 12, padding: "15px 16px", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>Red flags found</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, fontWeight: 600, color: accent }}>{found} / 6</div>
              </div>
              <div style={{ height: 6, background: "#EFE7E8", borderRadius: 4, marginTop: 9, overflow: "hidden" }}><div style={{ height: "100%", width: pct, background: accent, transition: "width .25s" }} /></div>
              <div style={{ fontSize: 12.5, color: "#5B5458", lineHeight: 1.45, marginTop: 11 }}>{hint}</div>
              {!complete && <button onClick={() => revealPhish(s.id)} style={{ marginTop: 12, background: "transparent", border: "1px solid #E3DADB", color: "#5B5458", fontSize: 12.5, fontWeight: 600, padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>Reveal remaining flags</button>}
            </div>
            {complete && (
              <div style={{ background: "#e4f3ec", borderLeft: "4px solid #1f7a52", borderRadius: "0 10px 10px 0", padding: "13px 16px" }}>
                <div style={{ fontWeight: 600, color: "#1A1A1A", fontSize: 13.5, marginBottom: 3 }}>That's all six.</div>
                <div style={{ fontSize: 12.5, color: "#4A4345", lineHeight: 1.5 }}>Mismatched sender, urgency and threats, generic greeting, changed bank details, and a suspicious link — never act on a message like this. Verify through a channel you already trust.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderModule = (num: number) => {
    const scr = screens.filter(s => s.module === num);
    const d = scr.find((s): s is DividerScreen => s.type === "divider")!;
    const rest = scr.filter(s => s.type !== "divider");
    return (
      <section key={num} id={`module-${num}`} style={{ scrollMarginTop: 24, marginTop: 62, paddingTop: 40, borderTop: "1px solid #E8DFE0" }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5, letterSpacing: ".16em", color: accent, fontWeight: 600 }}>MODULE {num} · {d.mins}</div>
        <h2 style={{ fontSize: 30, fontWeight: 700, color: "#1A1A1A", letterSpacing: "-.02em", margin: "12px 0 10px", lineHeight: 1.12 }}>{d.title}</h2>
        <div style={{ color: "#5B5458", fontSize: 15.5, lineHeight: 1.55, marginBottom: 16, maxWidth: 720 }}>{d.intro}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 30 }}>
          {d.points.map((p, pi) => (
            <div key={pi} style={{ display: "flex", gap: 11, alignItems: "center" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent, flex: "none" }} />
              <div style={{ fontSize: 14, color: "#5B5458" }}>{p}</div>
            </div>
          ))}
        </div>
        {rest.map((u, ui) => {
          if (u.type === "content") return (
            <div key={ui} style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".16em", color: accent, fontWeight: 600 }}>{u.kicker}</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A", margin: "7px 0 6px", letterSpacing: "-.01em" }}>{u.title}</h3>
              {u.intro && <div style={{ color: "#5B5458", fontSize: 14.5, lineHeight: 1.5, maxWidth: 780, marginBottom: 14 }}>{u.intro}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
                {u.blocks.map((blk, bi) => renderBlock(blk, bi))}
              </div>
            </div>
          );
          if (u.type === "question") return <React.Fragment key={ui}>{renderQuestion(u)}</React.Fragment>;
          if (u.type === "phish") return <React.Fragment key={ui}>{renderPhish(u)}</React.Fragment>;
          return null;
        })}
      </section>
    );
  };

  const renderFinalQ = (idx: number) => {
    const q = questions[idx]; const sel = aAns[idx]; const sub = submitted;
    const good = sel === q.correct;
    return (
      <div key={idx} style={{ border: "1px solid #ECE4E5", borderRadius: 14, padding: "19px 22px", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".1em", fontWeight: 600, color: "#fff", background: accent, padding: "4px 9px", borderRadius: 6 }}>Q{idx + 1}</span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, letterSpacing: ".08em", color: "#9A9295" }}>{q.section}</span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", margin: "0 0 13px", lineHeight: 1.32 }}>{q.prompt}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {aOrder[idx].map((opt, k) => {
            const isSel = sel === opt.key; const isCorr = opt.key === q.correct;
            let st = "idle", badge = "ABCD"[k];
            if (sub) { if (isCorr) { st = "correct"; badge = "✓"; } else if (isSel) { st = "wrong"; badge = "✕"; } else st = "dim"; }
            else if (isSel) st = "selected";
            return (
              <button key={opt.key} onClick={sub ? undefined : () => pickA(idx, opt.key)} style={optStyle(st)}>
                <div style={badgeStyle(st)}>{badge}</div>
                <div style={{ flex: 1, textAlign: "left", lineHeight: 1.4 }}>{opt.text}</div>
              </button>
            );
          })}
        </div>
        {sub && (
          <div style={{ background: good ? "#eaf5ee" : "#fbece9", borderRadius: 12, padding: "13px 15px", marginTop: 13, borderLeft: `4px solid ${good ? "#1f7a52" : "#b23a3a"}` }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".12em", fontWeight: 600, color: good ? "#1f7a52" : "#b23a3a", marginBottom: 5 }}>{good ? "CORRECT" : "NOT QUITE"}</div>
            <div style={{ fontSize: 13.5, color: "#4A4345", lineHeight: 1.5 }}>{q.explain}</div>
          </div>
        )}
      </div>
    );
  };

  // ---------- nav items ----------
  const navItems = () => {
    const base = [
      { id: "overview", tag: "00", label: "Overview", done: reached >= 1 },
      { id: "details", tag: "01", label: "Your details", done: formValid() },
      { id: "objectives", tag: "02", label: "What you'll learn", done: reached >= 3 },
    ];
    MODULE_TITLES.forEach((t, i) => base.push({ id: `module-${i + 1}`, tag: `M${i + 1}`, label: t, done: moduleDone(i + 1) }));
    base.push({ id: "assessment", tag: "AS", label: "Final assessment", done: submitted });
    if (submitted) base.push({ id: "results", tag: "★", label: "Your result", done: true });
    return base;
  };

  // ---------- computed for footer/results ----------
  const r = results();
  const date = fmtDate(new Date());
  const timeSpent = fmtDuration((tEnd || Date.now()) - tStart);
  const passed = r.passed;
  const color = passed ? "#1f7a52" : "#b23a3a";
  const areas = Array.from(new Set(r.incorrect.map(m => m.q.section)));
  const followUp = passed ? (areas.length ? `Recommended: a quick refresher on — ${areas.join("; ")}.` : "No follow-up required.") : `Required: review the modules covering — ${areas.join("; ")} — and retake the assessment.`;
  const reportRows = [
    { k: "Employee name", v: form.name || "—" }, { k: "Employee email", v: form.email || "—" }, { k: "Department", v: form.dept || "—" },
    { k: "Date completed", v: date }, { k: "Assessment score", v: `${r.correct} / 14  (${r.pct}%)` }, { k: "Pass / Fail", v: passed ? "PASS" : "FAIL" },
    { k: "Completion ID", v: completionId }, { k: "Training version", v: trainingVersion }, { k: "Time spent", v: timeSpent },
    { k: "Incorrect questions", v: r.incorrect.length === 0 ? "None" : r.incorrect.map(m => `Q${m.idx + 1}`).join(", ") },
    { k: "Areas to improve", v: areas.length ? areas.join("; ") : "None" },
  ];
  const emailBody = [
    "Security, Privacy and AI Awareness Training — Results", "",
    `Employee name:     ${form.name || "—"}`,
    `Department:         ${form.dept || "—"}`,
    `Completion date:    ${date}`,
    `Final score:        ${r.correct} / 14 (${r.pct}%)`,
    `Result:             ${passed ? "PASS" : "FAIL"}`,
    `Completion ID:      ${completionId}`,
    `Time spent:         ${timeSpent}`,
    `Training version:   ${trainingVersion}`, "",
    "Recommended follow-up actions:", followUp, "",
    `A completion certificate ${passed ? "is available for this record." : "will be issued once the assessment is passed."}`,
  ].join("\n");
  const emailSubject = `Security, Privacy and AI Awareness Training Results – ${form.name || "Employee"}`;

  const onCopy = () => {
    const text = `To: security@meeco.me\nSubject: ${emailSubject}\n\n${emailBody}`;
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };
  const onDownload = () => {
    const lines = ["SECURITY, PRIVACY AND AI AWARENESS TRAINING", "STRUCTURED RESULTS REPORT", "=".repeat(48), ""];
    reportRows.forEach(rr => lines.push(rr.k.padEnd(22) + rr.v));
    lines.push("", "RECOMMENDED FOLLOW-UP ACTIONS", "-".repeat(48), followUp, "", "Prepared for: security@meeco.me");
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `Training-Results-${(form.name || "Employee").replace(/\s+/g, "-")}-${completionId}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7F5F5", fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif" }}>
      <aside style={{ position: "fixed", top: 0, left: 0, width: 300, height: "100vh", background: "#1A1A1A", color: "#fff", display: "flex", flexDirection: "column", padding: "24px 20px 18px", zIndex: 10 }}>
        <div style={{ flex: "none" }}>
          <img src={meecoLogo} alt="Meeco" style={{ height: 32, width: "auto", display: "block", marginBottom: 16 }} />
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: ".16em", color: "#F2A9B3", fontWeight: 600 }}>ISO/IEC 27001 · AWARENESS</div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.01em", lineHeight: 1.25, marginTop: 7 }}>Security, Privacy &amp; AI Awareness Training</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(255,255,255,.5)", marginTop: 6 }}>{companyName} · {trainingVersion}</div>
        </div>
        <div style={{ flex: "none", marginTop: 18, padding: "13px 14px", background: "rgba(255,255,255,.05)", borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.02em" }}>{progress()}<span style={{ fontSize: 14 }}>%</span></div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: ".14em", color: "rgba(255,255,255,.55)" }}>COMPLETE</div>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,.12)", borderRadius: 4, marginTop: 9, overflow: "hidden" }}><div style={{ height: "100%", width: `${progress()}%`, background: accent, borderRadius: 4, transition: "width .4s ease" }} /></div>
        </div>
        <nav style={{ flex: 1, minHeight: 0, overflowY: "auto", marginTop: 14, display: "flex", flexDirection: "column", gap: 2, paddingRight: 2 }}>
          {navItems().map(it => {
            const active = activeId === it.id;
            return (
              <button key={it.id} onClick={() => scrollTo(it.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 11px", borderRadius: 9, border: "none", cursor: "pointer", background: active ? "rgba(255,255,255,.12)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,.6)", fontFamily: "inherit", fontSize: 12.5, fontWeight: active ? 600 : 500, transition: "background .15s" }}>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: ".04em", opacity: 0.7, flex: "none", width: 24, textAlign: "left" }}>{it.tag}</span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, textAlign: "left" }}>{it.label}</span>
                <span style={{ marginLeft: "auto", width: 16, height: 16, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 700, background: it.done ? accent : "transparent", color: "#fff", border: it.done ? "none" : "1px solid rgba(255,255,255,.22)" }}>{it.done ? "✓" : ""}</span>
              </button>
            );
          })}
        </nav>
        <div style={{ flex: "none", marginTop: 12, paddingTop: 13, borderTop: "1px solid rgba(255,255,255,.1)", fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>{form.name ? `Signed in · ${form.name}` : "Not signed in yet"}</div>
      </aside>

      <main style={{ marginLeft: 300, flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "46px 48px 110px" }}>

          {/* OVERVIEW */}
          <section id="overview" style={{ scrollMarginTop: 24 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: ".2em", color: accent, fontWeight: 600 }}>ISO/IEC 27001 · ANNUAL AWARENESS TRAINING</div>
            <h1 style={{ fontSize: 40, lineHeight: 1.08, fontWeight: 700, color: "#1A1A1A", letterSpacing: "-.02em", margin: "16px 0 0" }}>Security, Privacy &amp; AI Awareness Training</h1>
            <div style={{ fontSize: 17, color: "#5B5458", marginTop: 14, lineHeight: 1.5, maxWidth: 640 }}>A short, practical course on protecting information, spotting scams, and using approved AI tools responsibly — for everyone at {companyName}. Work through each module top to bottom; your progress is tracked on the left.</div>
            <div style={{ display: "flex", gap: 26, marginTop: 28, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><div style={{ fontSize: 21, fontWeight: 700, color: "#1A1A1A" }}>~30 min</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: ".12em", color: "#8F8688" }}>DURATION</div></div>
              <div style={{ width: 1, background: "#E8DFE0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><div style={{ fontSize: 21, fontWeight: 700, color: "#1A1A1A" }}>6 modules</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: ".12em", color: "#8F8688" }}>+ ASSESSMENT</div></div>
              <div style={{ width: 1, background: "#E8DFE0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><div style={{ fontSize: 21, fontWeight: 700, color: "#1A1A1A" }}>{passMark}% to pass</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: ".12em", color: "#8F8688" }}>14 QUESTIONS</div></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 30 }}>
              <button onClick={onBegin} style={cta}>Begin Training</button>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#8F8688" }}>Mandatory · Your completion is recorded</div>
            </div>
          </section>

          {/* DETAILS */}
          <section id="details" style={{ scrollMarginTop: 24, marginTop: 62, paddingTop: 40, borderTop: "1px solid #E8DFE0" }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, letterSpacing: ".18em", color: accent, fontWeight: 600 }}>BEFORE YOU START</div>
            <h2 style={{ fontSize: 27, fontWeight: 700, color: "#1A1A1A", margin: "9px 0 6px" }}>Your details</h2>
            <div style={{ color: "#5B5458", fontSize: 14.5, lineHeight: 1.5, marginBottom: 20, maxWidth: 600 }}>These appear on your completion certificate and on the records sent to the ISMS team. Please use your real name and work email.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 520 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#4A4345" }}>Full name</span>
                <input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} placeholder="e.g. Alex Taylor" style={inputStyle} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#4A4345" }}>Work email</span>
                <input value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} placeholder="e.g. alex.taylor@meeco.me" style={inputStyle} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#4A4345" }}>Department</span>
                <select value={form.dept} onChange={e => setForm(s => ({ ...s, dept: e.target.value }))} style={inputStyle}>
                  <option value="">Select your department…</option>
                  {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
            </div>
            {detailsError && <div style={{ marginTop: 12, color: "#b23a3a", fontSize: 13 }}>{detailsError}</div>}
            <div style={{ marginTop: 22 }}><button onClick={detailsNext} style={cta}>Save &amp; continue</button></div>
          </section>

          {/* OBJECTIVES */}
          <section id="objectives" style={{ scrollMarginTop: 24, marginTop: 62, paddingTop: 40, borderTop: "1px solid #E8DFE0" }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, letterSpacing: ".18em", color: accent, fontWeight: 600 }}>WHAT YOU'LL LEARN</div>
            <h2 style={{ fontSize: 27, fontWeight: 700, color: "#1A1A1A", margin: "9px 0 4px" }}>By the end, you'll be able to…</h2>
            <div style={{ color: "#5B5458", fontSize: 14.5, lineHeight: 1.5, marginBottom: 20, maxWidth: 720 }}>Nine everyday responsibilities that keep our customers, our people and our business protected.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px 30px" }}>
              {OBJECTIVES.map(o => (
                <div key={o.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600, color: accent, background: "#FCE9EB", borderRadius: 6, padding: "3px 7px", flex: "none", marginTop: 1 }}>{o.n}</div>
                  <div style={{ fontSize: 14.5, color: "#3A3436", lineHeight: 1.4 }}>{o.t}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24 }}><button onClick={startModules} style={cta}>Start Module 1</button></div>
          </section>

          {/* MODULES */}
          {[1, 2, 3, 4, 5, 6].map(n => renderModule(n))}

          {/* ASSESSMENT */}
          <section id="assessment" style={{ scrollMarginTop: 24, marginTop: 62, paddingTop: 40, borderTop: "1px solid #E8DFE0" }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, letterSpacing: ".18em", color: accent, fontWeight: 600 }}>FINAL ASSESSMENT</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#1A1A1A", margin: "10px 0 6px" }}>Confirm your understanding</h2>
            <div style={{ color: "#5B5458", fontSize: 14.5, lineHeight: 1.55, marginBottom: 18, maxWidth: 720 }}>Fourteen short scenarios. Choose the single best answer for each — you can change answers freely until you submit. Feedback and your result appear once you submit.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 8 }}>
              <div style={{ border: "1px solid #EAE3E4", borderRadius: 10, padding: "12px 14px" }}><div style={{ fontSize: 19, fontWeight: 700, color: "#1A1A1A" }}>14</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: ".1em", color: "#8F8688", marginTop: 2 }}>QUESTIONS</div></div>
              <div style={{ border: "1px solid #EAE3E4", borderRadius: 10, padding: "12px 14px" }}><div style={{ fontSize: 19, fontWeight: 700, color: "#1A1A1A" }}>{passMark}%</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: ".1em", color: "#8F8688", marginTop: 2 }}>TO PASS</div></div>
              <div style={{ border: "1px solid #EAE3E4", borderRadius: 10, padding: "12px 14px" }}><div style={{ fontSize: 19, fontWeight: 700, color: "#1A1A1A" }}>10–15 min</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: ".1em", color: "#8F8688", marginTop: 2 }}>TYPICAL</div></div>
              <div style={{ border: "1px solid #EAE3E4", borderRadius: 10, padding: "12px 14px" }}><div style={{ fontSize: 19, fontWeight: 700, color: "#1A1A1A" }}>{answeredCount} / 14</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: ".1em", color: "#8F8688", marginTop: 2 }}>ANSWERED</div></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 22 }}>
              {questions.map((_, idx) => renderFinalQ(idx))}
            </div>
            {!submitted && (
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 24 }}>
                <button onClick={allAns ? submitAssessment : undefined} style={allAns ? cta : { ...cta, background: "#D9D0D1", cursor: "not-allowed" }}>Submit assessment</button>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, color: "#8F8688" }}>{allAns ? "All questions answered — ready to submit." : `Answer all 14 to submit · ${answeredCount} done`}</div>
              </div>
            )}
          </section>

          {/* RESULTS */}
          {submitted && (
            <section id="results" style={{ scrollMarginTop: 24, marginTop: 62, paddingTop: 40, borderTop: "1px solid #E8DFE0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 18, borderBottom: "1px solid #EFE7E8" }}>
                <div style={{ width: 88, height: 88, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: passed ? "#eaf5ee" : "#fbece9", border: `4px solid ${color}` }}><div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{r.pct}%</div></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "inline-block", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".12em", fontWeight: 600, color: "#fff", background: color, padding: "4px 12px", borderRadius: 6 }}>{passed ? "PASS" : "NOT YET PASSED"}</div>
                  <h2 style={{ fontSize: 23, fontWeight: 700, color: "#1A1A1A", margin: "9px 0 3px" }}>{passed ? "Congratulations — you passed" : "You haven't reached the pass mark yet"}</h2>
                  <div style={{ color: "#5B5458", fontSize: 14, lineHeight: 1.5 }}>{passed ? "You've demonstrated the required awareness. Your certificate and ISMS record are below." : "Review the areas below, then retry the assessment when you're ready. You've got this."}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 26, paddingTop: 20 }}>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".12em", color: "#8F8688", marginBottom: 11 }}>RESULT SUMMARY</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {[
                      { k: "Name", v: form.name || "—" }, { k: "Department", v: form.dept || "—" },
                      { k: "Score", v: `${r.correct} / 14  (${r.pct}%)` }, { k: "Result", v: passed ? "Pass" : "Fail" },
                      { k: "Completion ID", v: completionId }, { k: "Date", v: date }, { k: "Time spent", v: timeSpent }, { k: "Version", v: trainingVersion },
                    ].map((row, ri) => <div key={ri} style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: 13.5, borderBottom: "1px dashed #ECE4E5", paddingBottom: 7 }}><span style={{ color: "#8F8688" }}>{row.k}</span><span style={{ color: "#1A1A1A", fontWeight: 600, textAlign: "right" }}>{row.v}</span></div>)}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".12em", color: "#8F8688", marginBottom: 11 }}>{r.incorrect.length === 0 ? "REVIEW" : "AREAS TO REVIEW"}</div>
                  {r.incorrect.length === 0 ? (
                    <div style={{ background: "#e4f3ec", borderRadius: 10, padding: "14px 16px", fontSize: 13.5, color: "#1f5f43", lineHeight: 1.5 }}>Excellent — every question answered correctly. No follow-up needed.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {r.incorrect.map((mm, mi) => (
                        <div key={mi} style={{ background: "#fbece9", borderLeft: "3px solid #b23a3a", borderRadius: "0 8px 8px 0", padding: "10px 13px" }}>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: ".1em", color: "#b23a3a", fontWeight: 600 }}>{mm.q.section}</div>
                          <div style={{ fontSize: 12.5, color: "#4A4345", lineHeight: 1.45, marginTop: 3 }}>{mm.q.prompt}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {!passed && (
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24, paddingTop: 18, borderTop: "1px solid #EFE7E8" }}>
                  <button onClick={retry} style={cta}>Review &amp; retry assessment</button>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, color: "#8F8688" }}>Re-read the flagged areas above, then try again.</div>
                </div>
              )}

              {passed && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "30px 0 14px" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".12em", color: "#8F8688" }}>CERTIFICATE OF COMPLETION</div>
                    <button onClick={doPrint} style={ghost}>Print / Save as PDF</button>
                  </div>
                  <div id="certificate" style={{ border: "1px solid #E8DFE0", borderRadius: 14, padding: "40px 46px", background: "linear-gradient(180deg,#ffffff 0%,#FBF8F8 100%)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 10, border: "1.5px solid #E8DFE0", borderRadius: 10, pointerEvents: "none" }} />
                    <div style={{ position: "relative", textAlign: "center" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".26em", color: accent, fontWeight: 600 }}>CERTIFICATE OF COMPLETION</div>
                      <div style={{ width: 46, height: 3, background: accent, margin: "14px auto 0", borderRadius: 2 }} />
                      <div style={{ fontSize: 13, color: "#8F8688", marginTop: 24 }}>This certifies that</div>
                      <div style={{ fontSize: 30, fontWeight: 700, color: "#1A1A1A", margin: "8px 0 4px", letterSpacing: "-.01em" }}>{form.name || "[Your name]"}</div>
                      <div style={{ fontSize: 14, color: "#5B5458", maxWidth: 520, margin: "14px auto 0", lineHeight: 1.6 }}>successfully completed the <strong style={{ color: "#1A1A1A" }}>Security, Privacy &amp; AI Awareness Training</strong> for {companyName}, meeting the required standard of awareness competence.</div>
                      <div style={{ display: "flex", justifyContent: "center", gap: 42, marginTop: 28, flexWrap: "wrap" }}>
                        <div><div style={{ fontSize: 17, fontWeight: 700, color: "#1A1A1A" }}>{date}</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: ".12em", color: "#9A9295", marginTop: 3 }}>DATE COMPLETED</div></div>
                        <div style={{ width: 1, background: "#E8DFE0" }} />
                        <div><div style={{ fontSize: 17, fontWeight: 700, color: "#1f7a52" }}>{r.pct}% · PASS</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: ".12em", color: "#9A9295", marginTop: 3 }}>ASSESSMENT SCORE</div></div>
                        <div style={{ width: 1, background: "#E8DFE0" }} />
                        <div><div style={{ fontSize: 17, fontWeight: 700, color: "#1A1A1A" }}>{trainingVersion}</div><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: ".12em", color: "#9A9295", marginTop: 3 }}>TRAINING VERSION</div></div>
                      </div>
                      <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid #EFE7E8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "#9A9295" }}>CERTIFICATE ID · {completionId}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "#9A9295" }}>ISO/IEC 27001 · AWARENESS EVIDENCE</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "30px 0 14px" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".12em", color: "#8F8688" }}>ISMS RESULTS RECORD</div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={onCopy} style={ghost}>{copied ? "Copied ✓" : "Copy email"}</button>
                      <button onClick={onDownload} style={cta}>Download report (.txt)</button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <div style={{ border: "1px solid #E8DFE0", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                      <div style={{ padding: "11px 16px", background: "#1A1A1A", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#E51E3C" }} />
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".1em" }}>AUTO-PREPARED EMAIL</span>
                      </div>
                      <div style={{ padding: "15px 18px", fontSize: 13, lineHeight: 1.6 }}>
                        <div style={{ display: "flex", gap: 8 }}><span style={{ color: "#9A9295", width: 54, flex: "none" }}>To</span><span style={{ color: "#1A1A1A", fontWeight: 600 }}>security@meeco.me</span></div>
                        <div style={{ display: "flex", gap: 8 }}><span style={{ color: "#9A9295", width: 54, flex: "none" }}>Subject</span><span style={{ color: "#1A1A1A", fontWeight: 600 }}>{emailSubject}</span></div>
                        <div style={{ borderTop: "1px solid #EFE7E8", margin: "11px 0" }} />
                        <div style={{ color: "#4A4345", whiteSpace: "pre-wrap", fontSize: 12.5, lineHeight: 1.65 }}>{emailBody}</div>
                      </div>
                    </div>
                    <div style={{ border: "1px solid #E8DFE0", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                      <div style={{ padding: "11px 16px", background: "#FBF7F7", borderBottom: "1px solid #EFE7E8" }}>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: ".1em", color: "#5B5458" }}>STRUCTURED RESULTS RECORD</span>
                      </div>
                      <div style={{ padding: "6px 18px" }}>
                        {reportRows.map((rr, rri) => <div key={rri} style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: 12.5, borderBottom: "1px dashed #ECE4E5", padding: "9px 0" }}><span style={{ color: "#8F8688", flex: "none" }}>{rr.k}</span><span style={{ color: "#1A1A1A", fontWeight: 600, textAlign: "right" }}>{rr.v}</span></div>)}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#9A9295", marginTop: 14 }}>Sending happens outside this training — copy or download the record above for your ISMS evidence.</div>
                </div>
              )}
            </section>
          )}

        </div>
      </main>
    </div>
  );
}

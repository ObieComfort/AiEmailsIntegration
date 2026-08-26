import { listRecentMessages } from './graph.js';
import { labelEmail } from './claude.js';

const inboxEmail = process.env.INBOX_EMAIL
const labelOptions = ["Leads & Estimates", "Customer Service", "Service Memberships", "Staffing & Payroll",
    "Marketing & Referrals", "Jobs & Scheduling", "Billing & Payments", "Suppliers & Parts",
    "Permits & Compliance", "Vendors & Admin"]

const messages = await listRecentMessages(inboxEmail, 3);
// messages.forEach(m => console.log(m.subject));
// messages.forEach(m => console.log(m.bodyPreview));

// console.log(messages[0].subject);
// console.log(messages[0].body.content);

const email = {
    subject: messages[0].subject,
    body: messages[0].body.content
}
const label = await labelEmail(labelOptions, email);
console.log("The chosen label is: " + label);

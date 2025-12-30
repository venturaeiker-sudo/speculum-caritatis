
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  LEDGER = 'LEDGER',
  PAYMENTS = 'PAYMENTS',
  DONORS = 'DONORS',
  EVENTS = 'EVENTS',
  PROGRAMS = 'PROGRAMS',
  REPORTS = 'REPORTS',
  COMPLIANCE = 'COMPLIANCE',
  RISK = 'RISK',
  SETTINGS = 'SETTINGS'
}

export interface ProgramActivity {
  id: string;
  date: string;
  description: string;
  spent: number;
  kpiProgress: number;
}

export interface ProgramImpact {
  id: string;
  name: string;
  category: 'Health' | 'Education' | 'Infrastructure' | 'Crisis Relief';
  budget: number;
  actualSpent: number;
  targetKPI: number;
  currentKPI: number;
  kpiUnit: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  description: string;
  activities?: ProgramActivity[];
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  totalQuantity: number;
  sold: number;
  benefits: string[];
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  discountCode?: string;
  fairMarketValue?: number; // Quid Pro Quo value
}

export interface ComplianceNotificationSetting {
  emailEnabled: boolean;
  dashboardEnabled: boolean;
  smsEnabled: boolean;
  alertThresholds: number[]; // e.g. [30, 60, 90]
}

export interface SponsorshipLevel {
  id: string;
  name: string;
  minAmount: number;
  tablesIncluded: number;
  brandingRights: boolean;
  benefits: string[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  account: string;
  type: 'DEBIT' | 'CREDIT';
  memo: string;
  fund: 'Unrestricted' | 'Restricted' | 'Temporarily Restricted';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECONCILED';
  costCenter: 'Program' | 'Administration' | 'Fundraising';
}

export interface BankStatementItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'DEBIT' | 'CREDIT';
}

export interface ReconciliationMatch {
  ledgerId: string;
  bankId: string;
  confidence: number;
  reason: string;
}

export interface Donor {
  id: string;
  name: string;
  category: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalDonated: number;
  lastDonation: string;
  type: 'Individual' | 'Corporate' | 'Foundation';
  taxId?: string;
  address?: string;
  email?: string;
}

export interface ComplianceTask {
  id: string;
  state: 'NY' | 'NJ' | 'FL';
  obligation: string;
  dueDate: string;
  status: 'COMPLIANT' | 'WARNING' | 'OVERDUE';
}

export interface Event {
  id: string;
  name: string;
  date: string;
  goal: number;
  raised: number;
  ticketsSold: number;
  status: 'PLANNING' | 'LIVE' | 'COMPLETED';
  tiers?: TicketTier[];
  sponsors?: string[];
  sponsorshipLevels?: SponsorshipLevel[];
  detailedDescription?: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  occupancy: number;
  type: 'VIP' | 'Corporate' | 'Standard';
  assignedSponsor?: string;
  sponsorshipLevel?: string;
}

export interface Attendee {
  id: string;
  name: string;
  organization?: string;
  ticketType: 'Single' | 'Table Sponsor' | 'VIP';
  tableId?: string;
  checkedIn: boolean;
  dietary?: string;
  donationAmount: number;
  ticketId?: string;
}

export interface BoardReport {
  id: string;
  title: string;
  generatedAt: string;
  period: string;
  narrative: string;
  metrics: {
    label: string;
    value: string;
    trend: string;
  }[];
}

export interface AuditArchiveEntry {
  id: string;
  date: string;
  title: string;
  type: 'Financial' | 'Event' | 'Compliance' | 'Risk' | 'Program';
  author: string;
  hash: string;
}

export interface HolisticSummary {
  financialHealth: string;
  riskAssessment: string;
  complianceStatus: string;
  strategicInsight: string;
}

export interface RiskAnomaly {
  id: string;
  type: 'Financial' | 'Compliance' | 'Fraud' | 'Operational';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  detectedAt: string;
  status: 'Open' | 'Investigating' | 'Resolved';
}

export interface FinancialReport {
  title: string;
  period: string;
  sections: {
    category: string;
    items: { label: string; amount: number }[];
    total: number;
  }[];
  netAssets: number;
}

export type UserRole =
  | 'owner'
  | 'manager'
  | 'dentist'
  | 'receptionist'
  | 'accountant'
  | 'patient'
  | 'reviewer'
  | 'medical_inspector'
  | 'insurance_manager'
  | 'insurer_admin'
  | 'lab';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  active: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  nationalId: string;
  phone: string;
  branchIds: string[];
  specialty?: string;
  commissionRate?: number; // e.g. 45% for contracted doctors
  isOwner?: boolean; // Owner privilege flag
}

export interface ClinicRegistration {
  id: string;
  name: string;
  nationalCode: string;
  ownerName: string;
  ownerMobile: string;
  ownerRole: 'dentist' | 'manager';
  activeRoles: UserRole[]; // 'receptionist' & 'dentist' mandatory, 'accountant' & 'manager' optional
  createdAt: string;
}

export interface BaseInsuranceContract {
  id: string;
  name: string;
  code: string;
  contracted: boolean;
  franchisePercent: number;
  active: boolean;
  settlementType: 'direct_electronic' | 'manual_paper';
  description?: string;
}

export interface SupplementaryInsuranceContract {
  id: string;
  name: string;
  code: string;
  contracted: boolean;
  fastSettlementL4: boolean;
  maxCoveragePerPatient: number;
  active: boolean;
  apiStatus: 'connected' | 'disconnected';
  description?: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  user: UserProfile | null;
  clinic: ClinicRegistration | null;
  isOwner: boolean;
  activeView: 'dentora_landing' | 'clinic_portal' | 'workspace';
}

export type ToothSurface =
  | 'Mesial'
  | 'Distal'
  | 'Occlusal'
  | 'Buccal'
  | 'Lingual'
  | 'Root'
  | 'ALL'
  | 'Labial'
  | 'Incisal';

export type ToothCondition =
  | 'healthy'
  | 'decay'
  | 'rct_needed'
  | 'crown'
  | 'implant'
  | 'extracted'
  | 'filled'
  | 'in_progress';

export interface ToothDetail {
  fdiNumber: number; // 11-48 adult, 51-85 pediatric
  isPediatric?: boolean;
  condition: ToothCondition;
  affectedSurfaces: ToothSurface[];
  notes?: string;
  treatmentHistory: {
    id: string;
    date: string;
    procedureName: string;
    dentistName: string;
    cost: number;
    status: 'planned' | 'in_progress' | 'completed';
    stepText?: string;
  }[];
}

export interface Patient {
  id: string;
  udrCode: string; // Universal Dental Record
  fullName: string;
  nationalId: string;
  phone: string;
  age: number;
  gender: 'مرد' | 'زن';
  medicalHistory: string[];
  allergies: string[];
  isLegalGuardian?: boolean;
  guardianName?: string;
  guardianNationalId?: string;
  guardianPhone?: string;
  childName?: string;
  childNationalId?: string;
  primaryInsurance: {
    provider: string;
    policyNumber: string;
    active: boolean;
  };
  supplementaryInsurance?: {
    provider: string;
    policyNumber: string;
    ceilingRemaining: number;
    waitingPeriodDays: number;
    active: boolean;
  };
  teethMap: Record<number, ToothDetail>;
  consentTokens: {
    id: string;
    purpose: string;
    grantedAt: string;
    expiresAt: string;
    active: boolean;
  }[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  nationalId: string;
  dentistId: string;
  dentistName: string;
  branchId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "09:00 - 09:30"
  reason: string;
  status: 'scheduled' | 'checked_in' | 'in_unit' | 'completed' | 'cancelled';
  isFirstVisit: boolean;
  visitFeePaid: boolean;
  checkInFormCompleted: boolean;
  connectedToUnit?: boolean;
  receptionNoteToDoctor?: string;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  patientName: string;
  phone: string;
  nationalId: string;
  preferredDate: string;
  reason: string;
  priority?: 'urgent' | 'normal';
  notified: boolean;
  notifiedAt?: string;
}

export interface TreatmentProcedure {
  id: string;
  patientId: string;
  toothFdi: number;
  code: string;
  name: string;
  baseTariff: number;
  baseInsuranceShare: number;
  supplInsuranceShare: number;
  patientShare: number;
  status: 'planned' | 'in_progress' | 'completed';
  requiredDocs: string[];
  date: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  date: string;
  totalAmount: number;
  baseInsuranceCovered: number;
  supplInsuranceCovered: number;
  patientSharePaid: number;
  paymentMethod: 'cash' | 'pos' | 'transfer' | 'online';
  status: 'draft' | 'paid' | 'partial' | 'pending_insurance';
  doctorCommissionAmount: number;
  items: {
    procedureName: string;
    toothFdi: number;
    amount: number;
  }[];
}

export interface InstallmentPlan {
  id: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  phone: string;
  totalAmount: number;
  prePaymentAmount: number;
  remainingAmount: number;
  installmentsCount: number;
  monthlyAmount: number;
  isBNPL?: boolean;
  schedule: {
    installmentNo: number;
    dueDate: string;
    amount: number;
    status: 'scheduled' | 'due' | 'paid' | 'overdue';
    paidAt?: string;
    autoSettledBNPL?: boolean;
  }[];
}

export interface TodayMoneyBoard {
  receivedTodayCashPos: number;
  insurancePendingTotal: number;
  installmentsDueToday: number;
  installmentsOverdueTotal: number;
  totalInvoicedToday: number;
  blockedClaimsCount: number;
}

export type ClaimStatus =
  | 'draft'
  | 'queued'
  | 'submitted'
  | 'needs_fix'
  | 'express_review'
  | 'standard_review'
  | 'deep_review'
  | 'approved'
  | 'partially_approved'
  | 'rejected'
  | 'appealed'
  | 'settled';

export type DeductionReasonCode = 'TARIFF_EXCEEDED' | 'DOCUMENTATION_MISSING' | 'MEDICAL_UNNECESSARY' | 'DUP_CLAIM' | string;

export type ReviewRoute = 'express' | 'standard' | 'deep_review' | 'deep';

export interface ClaimItem {
  id: string;
  toothNumber: number;
  procedureTitle: string;
  procedureCode: string;
  surfaceDetail?: string;
  tariffAmount: number;
  claimedAmount: number;
  baseShare?: number;
  supplementaryShare?: number;
  patientShare?: number;
}

export interface ClaimEvidence {
  id: string;
  title: string;
  type: 'xray' | 'photo' | 'invoice' | 'pre_auth_certificate' | 'batch_number';
  url?: string;
  fileUrl?: string;
  uploaded: boolean;
  required: boolean;
  aiQualityCheck?: {
    notes?: string;
    clarityScore?: number;
    [key: string]: any;
  };
}

export interface ClaimAppeal {
  id: string;
  createdAt: string;
  submittedBy?: string;
  reason: string;
  additionalEvidenceUrls?: string[];
  responseNotes?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

export interface PreAuthCertificate {
  id: string;
  certificateNumber: string;
  patientName: string;
  patientNationalId: string;
  insurerName: string;
  expiryDate: string;
  coveredProcedures: string[];
  approvedAmount: number;
}

export interface ConsentToken {
  id: string;
  patientName: string;
  insurerName: string;
  scope: string;
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'revoked';
}

export interface Claim {
  id: string;
  claimNumber: string;
  patientId: string;
  patientName: string;
  nationalId: string;
  patientNationalId?: string;
  insuranceProvider: string;
  primaryInsurerName?: string;
  supplementaryInsurerName?: string;
  toothFdi: number;
  treatmentName: string;
  dateOfService: string;
  serviceDate?: string;
  claimedAmount: number;
  totalClaimedAmount?: number;
  totalApprovedAmount?: number;
  baseApprovedAmount: number;
  supplApprovedAmount: number;
  deductionAmount: number;
  deductionReason?: string;
  status: ClaimStatus | string;
  riskScore: number;
  greenLaneEligible: boolean;
  greenLaneChecklist?: {
    m1_identityConsent: boolean;
    m2_dentalChartStructured: boolean;
    m3_visualEvidenceAttached: boolean;
    m4_financialSanitised: boolean;
    m5_consentRecordAccess: boolean;
  };
  reviewRoute?: 'express' | 'standard' | 'deep' | 'deep_review';
  auditTrailId?: string;
  dentistName?: string;
  clinicName?: string;
  branchName?: string;
  clinicTrustLevel?: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | string;
  items?: ClaimItem[];
  evidences: ClaimEvidence[];
  appeals?: ClaimAppeal[];
  aiFlags?: {
    code: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | string;
    [key: string]: any;
  }[];
  medicalReviewerName?: string;
  preTreatmentAuth?: any;
  preAuthCertificateNumber?: string;
  reviewDecision?: any;
  narrativeText: string;
  medicalInspectorQnA?: {
    question: string;
    answer: string;
  }[];
  appealText?: string;
  appealHistory?: {
    date: string;
    text: string;
    status: string;
  }[];
  [key: string]: any;
}

export interface GreenLaneStatus {
  active: boolean;
  trustLevel: 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
  modules: {
    GL_M1_IdentityConsent: boolean;
    GL_M2_VisualFdiChart: boolean;
    GL_M3_ImageEvidence: boolean;
    GL_M4_CleanBilling: boolean;
    GL_M5_WormConsentToken: boolean;
  };
  cleanClaimRate: number;
  averageSettlementHours: number;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  dentistName: string;
  toothFdi: number;
  labName: string;
  itemType: 'روکش زيرکونيا' | 'سرامیک PFM' | 'نایت گارد' | 'اباتمنت ایمپلنت' | 'پروتز پارسیل';
  status: 'ordered' | 'designing' | 'in_furnace' | 'shipped' | 'delivered';
  orderedDate: string;
  expectedDeliveryDate: string;
  currentMilestone: string;
  delayAlert?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityName: string;
  entityId: string;
  hashWORM: string;
}

export interface MigrationState {
  method: 'read_through' | 'import_only' | 'dual_entry';
  status: 'idle' | 'in_progress' | 'completed';
  recordsTransferred: number;
  totalRecords: number;
  lastSyncTime?: string;
}

export interface DoctorRequestReminder {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  reason: string;
  suggestedDate: string;
  status: 'pending' | 'registered' | 'dismissed';
}

export interface DoctorSubmission {
  id: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  nationalId: string;
  dentistName: string;
  treatmentSummary: string;
  prescriptionSummary: string;
  clinicalNotes?: string;
  toothFdi?: number;
  totalCost?: number;
  baseCovered?: number;
  supplCovered?: number;
  submittedAt: string;
  status: 'pending' | 'approved';
}

export interface MedicalQuestionSet {
  id: string;
  category: string;
  title: string;
  questions?: string[];
  [key: string]: any;
}

export interface TariffToleranceRule {
  id: string;
  procedureCode: string;
  procedureTitle: string;
  baseTariff: number;
  tolerancePercentage: number;
  maxAllowedAmount: number;
  pinnedVersion: string;
}

export interface AuditLogItem {
  id: string;
  entityId?: string;
  userName?: string;
  userRole?: string;
  timestamp?: string;
  details?: string;
  action?: string;
  wormVerifiedHash?: string;
  [key: string]: any;
}

export interface ProviderScorecard {
  clinicId: string;
  clinicName: string;
  tier: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | string;
  cleanClaimRate: number;
  rejectionRate: number;
  avgSettlementHours: number;
  materialMatchScore: number;
  isGreenLaneApproved: boolean;
  totalClaimsCount: number;
}


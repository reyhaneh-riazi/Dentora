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
  email?: string;
  avatarUrl?: string;
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

export interface SavedBankCard {
  id: string;
  bankName: string;
  cardNumber: string; // 16 digits
  cvv2: string;
  expMonth: string;
  expYear: string;
  holderName?: string;
  isDefault?: boolean;
}

export interface PatientImageAnnotation {
  id: string;
  text: string;
  toothFdi?: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width?: number; // percentage for box
  height?: number; // percentage for box
  type: 'pin' | 'box' | 'measurement';
  author: 'doctor' | 'ai';
  aiConfidence?: number;
  severity?: 'critical' | 'warning' | 'normal';
}

export interface PatientImageRecord {
  id: string;
  title: string;
  type: 'rvg' | 'opg' | 'cbct' | 'intraoral' | 'external';
  imageUrl: string;
  toothFdi?: number;
  date: string;
  doctorName?: string;
  annotations: PatientImageAnnotation[];
  doctorNotes?: string;
  summaryText?: string;
}

export interface PatientPrescription {
  id: string;
  date: string;
  dentistName: string;
  items: string[];
  instructions?: string;
}

export interface Patient {
  id: string;
  udrCode: string; // Universal Dental Record
  fullName: string;
  nationalId: string;
  phone: string;
  birthDate?: string;
  address?: string;
  age: number;
  gender: 'مرد' | 'زن';
  medicalHistory: string[];
  allergies: string[];
  clinicalNotes?: string[];
  prescriptions?: PatientPrescription[];
  patientImages?: PatientImageRecord[];
  savedCards?: SavedBankCard[];
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
  patientNationalId?: string;
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
  trackingCode?: string;
  posTerminalName?: string;
  paidAt?: string;
  paymentNotes?: string;
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
  | 'pending_reception'
  | 'submitted'
  | 'needs_fix'
  | 'needs_evidence'
  | 'express_review'
  | 'standard_review'
  | 'deep_review'
  | 'approved'
  | 'partially_approved'
  | 'partially_rejected'
  | 'rejected'
  | 'rejected_by_insurer'
  | 'approved_by_insurer'
  | 'appealed'
  | 'paid'
  | 'accepted'
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
  claimId?: string;
  createdAt: string;
  submittedBy?: string;
  dentistName?: string;
  reason: string;
  additionalEvidenceUrls?: string[];
  responseNotes?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  [key: string]: any;
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
  teethFdiList?: number[];
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

export interface LabStaffAccount {
  id: string;
  labId: string;
  fullName: string;
  username: string;
  password?: string;
  role: 'owner' | 'technician' | 'staff';
  mobile: string;
  isCreator: boolean;
  createdAt: string;
}

export interface DentalLab {
  id: string;
  name: string;
  managerName: string;
  licenseNumber: string;
  phone: string;
  mobile: string;
  address: string;
  specialties: string[];
  averageTurnaroundDays: number;
  email?: string;
  active: boolean;
  createdAt: string;
  creatorStaffId?: string;
  staffAccounts?: LabStaffAccount[];
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  dentistName: string;
  dentistSpecialty?: string;
  dentistPhone?: string;
  toothFdi: number;
  labName: string;
  labId?: string;
  clinicId?: string;
  clinicName?: string;
  itemType: 'روکش زيرکونيا' | 'سرامیک PFM' | 'نایت گارد' | 'اباتمنت ایمپلنت' | 'پروتز پارسیل' | 'روکش زيرکونيا کامل' | 'لمینت Emax' | 'پروتز کامل' | 'اینله / آنله' | 'بلیچینگ تری' | string;
  status: 'ordered' | 'designing' | 'in_furnace' | 'shipped' | 'delivered';
  orderedDate: string;
  expectedDeliveryDate: string;
  currentMilestone: string;
  delayAlert?: string;
  shade?: string;
  alloyOrMaterial?: string;
  doctorNotes?: string;
  technicianNotes?: string;
  attachmentUrl?: string;
  stages?: {
    name: string;
    done: boolean;
    delayReason?: string;
  }[];
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
  teethFdiList?: number[];
  totalCost?: number;
  baseCovered?: number;
  supplCovered?: number;
  submittedAt: string;
  status: 'pending' | 'approved';
  paymentReceived?: {
    amount: number;
    method: 'pos' | 'cash' | 'transfer';
    posTerminalName?: string;
    trackingCode: string;
    paidAt: string;
    notes?: string;
  };
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

export interface PatientQuestionReply {
  id: string;
  senderRole: 'receptionist' | 'dentist' | 'patient';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface PatientQuestion {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientNationalId: string;
  dentistId?: string;
  dentistName?: string;
  category: 'نوبت' | 'درد' | 'پرداخت' | 'اقساط' | 'بیمه' | 'مراقبت‌های پس از درمان' | 'پزشکی' | string;
  question: string;
  createdAt: string;
  status: 'pending' | 'answered' | 'referred_to_doctor';
  isClinicalUrgent?: boolean;
  replies: PatientQuestionReply[];
  // Compatibility fields
  answer?: string;
  answeredAt?: string;
  repliedBy?: string;
}

export interface PatientInsuranceDispute {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  nationalId: string;
  claimNumber: string;
  insuranceProvider: string;
  topic: string;
  message: string;
  imageName?: string;
  imageDesc?: string;
  claimedAmount: number;
  deductionAmount: number;
  status: 'under_review' | 'approved_pay' | 'need_docs' | 'rejected';
  responseMessage?: string;
  lastUpdated: string;
  createdAt: string;
}



export interface CounterInfo {
  id: string;
  name: string;
  prefix: string;
  estimatedWaitMins: number;
}

export type IndustryType = "HOSPITAL" | "BANK" | "SALON" | "RESTAURANT" | "GOVERNMENT";

export interface IndustryTemplate {
  industry: IndustryType;
  uiTheme: {
    primaryColor: string;
    iconLibrary: "medical" | "finance" | "beauty" | "food" | "building";
  };
  defaultCounters: Partial<CounterInfo>[];
}

export const INDUSTRY_TEMPLATES: Record<IndustryType, IndustryTemplate> = {
  HOSPITAL: {
    industry: "HOSPITAL",
    uiTheme: { primaryColor: "blue", iconLibrary: "medical" },
    defaultCounters: [
      { id: "opd", name: "OPD Consultation", prefix: "OPD", estimatedWaitMins: 15 },
      { id: "billing", name: "Billing & Discharge", prefix: "BIL", estimatedWaitMins: 5 },
      { id: "pharmacy", name: "Pharmacy", prefix: "PHR", estimatedWaitMins: 10 }
    ]
  },
  BANK: {
    industry: "BANK",
    uiTheme: { primaryColor: "indigo", iconLibrary: "finance" },
    defaultCounters: [
      { id: "teller", name: "Cash Teller", prefix: "CSH", estimatedWaitMins: 8 },
      { id: "loan", name: "Loan Approvals", prefix: "LON", estimatedWaitMins: 25 },
      { id: "support", name: "Customer Support", prefix: "SUP", estimatedWaitMins: 15 }
    ]
  },
  RESTAURANT: {
    industry: "RESTAURANT",
    uiTheme: { primaryColor: "orange", iconLibrary: "food" },
    defaultCounters: [
      { id: "table2", name: "Table for 2", prefix: "T2", estimatedWaitMins: 15 },
      { id: "table4", name: "Table for 4", prefix: "T4", estimatedWaitMins: 25 },
      { id: "vip", name: "VIP Lounge", prefix: "VIP", estimatedWaitMins: 5 }
    ]
  },
  SALON: {
    industry: "SALON",
    uiTheme: { primaryColor: "rose", iconLibrary: "beauty" },
    defaultCounters: [
      { id: "haircut", name: "Haircut & Styling", prefix: "HC", estimatedWaitMins: 20 },
      { id: "spa", name: "Spa & Massage", prefix: "SPA", estimatedWaitMins: 45 }
    ]
  },
  GOVERNMENT: {
    industry: "GOVERNMENT",
    uiTheme: { primaryColor: "slate", iconLibrary: "building" },
    defaultCounters: [
      { id: "passport", name: "Passport Renewal", prefix: "PAS", estimatedWaitMins: 30 },
      { id: "license", name: "Driving License", prefix: "DL", estimatedWaitMins: 40 },
      { id: "inquiry", name: "General Inquiry", prefix: "INQ", estimatedWaitMins: 15 }
    ]
  }
};

import type { programSchema } from '~/schemas/programs';

// Workspace user role
export type WorkspaceUserRole = 'viewer' | 'editor';

// Workspace user with role and metadata
export interface WorkspaceUserDoc {
  userId: string;
  role: WorkspaceUserRole;
  addedAt: Date;
  addedBy: string;
}

// Workspace event types
export type WorkspaceEventType =
  | 'workspace_created'
  | 'workspace_updated'
  | 'user_added'
  | 'user_removed'
  | 'user_role_changed'
  | 'program_added'
  | 'program_removed'
  | 'ownership_transferred';

// Workspace event document
export interface WorkspaceEventDoc {
  workspaceId: string;
  type: WorkspaceEventType;
  actor: string;
  timestamp: Date;
  details: {
    targetUserId?: string;
    userRole?: WorkspaceUserRole;
    programIds?: string[];
    changes?: {
      field: string;
      oldValue?: unknown;
      newValue?: unknown;
    }[];
    workspaceName?: string;
  };
}

export type UserRole = 'admin' | 'user';

export type UserDoc = {
  id: string;
  email: string;
  passwordHash?: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  lastPasswordChange: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Token document stored in MongoDB
 * Used for: email verification, password reset
 */
export interface TokenDoc {
  id: string; // stringified ObjectId
  userId: string; // reference to UserDoc.id
  type: 'verify-email' | 'reset-password' | 'invitation';
  tokenHash: string; // SHA-256 hash of the token
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
  usedAt: Date | null;
}

/**
 * Session document stored in MongoDB
 * Used for: managing user sessions across multiple devices
 */
export interface SessionDoc {
  id: string; // stringified ObjectId
  userId: string; // reference to UserDoc.id
  sessionTokenHash: string; // SHA-256 hash of the refresh token
  userAgent: string; // Browser/device information
  ipAddress: string | null; // IP address of the device
  createdAt: Date;
  expiresAt: Date;
  lastRefreshedAt: Date;
}

export type ProgramDoc = typeof programSchema.static;

export type SiseDoc = {
  annee_universitaire: string;
  etablissement_type: string;
  etablissement_typologie: string;
  etablissement_id_paysage: string;
  etablissement_lib: string;
  etablissement_compos_id_paysage: string;
  etablissement_compos_lib: string;
  form_ens_id_paysage: string | null;
  form_ens_lib: string | null;
  etablissement_id_wikidata: string;
  etablissement_id_ror: string;
  etablissement_id_uai: string[];
  etablissement_localisation: string;
  implantation_localisation: string;
  dn_de: string;
  dn_de_lib: string;
  cursus_lmd: string;
  cursus_lmd_lib: string;
  diplome_rgp: string;
  diplome: string;
  diplome_lib: string;
  typ_diplome: string;
  typ_diplome_lib: string;
  diplom: string;
  libelle_intitule_1: string;
  libelle_intitule_2: string | null;
  niveau: string;
  niveau_lib: string;
  degetu: number;
  degetu_lib: string;
  disciplines_selection: string;
  gd_disciscipline: string;
  gd_disciscipline_lib: string;
  discipline: string;
  discipline_lib: string;
  sect_disciplinaire: number;
  sect_disciplinaire_lib: string;
  spec_iut_rgp_lib: string;
  spec_iut: string;
  spec_iut_lib: string;
  iut_id_paysage: string | null;
  correspondance_iut: string;
  effectif_sans_cpge: number;
  femmes: number;
  hommes: number;
  effectif: number;
  effectif_total_sans_cpge: number;
  effectif_total: number;
  effectif_dei: number;
  etablissement_code_commune: string;
  etablissement_commune: string | null;
  etablissement_id_uucr: string;
  etablissement_uucr: string;
  etablissement_id_departement: string;
  etablissement_departement: string;
  etablissement_id_academie: string;
  etablissement_academie: string;
  etablissement_id_region: string;
  etablissement_region: string;
  implantation_code_commune: string;
  implantation_commune: string;
  implantation_id_uucr: string;
  implantation_uucr: string;
  implantation_id_departement: string;
  implantation_departement: string;
  implantation_id_academie: string;
  implantation_academie: string;
  implantation_id_region: string;
  implantation_region: string;
  etablissement_id_uai_source: string;
  etablissement_id_paysage_source: string;
  etablissement_id_paysage_actuel: string;
  etablissement_actuel_lib: string;
  rentree: string;
  annee: string;
  uai_fresq: string;
  inf: string;
  in_fresq: string;
};

export interface WorkspaceDoc {
  id: string; // stringified ObjectId
  createdAt: Date;
  description?: string;
  color: string;
  isPublic: boolean;
  name: string;
  owner: string;
  programs: string[];
  updatedAt: Date;
  users: WorkspaceUserDoc[];
}

export interface RateLimitDoc {
  key: string;
  count: number;
  windowStart: Date;
  expiresAt: Date; // Require a TTL index
}

export interface InsersupDoc {
  type_diplome: string;
  type_diplome_long: string;
  diplome: string;
  libelle_diplome: string;
  etablissement: string;
  denomination_principale: string;
  id_paysage: string;
  uo_lib: string;
  id_paysage_actuel: string;
  uo_lib_actuel: string;
  com_code: string;
  promo: string;
  genre: string;
  obtention_diplome: string;
  nationalite: string;
  regime_inscription: string;
  nb_etudiants: number;
  nb_sortants: number;
  nb_poursuivants: number;
  nb_sortants_en_emploi_non_sal_6: number;
  nb_sortants_en_emploi_non_sal_12: number;
  nb_sortants_en_emploi_non_sal_18: number;
  nb_sortants_en_emploi_non_sal_24: number;
  nb_sortants_en_emploi_non_sal_30: number;
  nb_sortants_en_emploi_sal_fr_6: number;
  nb_sortants_en_emploi_sal_fr_12: number;
  nb_sortants_en_emploi_sal_fr_18: number;
  nb_sortants_en_emploi_sal_fr_24: number;
  nb_sortants_en_emploi_sal_fr_30: number;
  nb_sortants_en_emploi_stable_6: number;
  nb_sortants_en_emploi_stable_12: number;
  nb_sortants_en_emploi_stable_18: number;
  nb_sortants_en_emploi_stable_24: number;
  nb_sortants_en_emploi_stable_30: number;
  etablissement_id_paysage_actuel: string;
  diplom: string;
  uai_fresq: string;
  inf: string;
}

export interface EmploymentRates {
  m6: number | null;
  m12: number | null;
  m18: number | null;
  m24: number | null;
  m30: number | null;
}

export interface InsersupGenderStats {
  nbSortants: number;
  canShowPercentages: boolean;
  emploiSalFr: EmploymentRates | null;
  emploiNonSal: EmploymentRates | null;
  emploiStable: EmploymentRates | null;
}

export interface InsersupYearStats {
  promo: string;
  nbEtudiants: number;
  nbSortants: number;
  nbPoursuivants: number;
  canShowPercentages: boolean;
  emploiSalFr: EmploymentRates | null;
  emploiNonSal: EmploymentRates | null;
  emploiStable: EmploymentRates | null;
  byGender: {
    femme: InsersupGenderStats | null;
    homme: InsersupGenderStats | null;
  } | null;
}

export interface InsersupStats {
  totalSortants: number;
  totalEtudiants: number;
  totalPoursuivants: number;
  totalSortantsFrancais: number;
  totalSortantsEtrangers: number;
  canShowPercentages: boolean;
  byYear: InsersupYearStats[];
  globalRates: {
    emploiSalFr: EmploymentRates | null;
    emploiNonSal: EmploymentRates | null;
    emploiStable: EmploymentRates | null;
  } | null;
  globalRatesByGender: {
    femme: InsersupGenderStats | null;
    homme: InsersupGenderStats | null;
  } | null;
}

// Aggregation data cached for workspace dashboard
export interface WorkspaceCacheDoc {
  workspaceId: string;
  updatedAt: Date;
  programCount: number;
  // SISE aggregations (student counts)
  studentsAggregations: {
    totalPrograms: number; // programs with SISE data for LAST_YEAR
    totalStudents: number;
    totalFemale: number;
    totalMale: number;
    byYear: {
      year: string;
      total: number;
      female: number;
      male: number;
    }[];
    byCycle: {
      cycle: string;
      total: number;
      female: number;
      male: number;
    }[];
    byAcademy: {
      academy: string;
      total: number;
      female: number;
      male: number;
    }[];
    byRegion: {
      region: string;
      total: number;
      female: number;
      male: number;
    }[];
    byDiploma: {
      diploma: string;
      diplomaLabel: string;
      total: number;
      female: number;
      male: number;
    }[];
    byInstitution: {
      id: string;
      name: string;
      total: number;
      female: number;
      male: number;
    }[];
    byDiscipline: {
      discipline: string;
      disciplineLabel: string;
      total: number;
      female: number;
      male: number;
    }[];
    byLargeDiscipline: {
      largeDiscipline: string;
      largeDisciplineLabel: string;
      total: number;
      female: number;
      male: number;
    }[];
  };
  // Program aggregations (program counts from programs collection)
  programAggregations: {
    byCycle: {
      cycle: string;
      count: number;
    }[];
    byAcademy: {
      academy: string;
      count: number;
    }[];
    byRegion: {
      region: string;
      count: number;
    }[];
    byDiploma: {
      diploma: string;
      diplomaLabel: string;
      count: number;
    }[];
    byInstitution: {
      uai: string;
      name: string;
      count: number;
    }[];
    byDiscipline: {
      discipline: string;
      count: number;
    }[];
    byRome: {
      code: string;
      label: string;
      count: number;
    }[];
  };
  insersupAggregations: {
    totalPrograms: number;
    totalSortants: number;
    totalEtudiants: number;
    totalPoursuivants: number;
    totalSortantsFrancais: number;
    totalSortantsEtrangers: number;
    canShowPercentages: boolean;
    byYear: InsersupYearStats[];
    globalRates: {
      emploiSalFr: EmploymentRates | null;
      emploiNonSal: EmploymentRates | null;
      emploiStable: EmploymentRates | null;
    } | null;
    globalRatesByGender: {
      femme: InsersupGenderStats | null;
      homme: InsersupGenderStats | null;
    } | null;
  };
}

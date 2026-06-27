// Les tables seront définies ici
import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  doublePrecision,
  integer,
  bigint,
  unique
} from "drizzle-orm/pg-core"

// ── TABLE MOSQUÉES ──
export const mosques = pgTable("mosques", {
  id:                serial("id").primaryKey(),
  slug:              varchar("slug", { length: 100 }).notNull().unique(),
  name:              varchar("name", { length: 200 }).notNull(),
  city:              varchar("city", { length: 100 }).notNull(),
  country:           varchar("country", { length: 100 }).notNull(),

  // ── Coordonnées précises (optionnelles, champs libres) ──
  commune:  varchar("commune",  { length: 100 }),
  quartier: varchar("quartier", { length: 100 }),
  secteur:  varchar("secteur",  { length: 100 }),

  // ── Noms officiels multilingues (optionnels) ──
  // Vide = on retombe sur "name". Aucune traduction automatique.
  nameFr: varchar("name_fr", { length: 200 }),
  nameEn: varchar("name_en", { length: 200 }),
  nameAr: varchar("name_ar", { length: 200 }),

  latitude:          doublePrecision("latitude").notNull(),
  longitude:         doublePrecision("longitude").notNull(),
  timezone:          varchar("timezone", { length: 100 }).notNull().default("Africa/Conakry"),
  adminEmail:        varchar("admin_email", { length: 255 }),
  isVerified:        boolean("is_verified").notNull().default(false),
  createdAt:         timestamp("created_at").notNull().defaultNow(),
  donationUrl: varchar("donation_url", { length: 500 }),  // lien de don externe, optionnel
  contactEmail: varchar("contact_email", { length: 255 }),  // optionnel
  contactPhone: varchar("contact_phone", { length: 50 }),   // optionnel

  // ── Textes personnalisés (optionnels) ──
  welcomeMessage: text("welcome_message"),  // affiché en haut de la page publique
  footerText:     text("footer_text"),      // affiché dans le pied de page public

  // ── Horaires manuels (Approche A) ──
  // Format "HH:MM", null = non renseigné → la page publique affiche "—".
  // Source de vérité affichée. Le calcul MWL n'est plus qu'une suggestion admin.
  fajrAdhan:    varchar("fajr_adhan",    { length: 5 }),
  fajrIqama:    varchar("fajr_iqama",    { length: 5 }),
  dhuhrAdhan:   varchar("dhuhr_adhan",   { length: 5 }),
  dhuhrIqama:   varchar("dhuhr_iqama",   { length: 5 }),
  asrAdhan:     varchar("asr_adhan",     { length: 5 }),
  asrIqama:     varchar("asr_iqama",     { length: 5 }),
  maghribAdhan: varchar("maghrib_adhan", { length: 5 }),
  maghribIqama: varchar("maghrib_iqama", { length: 5 }),
  ishaAdhan:    varchar("isha_adhan",    { length: 5 }),
  ishaIqama:    varchar("isha_iqama",    { length: 5 }),
  jumuaAdhan:   varchar("jumua_adhan",   { length: 5 }),
  jumuaIqama:   varchar("jumua_iqama",   { length: 5 }),
})

// ── TABLE UTILISATEURS ── (gérée par Better-Auth ; role + mosqueId sont des champs métier)
export const users = pgTable("users", {
  id:            varchar("id", { length: 255 }).primaryKey(),
  name:          varchar("name", { length: 200 }).notNull(),
  email:         varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image:         text("image"),
  role:          text("role").notNull().default("admin"),  // "admin" ou "super_admin"
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
})

// ── TABLE DE LIAISON MOSQUÉE ↔ ADMINS ──
export const mosqueAdmins = pgTable("mosque_admins", {
  id:        serial("id").primaryKey(),
  mosqueId:  integer("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  userId:    varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueLink: unique("mosque_admins_mosque_user_unique").on(table.mosqueId, table.userId),
}))

// ── TABLE ANNONCES ──
export const announcements = pgTable("announcements", {
  id:          serial("id").primaryKey(),
  mosqueId:    integer("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  title:       varchar("title", { length: 100 }).notNull(),
  content:     text("content").notNull(),
  authorId:    varchar("author_id", { length: 255 }).notNull().references(() => users.id),
  publishedAt: timestamp("published_at"),
  expiresAt:   timestamp("expires_at"),
  isPublished: boolean("is_published").notNull().default(false),
  isPinned:    boolean("is_pinned").notNull().default(false),  // épinglée en tête de liste
  audioUrl:    varchar("audio_url", { length: 500 }),  // lien audio externe optionnel (aucun fichier stocké)
  createdAt:   timestamp("created_at").notNull().defaultNow(),
})

// ── TABLE ÉVÉNEMENTS ──
export const events = pgTable("events", {
  id:          serial("id").primaryKey(),
  mosqueId:    integer("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  title:       varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  location:    varchar("location", { length: 200 }).notNull().default("À la mosquée"),
  startAt:     timestamp("start_at").notNull(),
  endAt:       timestamp("end_at"),
  isPublished: boolean("is_published").notNull().default(false),
  audioUrl:    varchar("audio_url", { length: 500 }),  // lien audio externe optionnel (aucun fichier stocké)
})

// ── TABLE MEMBRES (privée : admin + super-admin) ──
// Catégorie fixe (contrôlée applicativement) + précision de rôle optionnelle.
// AUCUNE photo (principe : pas d'image dans l'application).
export const mosqueMembers = pgTable("mosque_members", {
  id:        serial("id").primaryKey(),
  mosqueId:  integer("mosque_id").notNull().references(() => mosques.id, { onDelete: "cascade" }),
  name:      varchar("name", { length: 200 }).notNull(),
  category:  varchar("category", { length: 20 }).notNull(),  // 'imam' | 'sage' | 'conseiller' | 'equipe'
  role:      varchar("role", { length: 200 }),               // précision libre optionnelle
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ── TYPES INFÉRÉS ──
export type Mosque       = typeof mosques.$inferSelect
export type NewMosque    = typeof mosques.$inferInsert
export type Announcement = typeof announcements.$inferSelect
export type NewAnnouncement = typeof announcements.$inferInsert
export type Event        = typeof events.$inferSelect
export type NewEvent     = typeof events.$inferInsert
export type User         = typeof users.$inferSelect
export type NewUser      = typeof users.$inferInsert
export type MosqueAdmin    = typeof mosqueAdmins.$inferSelect
export type NewMosqueAdmin = typeof mosqueAdmins.$inferInsert
export type MosqueMember    = typeof mosqueMembers.$inferSelect
export type NewMosqueMember = typeof mosqueMembers.$inferInsert

// ── TABLES BETTER-AUTH ──
export const session = pgTable("session", {
  id:        varchar("id", { length: 255 }).primaryKey(),
  userId:    varchar("user_id", { length: 255 }).notNull(),
  token:     varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const account = pgTable("account", {
  id:                   varchar("id", { length: 255 }).primaryKey(),
  userId:               varchar("user_id", { length: 255 }).notNull(),
  accountId:            varchar("account_id", { length: 255 }).notNull(),
  providerId:           varchar("provider_id", { length: 255 }).notNull(),
  accessToken:          text("access_token"),
  refreshToken:         text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  scope:                varchar("scope", { length: 255 }),
  password:             text("password"),
  createdAt:            timestamp("created_at").notNull().defaultNow(),
  updatedAt:            timestamp("updated_at").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id:         varchar("id", { length: 255 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value:      varchar("value", { length: 255 }).notNull(),
  expiresAt:  timestamp("expires_at").notNull(),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
})

export const rateLimit = pgTable("rate_limit", {
  id:          varchar("id", { length: 255 }).primaryKey(),
  key:         varchar("key", { length: 255 }),
  count:       integer("count"),
  lastRequest: bigint("last_request", { mode: "number" }),
})

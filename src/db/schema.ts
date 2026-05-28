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
} from "drizzle-orm/pg-core"

// ── TABLE MOSQUÉES ──
export const mosques = pgTable("mosques", {
  id:                serial("id").primaryKey(),
  slug:              varchar("slug", { length: 100 }).notNull().unique(),
  name:              varchar("name", { length: 200 }).notNull(),
  city:              varchar("city", { length: 100 }).notNull(),
  country:           varchar("country", { length: 100 }).notNull(),
  latitude:          doublePrecision("latitude").notNull(),
  longitude:         doublePrecision("longitude").notNull(),
  timezone:          varchar("timezone", { length: 100 }).notNull().default("Africa/Conakry"),
  calculationMethod: varchar("calculation_method", { length: 50 }).notNull().default("MWL"),
  adminEmail:        varchar("admin_email", { length: 255 }).notNull(),
  isVerified:        boolean("is_verified").notNull().default(false),
  createdAt:         timestamp("created_at").notNull().defaultNow(),

  // Ajustements iqama en minutes (décalage après l'adhan)
  iqamaFajr:    integer("iqama_fajr").notNull().default(20),
  iqamaDhuhr:   integer("iqama_dhuhr").notNull().default(10),
  iqamaAsr:     integer("iqama_asr").notNull().default(10),
  iqamaMaghrib: integer("iqama_maghrib").notNull().default(5),
  iqamaIsha:    integer("iqama_isha").notNull().default(10),

  // Ajustements manuels du calcul (correction astronomique en minutes, peut être négatif)
  adjustFajr:    integer("adjust_fajr").notNull().default(0),
  adjustDhuhr:   integer("adjust_dhuhr").notNull().default(0),
  adjustAsr:     integer("adjust_asr").notNull().default(0),
  adjustMaghrib: integer("adjust_maghrib").notNull().default(0),
  adjustIsha:    integer("adjust_isha").notNull().default(0),
})

// ── TABLE UTILISATEURS ──
export const users = pgTable("users", {
  id:          serial("id").primaryKey(),
  name:        varchar("name", { length: 200 }).notNull(),
  email:       varchar("email", { length: 255 }).notNull().unique(),
  role:        varchar("role", { length: 20 }).notNull().default("member"),
  mosqueId:    integer("mosque_id").references(() => mosques.id),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
})

// ── TABLE ANNONCES ──
export const announcements = pgTable("announcements", {
  id:          serial("id").primaryKey(),
  mosqueId:    integer("mosque_id").notNull().references(() => mosques.id),
  title:       varchar("title", { length: 100 }).notNull(),
  content:     text("content").notNull(),
  authorId:    integer("author_id").notNull().references(() => users.id),
  publishedAt: timestamp("published_at"),
  expiresAt:   timestamp("expires_at"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
})

// ── TABLE ÉVÉNEMENTS ──
export const events = pgTable("events", {
  id:          serial("id").primaryKey(),
  mosqueId:    integer("mosque_id").notNull().references(() => mosques.id),
  title:       varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  location:    varchar("location", { length: 200 }).notNull().default("À la mosquée"),
  startAt:     timestamp("start_at").notNull(),
  endAt:       timestamp("end_at"),
  isPublished: boolean("is_published").notNull().default(false),
})

// ── TYPES INFÉRÉS ── (TypeScript gratuit depuis le schéma)
export type Mosque       = typeof mosques.$inferSelect
export type NewMosque    = typeof mosques.$inferInsert
export type Announcement = typeof announcements.$inferSelect
export type NewAnnouncement = typeof announcements.$inferInsert
export type Event        = typeof events.$inferSelect
export type NewEvent     = typeof events.$inferInsert
export type User         = typeof users.$inferSelect
export type NewUser      = typeof users.$inferInsert


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

// Table auth_user séparée de votre table users métier
export const authUser = pgTable("auth_user", {
  id:            varchar("id", { length: 255 }).primaryKey(),
  name:          varchar("name", { length: 200 }).notNull(),
  email:         varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image:         text("image"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
})

CREATE TABLE "account" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"scope" varchar(255),
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"mosque_id" integer NOT NULL,
	"title" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"author_id" varchar(255) NOT NULL,
	"published_at" timestamp,
	"expires_at" timestamp,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"audio_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"mosque_id" integer,
	"action" varchar(100) NOT NULL,
	"target_id" varchar(100),
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"mosque_id" integer NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"location" varchar(200) DEFAULT 'À la mosquée' NOT NULL,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp,
	"is_published" boolean DEFAULT false NOT NULL,
	"audio_url" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "mosque_admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"mosque_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mosque_admins_mosque_user_unique" UNIQUE("mosque_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "mosque_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"mosque_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" varchar(20) NOT NULL,
	"role" varchar(200),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mosques" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"city" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"commune" varchar(100),
	"quartier" varchar(100),
	"secteur" varchar(100),
	"name_fr" varchar(200),
	"name_en" varchar(200),
	"name_ar" varchar(200),
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"timezone" varchar(100) DEFAULT 'Africa/Conakry' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"donation_url" varchar(500),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"orange_money_number" varchar(20),
	"welcome_message" text,
	"footer_text" text,
	"fajr_adhan" varchar(5),
	"fajr_iqama" varchar(5),
	"dhuhr_adhan" varchar(5),
	"dhuhr_iqama" varchar(5),
	"asr_adhan" varchar(5),
	"asr_iqama" varchar(5),
	"maghrib_adhan" varchar(5),
	"maghrib_iqama" varchar(5),
	"isha_adhan" varchar(5),
	"isha_iqama" varchar(5),
	"jumua_adhan" varchar(5),
	"jumua_iqama" varchar(5),
	CONSTRAINT "mosques_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"key" varchar(255),
	"count" integer,
	"last_request" bigint
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" varchar(100),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mosque_admins" ADD CONSTRAINT "mosque_admins_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mosque_admins" ADD CONSTRAINT "mosque_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mosque_members" ADD CONSTRAINT "mosque_members_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcements_mosque_id_idx" ON "announcements" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "announcements_is_published_idx" ON "announcements" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "announcements_published_at_idx" ON "announcements" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "events_mosque_id_idx" ON "events" USING btree ("mosque_id");--> statement-breakpoint
CREATE INDEX "events_is_published_idx" ON "events" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "events_start_at_idx" ON "events" USING btree ("start_at");
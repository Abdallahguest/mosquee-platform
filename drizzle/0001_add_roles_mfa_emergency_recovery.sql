CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"mosque_id" integer NOT NULL,
	"recorded_by" varchar(255),
	"amount_gnf" integer NOT NULL,
	"months" integer NOT NULL,
	"payment_method" varchar(20) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mosques" ADD COLUMN "trial_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "mosques" ADD COLUMN "paid_until" timestamp;--> statement-breakpoint
ALTER TABLE "mosques" ADD COLUMN "subscription_status" varchar(20) DEFAULT 'trial' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "totp_secret" varchar(32);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "totp_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "recovery_codes" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emergency_email" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_pending_setup" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_mosque_id_mosques_id_fk" FOREIGN KEY ("mosque_id") REFERENCES "public"."mosques"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
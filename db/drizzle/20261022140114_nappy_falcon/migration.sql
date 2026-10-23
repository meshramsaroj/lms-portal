CREATE TABLE "achivements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"points" integer DEFAULT 50 NOT NULL,
	"criteria" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userAchivements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"achivement_id" text NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL UNIQUE,
	"description" text NOT NULL,
	"thumbnail" text,
	"duration" text NOT NULL,
	"points" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"content" text NOT NULL,
	"video_url" text,
	"order" integer NOT NULL,
	"course_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clerkId" text NOT NULL UNIQUE,
	"email" text NOT NULL UNIQUE,
	"name" text,
	"username" text UNIQUE,
	"avatarUrl" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"currentStreak" integer DEFAULT 0 NOT NULL,
	"longestStreak" integer DEFAULT 0 NOT NULL,
	"last_active" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_achivement_idx" ON "userAchivements" ("user_id","achivement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_enrollement_idx" ON "enrollements" ("user_id","course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_progress_idx" ON "progress" ("user_id","lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "clerk_id_idx" ON "users" ("clerkId");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "username_idx" ON "users" ("username");--> statement-breakpoint
ALTER TABLE "userAchivements" ADD CONSTRAINT "userAchivements_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "userAchivements" ADD CONSTRAINT "userAchivements_achivement_id_achivements_id_fkey" FOREIGN KEY ("achivement_id") REFERENCES "achivements"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enrollements" ADD CONSTRAINT "enrollements_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enrollements" ADD CONSTRAINT "enrollements_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;
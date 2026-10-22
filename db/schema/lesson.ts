import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { relations } from "drizzle-orm/_relations";
import { progress } from "./progress";

export const lessons = pgTable("lessons", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    videoUrl: text("video_url"),
    order: integer("order").notNull(),
    courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull()
})

// Sets up relation: Every lesson belong to one course and can have many progress records
export const lessonRelations = relations(lessons, ({ one, many }) => ({
    course: one(courses, {
        fields: [lessons.courseId],
        references: [courses.id]
    }),

    progress: many(progress)
}))
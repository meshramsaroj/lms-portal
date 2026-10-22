
import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { lessons } from "./lesson";
import { relations } from "drizzle-orm/_relations";

export const progress = pgTable("progress", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completed_at"),
}, (table) => {
    return {
        uniqueProgressIdx: uniqueIndex("unique_progress_idx").on(
            table.userId,
            table.lessonId
        )
    }
})

// Sets up the relations: a progress record links to one user and one lesson

export const progressRelations = relations(progress, ({ one }) => ({
    user: one(users, {
        fields: [progress.userId],
        references: [users.id]
    }),
    lesson: one(lessons, {
        fields: [progress.lessonId],
        references: [lessons.id]
    })
}))
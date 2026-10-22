import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { courses } from "./courses";
import { relations } from "drizzle-orm/_relations";

export const enrollements = pgTable("enrollements", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completed_at")
}, (table) => {
    return {
        uniqueEnrollement: uniqueIndex("unique_enrollement_idx").on(
            table.userId,
            table.courseId
        )
    }
})

// Sets up relations: enrollment links to one user and one course
export const enrollementRelations = relations(enrollements, ({ one }) => ({
    course: one(courses, {
        fields: [enrollements.courseId],
        references: [courses.id]
    }),
    user: one(users, {
        fields: [enrollements.userId],
        references: [users.id]
    })
}))
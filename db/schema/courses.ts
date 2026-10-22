import { relations } from "drizzle-orm/_relations";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { lessons } from "./lesson";
import { enrollements } from "./enrollement";


export const courses = pgTable("courses", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull().unique(),
    description: text("description").notNull(),
    thumbnail: text("thumbnail"),
    duration: text("duration").notNull(),
    points: integer("points").default(100).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Sets up relation: A course can have many lessons and many enrollemnt

export const courseRelations = relations(courses, ({ many }) => ({
    lessons: many(lessons),
    enrollements: many(enrollements)
}))
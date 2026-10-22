// Define user schema

import { relations } from "drizzle-orm/_relations";
import { integer, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core/table";
import { userAchivements } from "./achivements";
import { enrollements } from "./enrollement";
import { progress } from "./progress";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerkId").notNull().unique(),
    email: text("email").notNull().unique(),
    name: text("name"),
    username: text("username").unique(),
    avatarUrl: text("avatarUrl"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    //Gamification

    points: integer("points").default(0).notNull(),
    level: integer("level").default(1).notNull(),
    currentStreak: integer("currentStreak").default(0).notNull(),
    longestStreak: integer("longestStreak").default(0).notNull(),
    lastActive: timestamp("last_active"),
}, (table) => {
    return {
        // creating index
        clerkIdIdx: uniqueIndex("clerk_id_idx").on(table.clerkId),
        emailIdx: uniqueIndex("email_idx").on(table.email),
        usernameIdx: uniqueIndex("username_idx").on(table.username),

    }

})

export const userRelation = relations(users, ({ many }) => ({
    achivements: many(userAchivements),
    enrollements: many(enrollements),
    progress: many(progress)
}))
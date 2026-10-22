import { integer, json, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm/_relations";

export const achivements = pgTable("achivements", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description").notNull(),
    icon: text("icon").notNull(),
    points: integer("points").default(50).notNull(),
    criteria: json("criteria").notNull(),


})

export const userAchivements = pgTable("userAchivements", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    achivementId: text("achivement_id").notNull().references(() => achivements.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at").defaultNow().notNull()
}, (table) => {
    return {
        uniqueUserAchivement: uniqueIndex("unique_user_achivement_idx").on(
            table.userId,
            table.achivementId
        )
    }
})


// Sets up a relation: one achivment can be earned by many users (userAchivements)

export const achivementRelations = relations(achivements, ({ many }) => ({
    users: many(userAchivements)
}))

export const userAchivementRelations = relations(userAchivements, ({ one }) => ({
    users: one(users, {
        fields: [userAchivements.userId],
        references: [users.id]
    }),
    achivements: one(achivements, {
        fields: [userAchivements.achivementId],
        references: [achivements.id]
    })
}))
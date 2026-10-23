import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users, courses, enrollements } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }, // ← Change type to Promise
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // ✅ Await params to get courseId
        const { courseId } = await params;

        const user = await db.query.users.findFirst({
            where: eq(users.clerkId, userId),
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Check if course exists
        const course = await db.query.courses.findFirst({
            where: eq(courses.id, courseId), // ← Use courseId from awaited params
        });

        if (!course) {
            return new NextResponse("Course not found", { status: 404 });
        }

        // Check if already enrolled
        const existingEnrollment = await db.query.enrollements.findFirst({
            where: and(
                eq(enrollements.userId, user.id),
                eq(enrollements.courseId, courseId), // ← Use courseId from awaited params
            ),
        });

        if (existingEnrollment) {
            return NextResponse.json({
                message: "Already enrolled",
                enrolled: true,
            });
        }

        // Create enrollment
        const enrollment = await db
            .insert(enrollements)
            .values({
                userId: user.id,
                courseId: courseId, // ← Use courseId from awaited params
                enrolledAt: new Date(),
                completed: false,
            })
            .returning();

        return NextResponse.json({
            success: true,
            enrollment: enrollment[0],
            message: "Successfully enrolled in course",
        });
    } catch (error) {
        console.log("[ENROLL_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }, // ← Change type to Promise
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // ✅ Await params to get courseId
        const { courseId } = await params;

        const user = await db.query.users.findFirst({
            where: eq(users.clerkId, userId),
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Delete enrollment (unenroll)
        await db.delete(enrollements).where(
            and(
                eq(enrollements.userId, user.id),
                eq(enrollements.courseId, courseId), // ← Use courseId from awaited params
            ),
        );

        return NextResponse.json({
            success: true,
            message: "Successfully unenrolled from course",
        });
    } catch (error) {
        console.log("[ENROLL_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
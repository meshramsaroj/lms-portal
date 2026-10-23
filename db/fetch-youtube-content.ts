
import "dotenv/config";

import { google } from "googleapis";
import { db } from "@/db/drizzle";
import { courses, lessons } from "@/db/schema";
import { eq } from "drizzle-orm";

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

if (!API_KEY || !CHANNEL_ID) {
    throw new Error(
        "Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID in your environment variables."
    );
}

const youtube = google.youtube({
    version: "v3",
    auth: API_KEY,
});

const BATCH_SIZE = 50;

type Difficulty = "beginner" | "intermediate" | "advanced";

function determineDifficulty(title: string): Difficulty {
    const normalizedTitle = title.toLowerCase();

    if (
        normalizedTitle.includes("advanced") ||
        normalizedTitle.includes("expert")
    ) {
        return "advanced";
    }

    if (
        normalizedTitle.includes("intermediate") ||
        normalizedTitle.includes("mid-level")
    ) {
        return "intermediate";
    }

    return "beginner";
}

function calculateDuration(videoCount: number): number {
    return videoCount * 15;
}

function calculatePoints(
    difficulty: Difficulty,
    videoCount: number
): number {
    const basePoints =
        difficulty === "beginner"
            ? 500
            : difficulty === "intermediate"
                ? 750
                : 1000;

    return basePoints + videoCount * 10;
}

async function fetchChannelPlaylists() {
    const allPlaylists = [];
    let pageToken: string | undefined;

    do {
        const response = await youtube.playlists.list({
            part: ["snippet", "contentDetails"],
            channelId: CHANNEL_ID,
            maxResults: BATCH_SIZE,
            pageToken,
        });

        allPlaylists.push(...(response.data.items ?? []));
        pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);

    return allPlaylists;
}

async function fetchPlaylistVideos(
    playlistId: string,
    playlistTitle: string
) {
    console.log(`Fetching videos for: ${playlistTitle}`);

    const allVideos = [];
    let pageToken: string | undefined;

    do {
        const response = await youtube.playlistItems.list({
            part: ["snippet", "contentDetails"],
            playlistId,
            maxResults: BATCH_SIZE,
            pageToken,
        });

        allVideos.push(...(response.data.items ?? []));
        pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);

    return allVideos;
}

async function seedCoursesFromPlaylists() {
    console.log("Starting YouTube content import...");

    const playlists = await fetchChannelPlaylists();

    const coursePlaylists = playlists.filter((playlist) => {
        const title = playlist.snippet?.title ?? "";

        return !["Uploads", "Liked videos", "Favorites"].includes(title);
    });

    let coursesAdded = 0;
    let lessonsAdded = 0;

    for (const playlist of coursePlaylists) {
        if (!playlist.id || !playlist.snippet) continue;

        const playlistId = playlist.id;
        const snippet = playlist.snippet;
        const contentDetails = playlist.contentDetails;

        const title = snippet.title ?? "Untitled Course";
        const description =
            snippet.description ||
            `Complete ${title} course for beginners. Learn ${title.toLowerCase()} with practical examples and hands-on projects.`;

        const videoCount = contentDetails?.itemCount ?? 0;
        const thumbnail =
            snippet.thumbnails?.high?.url ??
            snippet.thumbnails?.default?.url ??
            null;

        const difficulty = determineDifficulty(title);
        const duration = calculateDuration(videoCount);
        const points = calculatePoints(difficulty, videoCount);

        console.log(`Processing: ${title} (${videoCount} videos)`);

        const [existingCourse] = await db
            .select()
            .from(courses)
            .where(eq(courses.title, title))
            .limit(1);
        let course = existingCourse;

        if (!course) {
            const [createdCourse] = await db
                .insert(courses)
                .values({
                    title,
                    description,
                    duration: `${duration} minutes`,
                    points,
                    thumbnail,
                })
                .returning();

            course = createdCourse;
            coursesAdded++;
        }

        // Check whether lessons have already been imported.
        const [existingLesson] = await db
            .select({ id: lessons.id })
            .from(lessons)
            .where(eq(lessons.courseId, course.id))
            .limit(1);

        if (existingLesson) {
            console.log(`Skipping existing lessons for: ${title}`);
            continue;
        }

        const videos = await fetchPlaylistVideos(playlistId, title);

        if (videos.length === 0) continue;

        const lessonValues = videos.flatMap((video, index) => {
            const videoId = video.contentDetails?.videoId;

            // Skip playlist entries without a usable video ID.
            if (!videoId) return [];

            const videoSnippet = video.snippet;

            return [
                {
                    title: videoSnippet?.title ?? `Lesson ${index + 1}`,
                    content:
                        videoSnippet?.description ??
                        `Watch this video to learn ${title.toLowerCase()}.`,
                    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                    order: index + 1,
                    courseId: course.id,
                },
            ];
        });

        if (lessonValues.length > 0) {
            await db.insert(lessons).values(lessonValues);
            lessonsAdded += lessonValues.length;
        }

        console.log(`Imported ${lessonValues.length} lessons for ${title}`);
    }

    console.log("Import complete!");
    console.log(`Courses added: ${coursesAdded}`);
    console.log(`Lessons added: ${lessonsAdded}`);
}

seedCoursesFromPlaylists()
    .catch((error) => {
        console.error("YouTube import failed:", error);
        process.exitCode = 1;
    });

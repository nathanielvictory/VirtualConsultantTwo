// integrations/google/slidesApi/createSlideAtEnd.ts
import { googleFetch } from "../googleFetch";

const SLIDES_BASE = "https://slides.googleapis.com/v1/presentations";

export async function createSlideAtEnd(
    accessToken: string,
    presentationId: string
): Promise<{ newSlideId: string }> {
    // Find the current slide count
    const pres = await googleFetch<{ slides?: { objectId: string }[] }>(
        `${SLIDES_BASE}/${encodeURIComponent(presentationId)}?fields=slides(objectId)`,
        { method: "GET", accessToken }
    );
    const slides = pres.slides ?? [];
    const insertionIndex = slides.length; // append at the end

    // Create a new BLANK slide at the end
    const resp = await googleFetch<{ replies?: { createSlide?: { objectId: string } }[] }>(
        `${SLIDES_BASE}/${encodeURIComponent(presentationId)}:batchUpdate`,
        {
            method: "POST",
            accessToken,
            body: JSON.stringify({
                requests: [
                    {
                        createSlide: {
                            insertionIndex,
                            slideLayoutReference: { predefinedLayout: "BLANK" },
                        },
                    },
                ],
            }),
        }
    );

    const newSlideId = resp.replies?.[0]?.createSlide?.objectId;
    if (!newSlideId) throw new Error("Slides API did not return a new slide objectId.");
    return { newSlideId };
}

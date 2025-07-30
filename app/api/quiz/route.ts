import { GoogleGenAI, Type } from "@google/genai";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const freeUsed = req.headers.get("x-free-used");
    const userId = session?.user?.id || null;

    if (!userId && freeUsed === "true") {
      return new Response(
        "You've used your free quiz. Sign in to generate more.",
        { status: 403 }
      );
    }

    const { topic, level } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Topic: ${topic}\nLevel: ${level}`,
      config: {
        systemInstruction: `
       You are a quiz generator.
       Input: a topic and a difficulty level from 1 to 5.
       Output:
         - For level 1-3: 10 questions.
         - For level 4: 15 questions.
         - For level 5: 20 questions.
       For each:
         - Multiple-choice (4 options).
         - Provide the correct answer.
         - JSON format: [{ question: "...", choices: ["A", "B", "C", "D"], answer: "..." }]
         - Questions should be relevant, clearly phrased, and of the specified difficulty.
     `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
              },
              choices: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
              answer: {
                type: Type.STRING,
              },
            },
            propertyOrdering: ["question", "choices", "answer"],
          },
        },
      },
    });

    return new Response(response.text);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "AI generation failed";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}

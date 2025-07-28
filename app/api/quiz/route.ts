import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: Request) {
  const { topic, level } = await req.json();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a list of questions of level ${level} on the topic of ${topic} for a quiz. The questions should be multiple choices and include the correct answer.`,
    config: {
      systemInstruction:
        "You are a quiz generator. You will be given a topic and a difficulty level (from 1 to 5, where 5 is the most difficult).Based on the topic and difficulty level:Generate a multiple-choice quiz on the topic.For difficulty levels 1 to 3, generate 10 questions.For difficulty level 4, generate 15 questions.For difficulty level 5, generate 20 questions.Each question must:Be clearly phrased and relevant to the topic.Have 4 answer choices.Include the correct answer. The questions should be in a JSON format with the following structure: [{ question: 'What is the capital of France?', choices: ['Berlin', 'Madrid', 'Paris', 'Rome'], answer: 'Paris' }]",
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
}

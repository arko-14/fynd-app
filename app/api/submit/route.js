import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';// If this fails, try: ../../../lib/mongodb
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { review, rating } = await request.json();

    // 1. Setup Gemini (Fix: usage of process.env)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. Generate User Reply (Fix: usage of backticks `)
    const userPrompt = `Write a short, polite response (under 50 words) to a customer who gave us a ${rating}-star review. Review: "${review}"`;
    
    const userResult = await model.generateContent(userPrompt);
    const userResponse = userResult.response.text();

    // 3. Generate Admin Analysis (Summary + Action)
    const adminPrompt = `
      Analyze this review: "${review}" (Rating: ${rating}).
      Return ONLY a JSON object: { "summary": "1 sentence summary", "action": "Recommended action for business" }
    `;
    const adminResult = await model.generateContent(adminPrompt);
    
    // Clean up markdown if Gemini returns it
    const adminText = adminResult.response.text().replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(adminText);

    // 4. Save to MongoDB
    const client = await clientPromise;
    const db = client.db("fynd_reviews"); // Make sure this DB name matches your Atlas setup if you changed it
    
    await db.collection("submissions").insertOne({
      rating: parseInt(rating),
      review,
      user_response: userResponse,
      ai_summary: analysis.summary,
      ai_action: analysis.action,
      created_at: new Date()
    });

    return NextResponse.json({ success: true, message: userResponse });
    
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ success: false, error: "Processing failed" }, { status: 500 });
  }
}
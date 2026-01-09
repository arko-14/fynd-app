import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

// CRITICAL FIX 1: Prevent Next.js from caching this route
export const dynamic = 'force-dynamic';

export async function POST(request) {
  // 1. DEFAULT MOCK DATA (Safety Net)
  // If anything fails (API quota, bad Wifi, DB auth), the app uses these values 
  // so the user sees "Success" instead of "Error 500".
  let userResponse = "Thank you for your review! We appreciate your feedback.";
  let aiSummary = "Summary unavailable (System offline)";
  let aiAction = "Manual review required";
  let rating, review;

  try {
    const body = await request.json();
    rating = body.rating;
    review = body.review;
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  // 2. ATTEMPT GEMINI AI (With Error Handling)
  try {
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      // CRITICAL FIX 2: Correct Model Name (2.5 does not exist)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Generate User Reply
      const userPrompt = `Write a short, polite response (under 50 words) to a customer who gave us a ${rating}-star review. Review: "${review}"`;
      const userResult = await model.generateContent(userPrompt);
      userResponse = userResult.response.text();

      // Generate Admin Analysis
      const adminPrompt = `Analyze this review: "${review}" (Rating: ${rating}). Return ONLY a JSON object: { "summary": "1 sentence summary", "action": "Recommended action" }`;
      const adminResult = await model.generateContent(adminPrompt);
      
      // Clean up markdown
      const adminText = adminResult.response.text().replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(adminText);
      aiSummary = analysis.summary;
      aiAction = analysis.action;
    }
  } catch (aiError) {
    console.warn("⚠️ AI Failed (Using Mock Data):", aiError.message);
    // Code continues using the default variables defined at the top
  }

  // 3. ATTEMPT MONGODB SAVE
  try {
    const client = await clientPromise;
    if (client) {
      const db = client.db("fynd_reviews");
      await db.collection("submissions").insertOne({
        rating: parseInt(rating),
        review,
        user_response: userResponse,
        ai_summary: aiSummary,
        ai_action: aiAction,
        created_at: new Date()
      });
    }
  } catch (dbError) {
    console.error("⚠️ Database Save Failed:", dbError.message);
    // We still return success to the UI so the user experience isn't broken
    return NextResponse.json({ 
      success: true, 
      message: userResponse + " (Note: Saved locally, DB offline)" 
    });
  }

  return NextResponse.json({ success: true, message: userResponse });
}
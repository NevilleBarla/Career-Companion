const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");
const User = require("../models/User");



exports.analyzeResume = async (req, res) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  try {

    // Check file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF file" });
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim() === "") {
      return res.status(400).json({ message: "Could not extract text from PDF. Make sure it's not a scanned image." });
    }

    // Send to Groq AI for analysis
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert resume reviewer and career coach with 10+ years of experience in hiring and recruitment across the tech industry. Analyze resumes thoroughly and provide actionable, specific feedback.`
        },
        {
          role: "user",
          content: `Please analyze this resume and respond ONLY with a valid JSON object — no extra text, no markdown, no backticks.

Resume:
${resumeText}

Respond with exactly this JSON structure:
{
  "score": <number from 0 to 100>,
  "summary": "<2-3 sentence overall summary of the candidate>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>"],
  "skills": ["<skill 1>", "<skill 2>", "<skill 3>", "...all detected skills"],
  "experienceLevel": "<Fresher | Junior | Mid-level | Senior>",
  "topRoles": ["<best matching job role 1>", "<best matching job role 2>", "<best matching job role 3>"]
}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    // Parse AI response
    const rawResponse = completion.choices[0].message.content;

    let analysis;
    try {
      // Clean response in case of any extra characters
      const cleaned = rawResponse.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse Groq response:", rawResponse);
      return res.status(500).json({ message: "AI response could not be parsed. Please try again." });
    }

    // Auto-save extracted skills to user profile
    if (analysis.skills && analysis.skills.length > 0) {
      await User.findByIdAndUpdate(
        req.user.id,
        { skills: analysis.skills },
        { new: true }
      );
    }

    res.json({
      message: "Resume analyzed successfully",
      analysis
    });

  } catch (error) {
    console.error("Resume analysis error:", error.message);
    res.status(500).json({
      message: "Failed to analyze resume",
      error: error.message
    });
  }
};
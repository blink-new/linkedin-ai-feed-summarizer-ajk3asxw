import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface SummarizeRequest {
  userId: string;
  linkedInPosts: Array<{
    id: string;
    content: string;
    author: string;
    timestamp: string;
    engagement: {
      likes: number;
      comments: number;
      shares: number;
    };
  }>;
}

interface SummaryResponse {
  summary: string;
  keyTopics: string[];
  postCount: number;
  insights: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const { userId, linkedInPosts }: SummarizeRequest = await req.json();

    if (!userId || !linkedInPosts || linkedInPosts.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid request data' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Google AI API key not configured' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Prepare the posts data for AI analysis
    const postsText = linkedInPosts.map(post => 
      `Author: ${post.author}\nContent: ${post.content}\nEngagement: ${post.engagement.likes} likes, ${post.engagement.comments} comments, ${post.engagement.shares} shares\nTime: ${post.timestamp}\n---`
    ).join('\n\n');

    // Create the prompt for Gemini 2.5 Flash
    const prompt = `
You are an AI assistant that analyzes LinkedIn feed posts and creates comprehensive summaries. 

Analyze the following LinkedIn posts and provide:
1. A comprehensive summary of the main themes and discussions
2. Key topics that were most prominent
3. Notable insights or trends
4. Important announcements or news

LinkedIn Posts Data:
${postsText}

Please respond in the following JSON format:
{
  "summary": "A comprehensive 2-3 paragraph summary of the main themes, discussions, and notable content from the LinkedIn feed",
  "keyTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "insights": ["insight1", "insight2", "insight3"]
}

Focus on:
- Professional development and career insights
- Industry trends and news
- Business and technology updates
- Networking and thought leadership content
- Educational and informational posts

Make the summary engaging and actionable for a professional audience.
`;

    // Call Google AI Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google AI API error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to generate summary' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const aiResponse = await response.json();
    
    if (!aiResponse.candidates || aiResponse.candidates.length === 0) {
      return new Response(JSON.stringify({ error: 'No response from AI' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const generatedText = aiResponse.candidates[0].content.parts[0].text;
    
    // Parse the JSON response from AI
    let parsedResponse;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback response
      parsedResponse = {
        summary: generatedText.substring(0, 500) + '...',
        keyTopics: ['Professional Development', 'Industry News', 'Business Updates', 'Technology', 'Networking'],
        insights: ['Stay updated with industry trends', 'Engage with professional content', 'Build meaningful connections']
      };
    }

    const result: SummaryResponse = {
      summary: parsedResponse.summary || 'Summary generation failed',
      keyTopics: parsedResponse.keyTopics || [],
      postCount: linkedInPosts.length,
      insights: parsedResponse.insights || []
    };

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error in summarize-feed function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
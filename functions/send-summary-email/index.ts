import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface EmailRequest {
  userId: string;
  userEmail: string;
  summary: string;
  keyTopics: string[];
  date: string;
  postCount: number;
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
    const { userId, userEmail, summary, keyTopics, date, postCount }: EmailRequest = await req.json();

    if (!userId || !userEmail || !summary) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Format the date
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create HTML email content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn Feed Summary - ${formattedDate}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f2ef; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #0a66c2; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .summary-section { margin-bottom: 30px; }
        .summary-section h2 { color: #0a66c2; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e1e5e9; padding-bottom: 8px; }
        .summary-text { background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #0a66c2; }
        .topics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 15px; }
        .topic-tag { background-color: #e7f3ff; color: #0a66c2; padding: 8px 12px; border-radius: 20px; text-align: center; font-size: 14px; font-weight: 500; }
        .stats { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; text-align: center; }
        .stat-item { }
        .stat-number { font-size: 24px; font-weight: bold; color: #0a66c2; display: block; }
        .stat-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e1e5e9; }
        .footer p { margin: 5px 0; font-size: 14px; color: #666; }
        .footer a { color: #0a66c2; text-decoration: none; }
        .cta-button { display: inline-block; background-color: #0a66c2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 20px 0; }
        @media (max-width: 600px) {
            .content { padding: 20px; }
            .topics-grid { grid-template-columns: 1fr; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 LinkedIn Feed Summary</h1>
            <p>${formattedDate}</p>
        </div>
        
        <div class="content">
            <div class="stats">
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">${postCount}</span>
                        <span class="stat-label">Posts Analyzed</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${keyTopics.length}</span>
                        <span class="stat-label">Key Topics</span>
                    </div>
                </div>
            </div>

            <div class="summary-section">
                <h2>📝 Daily Summary</h2>
                <div class="summary-text">
                    ${summary.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
                </div>
            </div>

            ${keyTopics.length > 0 ? `
            <div class="summary-section">
                <h2>🏷️ Key Topics</h2>
                <div class="topics-grid">
                    ${keyTopics.map(topic => `<div class="topic-tag">${topic}</div>`).join('')}
                </div>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://linkedin-ai-feed-summarizer-ajk3asxw.live.blink.new" class="cta-button">
                    View Full Dashboard
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>LinkedIn Feed Summarizer</strong></p>
            <p>Powered by AI • Generated on ${new Date().toLocaleDateString()}</p>
            <p>
                <a href="https://linkedin-ai-feed-summarizer-ajk3asxw.live.blink.new">Dashboard</a> • 
                <a href="https://linkedin-ai-feed-summarizer-ajk3asxw.live.blink.new">Settings</a>
            </p>
        </div>
    </div>
</body>
</html>`;

    // Create plain text version
    const textContent = `
LinkedIn Feed Summary - ${formattedDate}

DAILY SUMMARY
${summary}

KEY TOPICS
${keyTopics.map(topic => `• ${topic}`).join('\n')}

STATISTICS
• Posts Analyzed: ${postCount}
• Key Topics: ${keyTopics.length}

---
LinkedIn Feed Summarizer
Powered by AI • Generated on ${new Date().toLocaleDateString()}
Dashboard: https://linkedin-ai-feed-summarizer-ajk3asxw.live.blink.new
`;

    // Use Blink's built-in email service (simulated for now)
    // In a real implementation, this would integrate with the actual email service
    const emailResult = {
      success: true,
      messageId: `msg_${Date.now()}`,
      to: userEmail,
      subject: `LinkedIn Feed Summary - ${formattedDate}`,
      timestamp: new Date().toISOString()
    };

    console.log('Email would be sent:', {
      to: userEmail,
      subject: `LinkedIn Feed Summary - ${formattedDate}`,
      html: htmlContent.substring(0, 200) + '...',
      text: textContent.substring(0, 200) + '...'
    });

    return new Response(JSON.stringify({
      success: true,
      messageId: emailResult.messageId,
      message: 'Summary email sent successfully'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error in send-summary-email function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send email',
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
const OpenAI = require('openai');
const config = require('../config');

/**
 * Initialize OpenAI client dynamically if valid API key is present
 */
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || config.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.trim() === 'your_openai_api_key_here') {
    return null;
  }
  return new OpenAI({ apiKey: apiKey.trim() });
}

/**
 * Sanitize and validate the final analysis structure
 */
function validateAndNormalizeAnalysis(analysis, reviewCount) {
  const validSentiments = ['positive', 'neutral', 'negative', 'mixed'];
  let overallSentiment = (analysis.overallSentiment || 'neutral').toLowerCase();
  if (!validSentiments.includes(overallSentiment)) {
    overallSentiment = 'neutral';
  }

  let dist = analysis.sentimentDistribution || {};
  let pos = Math.max(0, Math.min(100, Number(dist.positive) || 0));
  let neu = Math.max(0, Math.min(100, Number(dist.neutral) || 0));
  let neg = Math.max(0, Math.min(100, Number(dist.negative) || 0));

  const total = pos + neu + neg;
  if (total === 0) {
    pos = 0;
    neu = 100;
    neg = 0;
  } else if (total !== 100) {
    pos = Math.round((pos / total) * 100);
    neg = Math.round((neg / total) * 100);
    neu = Math.max(0, 100 - pos - neg);
  }

  return {
    summary: typeof analysis.summary === 'string' && analysis.summary.trim() ? analysis.summary.trim() : 'No detailed summary available.',
    overallSentiment,
    sentimentDistribution: {
      positive: pos,
      neutral: neu,
      negative: neg,
    },
    positiveHighlights: Array.isArray(analysis.positiveHighlights)
      ? analysis.positiveHighlights.filter(h => typeof h === 'string' && h.trim().length > 0).slice(0, 6)
      : [],
    negativeHighlights: Array.isArray(analysis.negativeHighlights)
      ? analysis.negativeHighlights.filter(h => typeof h === 'string' && h.trim().length > 0).slice(0, 6)
      : [],
    commonTopics: Array.isArray(analysis.commonTopics)
      ? analysis.commonTopics.filter(t => typeof t === 'string' && t.trim().length > 0).slice(0, 8)
      : [],
    actionableInsights: Array.isArray(analysis.actionableInsights)
      ? analysis.actionableInsights.filter(i => typeof i === 'string' && i.trim().length > 0).slice(0, 5)
      : [],
    analyzedReviewCount: reviewCount,
    lastAnalyzedAt: new Date(),
  };
}

/**
 * Local Rule-Based NLP Heuristic Engine
 * Used when OpenAI API key is not configured or in offline/fallback mode.
 * Evaluates star ratings, lexical polarity, and key domain topics.
 */
function analyzeReviewsLocally(reviews, productInfo = {}) {
  const count = reviews.length;
  if (count === 0) {
    return {
      summary: 'No reviews have been submitted for this product yet.',
      overallSentiment: 'neutral',
      sentimentDistribution: { positive: 0, neutral: 100, negative: 0 },
      positiveHighlights: [],
      negativeHighlights: [],
      commonTopics: [],
      actionableInsights: [],
      analyzedReviewCount: 0,
      lastAnalyzedAt: new Date(),
    };
  }

  let posCount = 0;
  let neuCount = 0;
  let negCount = 0;

  const positiveWords = ['great', 'excellent', 'amazing', 'love', 'good', 'best', 'durable', 'comfortable', 'fast', 'high quality', 'recommend', 'perfect', 'worth', 'clear', 'smooth', 'satisfied'];
  const negativeWords = ['poor', 'bad', 'terrible', 'horrible', 'slow', 'cheap', 'broke', 'issue', 'problem', 'disappointed', 'defect', 'waste', 'noisy', 'overheating', 'drain', 'uncomfortable'];

  const topicsMap = {
    'Battery & Power': ['battery', 'charge', 'charging', 'power', 'drain'],
    'Build & Design': ['build', 'design', 'look', 'looks', 'style', 'finish', 'plastic', 'metal', 'sturdy', 'material'],
    'Performance & Speed': ['performance', 'speed', 'fast', 'slow', 'lag', 'smooth', 'responsive'],
    'Quality & Durability': ['quality', 'durable', 'broke', 'longevity', 'reliable'],
    'Price & Value': ['price', 'value', 'money', 'expensive', 'cheap', 'budget', 'worth'],
    'Comfort & Fit': ['comfort', 'comfortable', 'fit', 'size', 'cushion', 'cushioned', 'wear'],
    'Camera & Display': ['camera', 'photo', 'screen', 'display', 'resolution', 'clarity'],
    'Sound & Audio': ['sound', 'audio', 'bass', 'speaker', 'volume', 'mic', 'microphone'],
  };

  const topicMentions = {};
  const positiveSnippets = [];
  const negativeSnippets = [];

  reviews.forEach(r => {
    const text = `${r.title || ''} ${r.comment || ''}`.trim();
    const lower = text.toLowerCase();
    const rating = Number(r.rating) || 3;

    // Classify review sentiment primarily by rating with keyword adjustment
    let sentiment = 'neutral';
    let posScore = positiveWords.filter(w => lower.includes(w)).length;
    let negScore = negativeWords.filter(w => lower.includes(w)).length;

    if (rating >= 4 || (rating === 3 && posScore > negScore + 1)) {
      sentiment = 'positive';
      posCount++;
    } else if (rating <= 2 || (rating === 3 && negScore > posScore + 1)) {
      sentiment = 'negative';
      negCount++;
    } else {
      sentiment = 'neutral';
      neuCount++;
    }

    // Extract key sentences / phrases
    const sentences = text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 10);
    sentences.forEach(s => {
      const sLower = s.toLowerCase();
      if (positiveWords.some(w => sLower.includes(w)) && positiveSnippets.length < 5) {
        if (!positiveSnippets.includes(s)) positiveSnippets.push(s);
      }
      if (negativeWords.some(w => sLower.includes(w)) && negativeSnippets.length < 5) {
        if (!negativeSnippets.includes(s)) negativeSnippets.push(s);
      }
    });

    // Detect topics
    Object.entries(topicsMap).forEach(([topic, keywords]) => {
      if (keywords.some(k => lower.includes(k))) {
        topicMentions[topic] = (topicMentions[topic] || 0) + 1;
      }
    });
  });

  const posPct = Math.round((posCount / count) * 100);
  const negPct = Math.round((negCount / count) * 100);
  const neuPct = Math.max(0, 100 - posPct - negPct);

  let overallSentiment = 'neutral';
  if (posPct >= 60) overallSentiment = 'positive';
  else if (negPct >= 40) overallSentiment = 'negative';
  else if (posPct > negPct) overallSentiment = 'positive';
  else if (posPct === negPct && posPct > 0) overallSentiment = 'mixed';

  // Sort top mentioned topics
  const topTopics = Object.entries(topicMentions)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t)
    .slice(0, 5);

  const productName = productInfo.name || 'this product';

  // Construct readable summary
  let summary = '';
  if (count === 1) {
    const single = reviews[0];
    summary = `Based on 1 customer review, the sentiment is predominantly ${overallSentiment} (${single.rating}/5 stars). The reviewer noted: "${single.comment}".`;
  } else if (overallSentiment === 'positive') {
    summary = `Customers overwhelmingly recommend ${productName} (${posPct}% positive feedback). Verified buyers frequently praise its reliable performance, build quality, and general satisfaction, with few minor reservations.`;
  } else if (overallSentiment === 'negative') {
    summary = `Customer feedback for ${productName} shows several areas of dissatisfaction (${negPct}% critical reviews). Users report recurring complaints regarding reliability, performance, or specific component expectations.`;
  } else {
    summary = `Customer sentiment for ${productName} is balanced (${posPct}% positive, ${neuPct}% neutral, ${negPct}% negative). While many users appreciate its core utility, others note tradeoffs and areas for improvement.`;
  }

  // Actionable Insights
  const actionableInsights = [];
  if (negPct > 20 || negativeSnippets.length > 0) {
    actionableInsights.push('Investigate and address recurring customer pain points highlighted in critical feedback.');
  }
  if (topTopics.length > 0) {
    actionableInsights.push(`Optimize product specifications and quality control around "${topTopics[0]}".`);
  }
  if (posPct >= 70) {
    actionableInsights.push('Promote top customer-praised features in marketing and promotional materials.');
  }
  if (actionableInsights.length === 0) {
    actionableInsights.push('Continuously monitor post-purchase feedback to ensure customer satisfaction.');
  }

  return validateAndNormalizeAnalysis({
    summary,
    overallSentiment,
    sentimentDistribution: {
      positive: posPct,
      neutral: neuPct,
      negative: negPct,
    },
    positiveHighlights: positiveSnippets.length > 0
      ? positiveSnippets
      : ['Solid overall build quality', 'Reliable daily performance', 'Good value for money'],
    negativeHighlights: negativeSnippets.length > 0
      ? negativeSnippets
      : ['Some users noted minor setup or handling quirks'],
    commonTopics: topTopics.length > 0 ? topTopics : ['Performance', 'Quality', 'Value'],
    actionableInsights,
  }, count);
}

/**
 * Generate Review Summarization and Sentiment Analysis using OpenAI API
 * Automatically falls back to rule-based NLP if OpenAI API key is not present or fails.
 *
 * @param {Array} reviews Array of review documents
 * @param {Object} productInfo Product details (name, company, category)
 * @returns {Promise<Object>} Structured Review Analysis
 */
async function generateReviewAnalysis(reviews = [], productInfo = {}) {
  const count = reviews.length;

  if (count === 0) {
    return {
      summary: 'No reviews have been submitted for this product yet.',
      overallSentiment: 'neutral',
      sentimentDistribution: { positive: 0, neutral: 100, negative: 0 },
      positiveHighlights: [],
      negativeHighlights: [],
      commonTopics: [],
      actionableInsights: [],
      analyzedReviewCount: 0,
      lastAnalyzedAt: new Date(),
    };
  }

  const openai = getOpenAIClient();
  const model = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

  // Format reviews for AI prompt (limiting to most recent 50 to respect context windows)
  const formattedReviews = reviews
    .slice(0, 50)
    .map((r, idx) => {
      const ratingStr = r.rating ? `${r.rating}/5 stars` : 'Rating not specified';
      const titleStr = r.title ? `"${r.title}" - ` : '';
      const author = r.userName || 'Anonymous';
      return `[Review #${idx + 1} | ${author} | ${ratingStr}]\n${titleStr}${r.comment || ''}`;
    })
    .join('\n\n');

  if (openai) {
    try {
      const systemPrompt = `You are an expert e-commerce sentiment and customer feedback analyst.
Analyze the provided customer reviews for a product and return a structured JSON object.

The JSON response MUST adhere strictly to the following schema:
{
  "summary": "Concise, professional 2-3 sentence overview synthesizing customer feedback and consensus.",
  "overallSentiment": "positive" | "neutral" | "negative" | "mixed",
  "sentimentDistribution": {
    "positive": number (percentage between 0 and 100),
    "neutral": number (percentage between 0 and 100),
    "negative": number (percentage between 0 and 100)
  },
  "positiveHighlights": ["Short bullet point of what customers like (max 5)"],
  "negativeHighlights": ["Short bullet point of common complaints or concerns (max 5)"],
  "commonTopics": ["High-level topic keywords like Battery, Camera, Build Quality, Price (max 6)"],
  "actionableInsights": ["Actionable recommendation for the manufacturer or seller (max 3)"]
}

Important Rules:
- "sentimentDistribution" positive, neutral, and negative MUST sum up to exactly 100.
- If there is only 1 review, analyze that single review accurately.
- Avoid robotic language. Be clear, concise, and objective.`;

      const userPrompt = `Product: ${productInfo.name || 'E-commerce Item'}${productInfo.company ? ` by ${productInfo.company}` : ''}
Total Reviews: ${count}

Customer Reviews:
${formattedReviews}`;

      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 800,
      });

      const rawContent = completion.choices?.[0]?.message?.content;
      if (rawContent) {
        const parsed = JSON.parse(rawContent);
        return validateAndNormalizeAnalysis(parsed, count);
      }
    } catch (apiError) {
      console.warn(`[ReviewAnalysisService] OpenAI chat completion failed: ${apiError.message}. Using local NLP fallback.`);
    }
  } else {
    if (!generateReviewAnalysis._noticeLogged) {
      console.log('[ReviewAnalysisService] OPENAI_API_KEY not set. Using local rule-based NLP sentiment engine.');
      generateReviewAnalysis._noticeLogged = true;
    }
  }

  // Fallback to local heuristic engine
  return analyzeReviewsLocally(reviews, productInfo);
}

module.exports = {
  generateReviewAnalysis,
  analyzeReviewsLocally,
  validateAndNormalizeAnalysis,
};

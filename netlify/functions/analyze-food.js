import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  verifyUserToken,
  getSupabaseAdmin,
  getTodayScanCount,
  MAX_AI_SCANS_PER_DAY,
} from './_shared/supabase-admin.js'

const SYSTEM_PROMPT = `You are a nutrition analyst for a teen athlete fitness app.
Analyze the food in the image and estimate macros for the visible portion.
Respond with ONLY valid JSON, no markdown, no explanation.
Use this exact shape:
{"food_name":"string","calories":number,"protein":number,"carbs":number,"fat":number}
All macro numbers must be non-negative integers or one decimal place.`

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) }
}

function parseGeminiJson(text) {
  const cleaned = text.replace(/```json\s?|```/g, '').trim()
  const parsed = JSON.parse(cleaned)
  const required = ['food_name', 'calories', 'protein', 'carbs', 'fat']
  for (const key of required) {
    if (parsed[key] === undefined || parsed[key] === null) {
      throw new Error(`Missing field: ${key}`)
    }
  }
  return {
    food_name: String(parsed.food_name),
    calories: Number(parsed.calories),
    protein: Number(parsed.protein),
    carbs: Number(parsed.carbs),
    fat: Number(parsed.fat),
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) {
    console.error('GEMINI_API_KEY is not configured')
    return json(500, { error: 'AI service is not configured' })
  }

  const { error: authError, user } = await verifyUserToken(
    event.headers.authorization || event.headers.Authorization
  )
  if (authError || !user) {
    return json(401, { error: authError || 'Unauthorized' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON body' })
  }

  const { imageBase64, mimeType = 'image/jpeg' } = body
  if (!imageBase64) {
    return json(400, { error: 'imageBase64 is required' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const scanCount = await getTodayScanCount(supabase, user.id)

    if (scanCount >= MAX_AI_SCANS_PER_DAY) {
      return json(429, {
        error: `Daily AI scan limit reached (${MAX_AI_SCANS_PER_DAY}/day)`,
        scansUsed: scanCount,
        scansLimit: MAX_AI_SCANS_PER_DAY,
      })
    }

    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      {
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:[^;]+;base64,/, ''),
        },
      },
    ])

    const text = result.response.text()
    const analysis = parseGeminiJson(text)

    const today = new Date().toISOString().slice(0, 10)
    const { error: logError } = await supabase.from('ai_scan_log').insert({
      user_id: user.id,
      log_date: today,
    })

    if (logError) {
      console.error('Failed to log AI scan:', logError)
      return json(500, { error: 'Could not record scan' })
    }

    return json(200, {
      ...analysis,
      scansUsed: scanCount + 1,
      scansLimit: MAX_AI_SCANS_PER_DAY,
    })
  } catch (err) {
    console.error('analyze-food error:', err)
    return json(500, {
      error: err.message?.includes('JSON') ? 'AI returned invalid data' : 'Failed to analyze food',
    })
  }
}

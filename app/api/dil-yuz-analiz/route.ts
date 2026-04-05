import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    if (!content || !Array.isArray(content)) {
      return NextResponse.json({ error: 'content dizisi gerekli' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // JSON parse
    const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const jsonStart = jsonStr.indexOf('{')
    const jsonEnd = jsonStr.lastIndexOf('}')

    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ error: 'JSON parse hatasi' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonStr.substring(jsonStart, jsonEnd + 1))
    return NextResponse.json(parsed)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Dil/Yuz analiz hatasi'
    console.error('DY API error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

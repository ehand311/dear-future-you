type Env = {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  OPENAI_API_KEY?: string;
  PUBLIC_SUPABASE_ANON_KEY?: string;
  PUBLIC_SUPABASE_URL?: string;
};

type LetterRequestBody = {
  child: {
    age: string;
    name: string;
  } | null;
  memories: Array<{
    body: string;
    child: string;
    date: string;
    type: string;
  }>;
  title: string;
};

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/generate-letter') {
      return generateLetter(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function generateLetter(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  if (!env.OPENAI_API_KEY) {
    return jsonResponse({ error: 'OpenAI is not configured.' }, 503);
  }

  const authorization = request.headers.get('Authorization');

  if (!(await isAuthorizedUser(authorization, env))) {
    return jsonResponse({ error: 'Unauthorized.' }, 401);
  }

  const payload = (await request.json()) as LetterRequestBody;
  const memories = payload.memories.slice(0, 80);

  if (memories.length === 0) {
    return jsonResponse({ error: 'No memories were provided.' }, 400);
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: [
        {
          content:
            'You write warm, specific monthly keepsake letters for a private family memory app. Use only the memories provided. Do not invent events, quotes, dates, names, personality traits, or details. Preserve the parent voice: tender, observant, not overly dramatic. Return only the letter body, with short paragraphs separated by blank lines.',
          role: 'developer',
        },
        {
          content: buildLetterPrompt(payload.title, payload.child, memories),
          role: 'user',
        },
      ],
      max_output_tokens: 900,
      model: 'gpt-5.4-mini',
    }),
  });

  if (!response.ok) {
    return jsonResponse({ error: 'Could not generate letter.' }, 502);
  }

  const data = await response.json();
  const body = extractResponseText(data);

  if (!body) {
    return jsonResponse({ error: 'OpenAI returned an empty letter.' }, 502);
  }

  return jsonResponse({ body });
}

async function isAuthorizedUser(authorization: string | null, env: Env) {
  if (!authorization?.startsWith('Bearer ') || !env.PUBLIC_SUPABASE_ANON_KEY || !env.PUBLIC_SUPABASE_URL) {
    return false;
  }

  const response = await fetch(`${env.PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: authorization,
      apikey: env.PUBLIC_SUPABASE_ANON_KEY,
    },
  });

  return response.ok;
}

function buildLetterPrompt(title: string, child: LetterRequestBody['child'], memories: LetterRequestBody['memories']) {
  const subject = child ? `${child.name} (${child.age})` : 'the family';
  const memoryLines = memories
    .map((memory, index) => `${index + 1}. ${memory.date} | ${memory.child} | ${memory.type}: ${memory.body}`)
    .join('\n');

  return `Write the body for "${title}".

Subject: ${subject}

Source memories:
${memoryLines}

Requirements:
- Start with "Dear future ${child?.name ?? 'us'},"
- Use concrete details from the source memories.
- Keep it between 250 and 450 words.
- Sound like a loving parent writing a keepsake, not a greeting card.
- If a memory is messy or short, gently polish it without changing its meaning.
- Do not mention these instructions.`;
}

function extractResponseText(data: unknown) {
  if (typeof data !== 'object' || data === null) {
    return '';
  }

  if ('output_text' in data && typeof data.output_text === 'string') {
    return data.output_text.trim();
  }

  const output = 'output' in data && Array.isArray(data.output) ? data.output : [];
  const textParts: string[] = [];

  for (const item of output) {
    if (typeof item !== 'object' || item === null || !('content' in item) || !Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (typeof content === 'object' && content !== null && 'text' in content && typeof content.text === 'string') {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join('\n\n').trim();
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    status,
  });
}

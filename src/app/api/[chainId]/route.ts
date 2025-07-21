import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import { chains } from '@/lib/chain';

interface Error {
  jsonrpc: string;
  id: number;
  error: {
    code: number;
    message: string;
  };
}

export async function POST(req: NextRequest, props: { params: Promise<{ chainId: string }> }) {
  const params = await props.params;
  const body = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    // don't pass the cookie because it doesn't get used downstream
    if (key === 'cookie') return;
    if (key === 'host' && env.NEXT_PUBLIC_VERCEL_ENV === 'development') return;

    headers[key] = value;
  });

  const chain = chains.find(c => c.id === Number(params.chainId));

  if (!chain) {
    return NextResponse.json(
      { error: 'Chain not supported' },
      {
        status: 400,
      }
    );
  }

  const base = chain.rpcUrls.alchemy.http[0];

  const res = await fetch(`${base}/${env.ALCHEMY_API_KEY}`, {
    method: 'POST',
    headers: {
      ...headers,
    },
    body,
  });

  if (!res.ok) {
    const error = (await res.json()) as Error;
    console.error(error);
    console.log(`⚠️ RPC ${chain.name} error: ${error.error.message}`);
    return NextResponse.json(error, {
      status: res.status,
    });
  }

  return NextResponse.json(await res.json());
}

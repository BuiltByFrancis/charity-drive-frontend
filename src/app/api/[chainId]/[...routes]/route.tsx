import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import { chains } from '@/lib/chain';

export async function POST(
  req: Request,
  props: { params: Promise<{ chainId: string; routes: string[] }> }
) {
  const params = await props.params;
  const body = await req.text();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${env.ALCHEMY_API_KEY}`,
  };
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

  const res = await fetch(`${base}/${env.ALCHEMY_API_KEY}/${params.routes.join('/')}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.ALCHEMY_API_KEY}`,
      ...headers,
    },
    body,
  });

  if (!res.ok) {
    return NextResponse.json(await res.json().catch(), {
      status: res.status,
    });
  }

  return NextResponse.json(await res.json());
}

import { NextRequest } from "next/server";

export const config = {
    runtime: 'edge',
}

export default function handler(req, res) {
  return new Response(JSON.stringify({ 
    hello: 'world' 
}))
}
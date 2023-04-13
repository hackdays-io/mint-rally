// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

const url = process.env.NEXT_PUBLIC_WEBHOOK_URL!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") res.status(405).send("Method not allowed");

  try {
    const { body } = await fetch(url, {
      method: "POST",
      body: JSON.stringify(req.body),
      headers: { "Content-Type": "application/json" },
    });
    res.send(body);
  } catch (error) {
    res.status(500).send(error);
  }

  return;
}

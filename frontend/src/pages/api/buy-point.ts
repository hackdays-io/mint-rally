// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") res.status(405).send("Method not allowed");
  const { amount, signature } = req.query;
  if (!amount || !signature) {
    return res.status(400).send("Invalid request parameters");
  }

  return res.status(200).json({ sessionId: "" });
}

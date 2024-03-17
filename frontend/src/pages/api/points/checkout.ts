// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Stripe } from "stripe";
import { ethers } from "ethers";

const UNIT_AMOUNT_STD = 5; // 1ポイントあたりの価格（単位：円）

const stripeClient = new Stripe(process.env.STRIPE_SK!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") res.status(405).send("Method not allowed");
  const { amount, signature } = req.query;
  if (
    !amount ||
    typeof amount !== "string" ||
    !signature ||
    typeof signature !== "string"
  )
    return res.status(400).send("Invalid request parameters");

  // todo: 購入ポイント数の価格計算
  const unit_amount = Number(amount) * UNIT_AMOUNT_STD;

  const walletAddress = ethers.utils.verifyMessage(amount, signature);

  // ここのmetadataがwebhookで飛んでくるので、それでどのアドレスにいくらポイント付与するかがわかる
  const metadata = {
    walletAddress,
    amount, // number型で送信してもwebhook経由で取得するとstring型に変換されてしまうのでstring型のままで送信
  };
  console.log("metadata:", metadata);

  const session = await stripeClient.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: "Mint Points",
          },
          unit_amount,
        },
        quantity: 1,
      },
    ],
    // todo: 購入後のリダイレクト先URLをちゃんと設定
    success_url: "http://localhost:3000/purchase-points/paid",
    metadata,
  });

  return res.status(200).json({ sessionURL: session.url });
}

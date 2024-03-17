// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Stripe } from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { Contract, ContractReceipt, providers, Wallet } from "ethers";
import {
  DefenderRelayProvider,
  DefenderRelaySigner,
} from "@openzeppelin/defender-relay-client/lib/ethers";
import MintPointABI from "../../../contracts/MintPoint.json";
import { MintPoint } from "types/MintPoint";

const stripeClient = new Stripe(process.env.STRIPE_SK!);

const reqToBuffer = async (req: NextApiRequest) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

const getOzSigner = async () => {
  if (process.env.DEV_RELAYER_PRIVATE_KEY) {
    const developmentProvider = new providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_PROVIDER_RPC!
    );
    return new Wallet(
      process.env.DEV_RELAYER_PRIVATE_KEY!,
      developmentProvider
    );
  }
  const apiKeys = JSON.parse(process.env.OZ_RELAYER_API_KEYS!);
  const apiSecrets = JSON.parse(process.env.OZ_RELAYER_API_SECRETS!);

  const randomIndex = Math.floor(Math.random() * apiKeys.length);
  const apiKey = apiKeys[randomIndex];
  const apiSecret = apiSecrets[randomIndex];

  const credentials = {
    apiKey,
    apiSecret,
  };

  const ozProvider = new DefenderRelayProvider(credentials);
  const ozSigner = new DefenderRelaySigner(credentials, ozProvider, {
    speed: "fast",
  });

  return ozSigner;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") res.status(405).send("Method not allowed");

  let event: Stripe.Event;
  try {
    const bodyBuffer = await reqToBuffer(req); // Stripeの署名検証に使用するrequest bodyはBuffer型でないといけない
    const sig = req.headers["stripe-signature"];
    event = stripeClient.webhooks.constructEvent(
      bodyBuffer,
      sig!,
      process.env.STRIPE_WEBHOOK_MINT_POINT_SECRET!
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
  console.log(`event: ${JSON.stringify(event)}`);

  switch (event.type) {
    case "checkout.session.completed":
      const metadata = event.data.object.metadata;
      if (!metadata) return res.status(400).send("Metadata not found");
      const { walletAddress: to, amount } = metadata;
      console.log(`walletAddress: ${to} | amount: ${amount}`);

      const ozSigner = await getOzSigner();
      const mintPoint: MintPoint = new Contract(
        process.env.NEXT_PUBLIC_CONTRACT_MINT_POINT!,
        MintPointABI.abi,
        ozSigner
      ) as any;
      const tokenId = 0;
      let txReceipt: ContractReceipt;
      try {
        const tx = await mintPoint.mint(to, tokenId, Number(amount));
        console.log(`txHash: ${tx.hash}`);
        txReceipt = await tx.wait();
        console.log(`txReceipt: ${JSON.stringify(txReceipt)}`);
        console.log("tx success");
      } catch (error) {
        console.error(error);
        return res.status(500).json({ walletAddress: to, amount, error });
      }
      return res.status(200).json({ txReceipt });
    default:
      console.log(`Unhandled event type ${event.type}`);
      return res.status(200).json({ received: true });
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import { getNFTHoldersOfEvent } from "src/libs/contractMethods";
import { BigNumber } from "ethers";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const urlPath = req.url || '';
  const extension = path.extname(urlPath);
  const eventid = req.query.eventid;
  if (eventid === undefined) {
    return res.status(400).json({ message: "eventid is required" });
  }

  const nfts = await getNFTHoldersOfEvent(BigNumber.from(eventid));
  if (extension === '.json') {
    return res.status(200).json(nfts);
  } else if (extension === '.csv') {
    const csv = nfts.map((nft) => {
      return `${nft.name},${nft.description},${nft.image}`;
    }).join('\n');
    return res.status(200).send(csv);
  }
}

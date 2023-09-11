import { NextApiRequest, NextApiResponse } from "next";
import { getNFTHoldersOfEvent } from "src/libs/contractMethods";
import { BigNumber } from "ethers";

/**
 * By calling `/api/events/[eventid]/holders`, it returns NFT holders information of specified event.
 * You can specify output format by adding `format=csv|json` parameter. Default is json.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const eventid = req.query.eventid;
  const format = req.query.format;
  if (eventid === undefined) {
    return res.status(400).json({ message: "eventid is required" });
  }

  const nfts = await getNFTHoldersOfEvent(BigNumber.from(eventid));
  if (format === 'csv') {
    const csv = nfts.map((nft) => {
      return `${nft.holderAddress},${nft.tokenId}`;
    }).join('\n');
    return res.status(200).send(
      `holderAddress, tokenId\n${csv}`);
  } else {
    return res.status(200).json(nfts);

  }
}

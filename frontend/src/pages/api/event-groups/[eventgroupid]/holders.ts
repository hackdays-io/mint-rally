import { NextApiRequest, NextApiResponse } from "next";
import { getNFTHoldersOfEventGroup } from "src/libs/contractMethods";
import { BigNumber } from "ethers";

/**
 * By calling `/api/events/[eventid]/holders`, it returns NFT holders information of specified event.
 * You can specify output format by adding `format=csv|json` parameter. Default is json.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const eventgroupid = req.query.eventgroupid;
  const format = req.query.format;
  if (eventgroupid === undefined) {
    return res.status(400).json({ message: "event group id is required" });
  }

  const holders = await getNFTHoldersOfEventGroup(BigNumber.from(eventgroupid));
  if (format === 'csv') {
    const csv = holders.map((holder) => {
      return `${holder.eventId},${holder.holderAddress},${holder.tokenId}`;
    }).join('\n');
    return res.status(200).send(
      `eventId, holderAddress, tokenId\n${csv}`);
  } else {
    return res.status(200).json(holders);
  }
}

import * as fs from 'fs';
import * as dotenv from 'dotenv';

const HOLDERS_FILE = './public/data/holders.json';
type NFTMetadata = {
  tokenId: number;
  eventGroupId: number;
  title: string;
  description: string;
  timeLastUpdated: string;
}

const getCurrentHolders = () => {
  // get current holders from file named holders.json
  try {
    const data = fs.readFileSync(HOLDERS_FILE, 'utf-8');
    return JSON.parse(data)
  } catch (e) {
    console.log(`${HOLDERS_FILE} not found`)
    return []
  }
}
const getAllHolders = async (mydata: NFTMetadata[]) => {
  let start = 0;
  if (mydata.length > 0) {
    start = Number(mydata[mydata.length - 1].tokenId) + 1
  }
  try {
    let nextToken = undefined;
    let ret: NFTMetadata[] = []
    while (nextToken == undefined || nextToken != "") {
      const nextUrl = nextToken && `${process.env.ALCHEMY_API_DOMAIN}/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}/getNFTsForCollection?contractAddress=${process.env.NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER}&withMetadata=true&limit=100&startToken=${nextToken || ""}` ||
        `${process.env.ALCHEMY_API_DOMAIN}/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}/getNFTsForCollection?contractAddress=${process.env.NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER}&withMetadata=true&limit=100&startToken=${start}`
      console.log(nextUrl)
      const data = await fetch(nextUrl).then(res => res.json()) as any;
      ret = ret.concat(data.nfts.map((nft: any) => {
        return {
          tokenId: Number(nft.id.tokenId)
        }
      }))
      nextToken = data.nextToken || "";
      console.log(nextToken)
    }
    return ret
  } catch (e) {
    console.log(e)
    throw new Error("Cannot find mintNFTManager contract");
  }
}
const saveFile = async (data: NFTMetadata[]) => {
  // save data to file named holders.json
  // fs.writeFileSync('./public/data/holders.json', JSON.stringify(data));
}

const main = async () => {
  dotenv.config({ path: '.env.local' });
  const mydata = getCurrentHolders();
  const holders = await getAllHolders(mydata);
  console.log(holders)
  await saveFile(holders);
  console.log(holders);
}
main().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error(error);
  process.exit(1);
})
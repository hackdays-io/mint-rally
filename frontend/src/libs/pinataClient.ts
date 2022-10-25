import FormData from 'form-data'
import axios from "axios";
import { IIpfsClient } from './ipfsClient';


export class PinataClient implements IIpfsClient {
  gateway: string;
  token: string;

  constructor() {
    this.gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY!;
    this.token = process.env.NEXT_PUBLIC_PINATA_JWT!;
  }

  async put(files: File[], name: string) {
    try {
      const data = new FormData();
      for (const file of files) {
        data.append("file", file, `${name}/${file.name}`);
      }
      data.append('pinataOptions', '{"cidVersion": 1}');
      data.append('pinataMetadata', `{"name": "${name}"}`);
      const resFile = await axios({
        method: "post",
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data: data,
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
      });

      const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
      //Take a look at your Pinata Pinned section, you will see a new file added to you list.   
      return resFile.data.IpfsHash
    } catch (error) {
      console.log("Error sending File to IPFS: ")
      console.log(error)
      return undefined;
    }
  }
}

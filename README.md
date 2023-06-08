# Mint Rally

![mainImg](https://user-images.githubusercontent.com/35390466/177026194-28ace142-0ba0-4360-8a48-6fd614fed91f.png)

## About our project

**Proof of participation NFT you'll want to keep joining**

- Organizers can easily organize events that can grant evolving NFTs.
- Organizers can easily generate nice NFT images on the screen
- Participants can gain attractive NFTs by continuing to attend events.

## Problem to be solved

Solves the problem of organizers struggling with event retention rates.

## Technology used

- frontend: Next.js, TypeScript
- contract: Solidity, ERC721Enumerable, Hardhat
- image: IPFS, Pinata

## Development

- [Frontend](docs/frontend.md)
- [Contracts](docs/localnode.md)

## Deployment

- [Deploy](docs/deploy.md)

## Challenges Faced

### Solved

- Calling another contract from a contract and minting it.
- full on chain
- Restrict the ability to mint only event attendees.

### Under Challenge

- Allow each event organizer to manage their own participation fees.
- Image Editor.
- Making the NFT generative.
- Meta-transaction to eliminate the burden of gas costs for participants
- Issue uncool NFTs to absentees.

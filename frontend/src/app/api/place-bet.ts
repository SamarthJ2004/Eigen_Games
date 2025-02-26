import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { personality, betAmount } = req.body;
  
  try {
  
    const contractAddress = "0x97490eb90f2be6d6cbaf75951105ff1113779669";
    const abiFragment = ["function placeBet(uint8 personality) external payable"];
    const iface = new ethers.utils.Interface(abiFragment);
    
    const data = iface.encodeFunctionData("placeBet", [Number(personality)]) as `0x${string}`;
    
    const betAmountHex = ethers.utils.hexlify(ethers.utils.parseEther(betAmount));
    const betAmountHexWithoutPrefix = betAmountHex.startsWith('0x') 
      ? betAmountHex.slice(2) 
      : betAmountHex;

   
    //return res.status(200).json({ txHash: response });
  } catch (error) {
    console.error('Error placing bet:', error);
    return res.status(500).json({ message: 'Failed to place bet' });
  }
}
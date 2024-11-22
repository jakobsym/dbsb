import { Helius } from "helius-sdk"
import 'dotenv/config'

const helius = new Helius(process.env.HELIUS_API_KEY)

// `walletAddressObj`: Object
// return: Array of Token Object(s) 
const fetchWalletContent = async(walletAddressObj) => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const walletAddress = walletAddressObj.walletAddress
  var totalPages = 0

  var walletContent = {
    walletAddress: walletAddress,
    tokens: [],
  }

  // TODO: Maybe split these into seperate functions
  try {
    let initRes = await helius.rpc.getTokenAccounts({
      page: 1,
      limit: 100,
      options: {
        showZeroBalance: false
      },
      owner: walletAddress
    });

    // get total pages for given addresss
    totalPages = initRes.total
  
    for (const token of initRes.token_accounts) {
      walletContent.tokens.push({
        "token_address": token.mint,
        "amount": token.amount
      })

    }
    for (let page = 2; page <= totalPages; page+=1){
      await delay(250)
      try {
        let res = await helius.rpc.getTokenAccounts({
          page: page,
          limit: 100,
          options: {
            showZeroBalance: false
          },
          owner: walletAddress
        })
        for (const token of res.token_accounts) {
          walletContent.tokens.push({
            "token_address": token.mint,
            "amount": token.amount,
          })
        }
      } catch (error) {
        console.error(error)
      }
    }

  } catch (error) {
    console.error(error)
  }
  return walletContent.tokens
}


// way to get top 10 holders of a given token
// input: a coin address from telegram

//TODO: Consider how caching the created set helps with lookup in the future
// TODO: Handler Catch errors 
export const fetchTokenHolders = async(tokenAddressObj) => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const tokenAddress = tokenAddressObj.tokenAddress
  // create set of token account objects
  // i.e: set { ..., {tokenAccount: walletAddress, amount: total amount}, ...}
  // we can then sort this set, iterate over top X 
  let tokenHolders = new Set()

  try {
    let initRes = await helius.rpc.getTokenAccounts({
      page: 1,
      limit: 1000,
      options: {
        showZeroBalance: false
      },
      mint: tokenAddress
    })
    for(const holder of initRes.token_accounts){
      tokenHolders.add({ownerAddress: holder.owner, tokenAmount: holder.amount})
    }
    total_pages = initRes.total
    
    for (let page = 2; page <= total_pages; page++) {
      delay(250)
      try {
        let res = await helius.rpc.getTokenAccounts({
          page: page,
          limit: 1000,
          options: {
            showZeroBalance: false
          },
          mint: tokenAddress
        })
        for (const holder of res.token_accounts) {
          tokenHolders.add({ownerAddress: holder.owner, tokenAmount: holder.amount})
        }
      } catch(error) {
        console.error(error)
      }
    }

  } catch(error) {
    console.error(error)
  }

  return tokenHolders
}

const fetchTop10Holders = async(holders) => {
  // holders is a set of all holders + amounts for a given token
}

export default fetchWalletContent
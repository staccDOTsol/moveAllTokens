import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getOrCreateAssociatedTokenAccount,
  getMint,
  createTransferCheckedInstruction,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
let jaregm = new PublicKey("JARehRjGUkkEShpjzfuV4ERJS25j8XhamL776FAktNGm");
let ALT_RPC_LIST =
  "https://solana-mainnet.g.alchemy.com/v2/1_5YWfzLWXOo_Y_Dm0s89VTlD5T_RKHn,https://solana-mainnet.g.alchemy.com/v2/QlAFXUZhGG-CoVy9r6vYAbsA7iiDnA9-,https://solana-mainnet.g.alchemy.com/v2/ETWO1_-exD_tuIyq9YTW9d37nAvNT7XQ,https://solana-mainnet.g.alchemy.com/v2/dVWUMrayL_U3UbmCbg0mouE9q4mUZfuc,https://solana-mainnet.g.alchemy.com/v2/dVWUMrayL_U3UbmCbg0mouE9q4mUZfuc,https://solana-mainnet.g.alchemy.com/v2/WM_Gl7ktiws7icLQVxLP5iVHNQTv8RNk,https://solana-mainnet.g.alchemy.com/v2/1_5YWfzLWXOo_Y_Dm0s89VTlD5T_RKHn";
// @ts-ignore
let ran = Math.floor(Math.random() * ALT_RPC_LIST?.split(",").length);

const payer = Keypair.fromSecretKey(
  new Uint8Array(
    JSON.parse(
      // @ts-ignore
      process.env.PRIV_KEY
    )
  )
);
// @ts-ignore
var connection2 = new Connection(ALT_RPC_LIST.split(",")[ran]);

async function doit() {
  try {
    let arg2 = (
      await connection2.getParsedTokenAccountsByOwner(payer.publicKey, {
        programId: TOKEN_PROGRAM_ID,
      })
    ).value;
    let a = 0;
    let instructions: any = [];
    for (var ata of arg2) {
      let mint = new PublicKey(ata.account.data.parsed.info.mint);

      let myshit = parseFloat(ata.account.data.parsed.info.tokenAmount.amount);
      if (myshit > 0) {
        a++;
        if (a <= 4) {
          const associatedDestinationTokenAddr =
            await getOrCreateAssociatedTokenAccount(
              connection2,
              payer,
              mint,
              payer.publicKey,
              true
            );

          instructions.push(
            createTransferCheckedInstruction(
              ata.pubkey, // from (should be a token account)
              mint, // mint
              associatedDestinationTokenAddr.address,
              // to (should be a token account)
              payer.publicKey, // from's owner
              myshit, // amount, if your deciamls is 8, send 10^8 for 1 token
              ata.account.data.parsed.info.tokenAmount.decimals
            )
          );
          // }
        } else {
          let tx = new Transaction().add(...instructions);
          tx.recentBlockhash = await connection2
            .getLatestBlockhash()
            .then((res) => res.blockhash);
          let result = await connection2.sendTransaction(tx, [payer], {
            skipPreflight: true,
          });
          console.log(result);
          a = 0;
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}
doit();
setInterval(async function () {
  doit();
}, 15000);

import React, { useEffect, useState } from 'react';

import { createClient, MempoolTransaction, StacksApiWebSocketClient, Transaction } from '@stacks/blockchain-api-client';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { SwapProgress } from '../../../lib/swap';

import { request } from '@stacks/connect';
import { setSwapTransactions } from '../../../app/slices/Swap/thunks';
import { createBtcExplorerLink } from '../../../lib/browser';
import { shortTxid } from '../../../lib/format';
import * as clarityBitcoinClient from '../../../lib/proof/clarity-bitcoin-client';
import { wasSegwitTxMinedCompact } from '../../../lib/stacks-api/rpc';
import BtcSwapItem from './BtcSwapItem';
import { fetchBtcTx } from '../../../lib/btc-api/rpc';
import { ClarityType, cvToString, hexToCV, Pc, responseErrorCV } from '@stacks/transactions';

enum ClaimingState {
  IDLE,
  GETTING_DATA,
  VERIFYING_TX,
  SUBMITTING
}

const BtcSwapClaim = ({
  setSwapProgress,
  sbtcSwapContract,
  sbtcAsset,
  chain,
  client
}: {
  setSwapProgress: React.Dispatch<React.SetStateAction<SwapProgress>>;
  sbtcSwapContract: `${string}.${string}`;
  sbtcAsset: `${string}.${string}::${string}`;
  chain: string;
  client: ReturnType<typeof createClient>;
}) => {
  const swapInfo = useAppSelector(state => state.swap);
  const dispatch = useAppDispatch();

  const {
    amountInfo: { sendAmount, receiveAmount },
    addressInfo: { userBTCAddress, receiverSTXAddress },
    swapTxs,
  } = swapInfo;
  const btcTxId = swapTxs?.btcTransferTx;

  // swap id is verified in Swaps
  const swapId = parseInt(swapTxs?.swapId!);

  const [txError, setTxError] = useState<{ status: (Transaction | MempoolTransaction)["tx_status"] } | undefined>();
  const [txPending, setTxPending] = useState(true);
  const [claimingState, setClaimingState] = useState<ClaimingState>(ClaimingState.IDLE);
  const [verificationError, setVerificationError] = useState<string | undefined>();

  useEffect(() => {
    const fn = async () => {
      console.log("checking", btcTxId)
      if (btcTxId) {
        const tx = await fetchBtcTx(btcTxId);
        console.log("tx status", tx.status)
        if (tx.status.confirmed) {
          setTxPending(false);
        }
      }
    }
    fn();
  }, []);


  const onClaimBtnClicked = async () => {
    if (!btcTxId) {
      return;
    }
    setClaimingState(ClaimingState.GETTING_DATA);
    const { claimArgs, verifyArgs, segwit } = await clarityBitcoinClient.createSubmitStxTransactionArgs(swapId, btcTxId, chain);
    console.log({ claimArgs, verifyArgs, segwit });
    setClaimingState(ClaimingState.VERIFYING_TX);

    const resultMined = segwit ? await wasSegwitTxMinedCompact(verifyArgs, receiverSTXAddress) :
      { okay: true }
    console.log({ resultMined });
    if (!resultMined.okay) {
      return;
    }
    const resultMinedCV = hexToCV(resultMined.result);
    if (resultMinedCV.type === ClarityType.ResponseErr) {
      setVerificationError("Tx could not be verified: " + cvToString(resultMinedCV));
      setClaimingState(ClaimingState.IDLE);
      return
    }
    console.log({ resultMinedCV: cvToString(resultMinedCV) });
    setClaimingState(ClaimingState.SUBMITTING);
    const functionName: string = segwit ? "submit-swap-segwit" : "submit-swap-legacy";
    const [assetContractId, assetTokenName] = sbtcAsset.split("::") as [`${string}.${string}`, string];
    const response = await request("stx_callContract", {
      contract: sbtcSwapContract,
      functionName,
      functionArgs: claimArgs,
      postConditionMode: "deny",
      postConditions: [
        Pc.principal(sbtcSwapContract).willSendGte(Math.round(sendAmount * 1e8)).ft(assetContractId, assetTokenName),
      ],
      network: chain === "testnet" ? "testnet" : "mainnet",
    }).catch(() => { setClaimingState(ClaimingState.IDLE); });
    console.log(response);
    // check if response is type void
    if (response) {
      const submitTx = response.txid;
      if (submitTx) {
        dispatch(setSwapTransactions({
          ...swapTxs,
          submitTx
        }
        ));
      }
    }
    setClaimingState(ClaimingState.IDLE);

    setSwapProgress(SwapProgress.SUBMIT_ON_STX_COMPLETED);
  };


  const title = txPending ? "Bitcoin Transaction Pending" :
    txError ? "Bitcoin Transaction failed" : "Bitcoin Transaction Confirmed";

  return (
    <div className="w-full p-5 flex flex-col gap-6 bg-white dark:bg-[rgba(11,11,15,0.9)] rounded-[18px] items-center">
      <p className="w-full text-center text-[28px] leading-10">{title}</p>
      <BtcSwapItem
        mode="btcReceived"
        btcStatus={txPending ? 'btcReceivePending' : 'confirmed'}
        stxStatus="preview"
        sendAmount={sendAmount} receiveAmount={receiveAmount} receiverSTXAddress={receiverSTXAddress} userBTCAddress={userBTCAddress} />
      <div className="text-sm w-full leading-[14px] p-5 border-[1px] border-[rgba(7,7,10,0.1)] dark:border-[rgba(255,255,255,0.1)] rounded-lg flex flex-col sm:flex-row justify-between items-center">
        <p className="opacity-50">Transaction ID</p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {btcTxId ?
            <><a href={createBtcExplorerLink(btcTxId, chain)} target="_blank" className="underline pt-2 sm:p-0">
              {shortTxid(btcTxId)}
            </a>
              <button className="rounded-full py-2 px-5 dark:bg-white bg-special-black text-base font-medium leading-5 text-white dark:text-special-black">
                Copy
              </button>
            </>
            : <></>}
        </div>
      </div>
      {txPending && !btcTxId &&
        <div className="flex flex-col gap-3 w-full">
          <p><em>Bitcoin transaction submitted. Refresh the page, once transaction was confirmed.</em></p>
        </div>
      }
      {verificationError &&
        <div className="flex flex-col gap-3 w-full">
          <p><em>{verificationError}</em></p>
        </div>
      }
      <div className="flex flex-col gap-3 w-full">
        {claimingState === ClaimingState.GETTING_DATA && <p>Getting data...</p>}
        {claimingState === ClaimingState.VERIFYING_TX && <p>Verifying transaction...</p>}
        {claimingState === ClaimingState.SUBMITTING && <p>Submitting transaction...</p>}
        <button
          className={`text-center w-full rounded-full py-3  text-base font-medium leading-5 ${!txPending ? "text-white dark:text-special-black" : "text-slate-500 dark:text-slate-400"}
           ${txPending ? "bg-gradient-to-r from-50% from-black dark:from-white to-50% to-white dark:to-black animate-gradientMove" : "bg-special-black dark:bg-white"}`}
          onClick={onClaimBtnClicked}
          disabled={claimingState !== ClaimingState.IDLE || txPending || txError !== undefined}
        >
          Claim sBTC
        </button>

      </div>
    </div>
  );
};

export default BtcSwapClaim;


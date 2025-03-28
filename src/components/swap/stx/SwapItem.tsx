
import { address } from "bitcoinjs-lib";
import AnimatedImage from '../AnimatedImage';
import BtcImg from '/src/assets/img/btc.png';
import DownImg from '/src/assets/img/down.svg?react';
import sBtcImg from '/src/assets/img/sbtc.png';
import { bytesToHex } from "@clarigen/core";

const SwapItem = ({ sendAmount, receiveAmount, receiverSTXAddress, userBTCAddress, mode, stxStatus, btcStatus }: {
    sendAmount: number, receiveAmount: number; receiverSTXAddress: string; userBTCAddress: string;
    mode: "confirm" | "in-escrow" | "completed"
    stxStatus: "preview" | "in-escrow-pending" | "confirmed"
    btcStatus: "waiting" | "pending" | "confirmed"
}) => {
    return <div className="w-full p-5 flex flex-col gap-5 rounded-lg bg-[rgba(7,7,10,0.03)] dark:bg-[#14151A] border-[1px] border-[rgba(7,7,10,0.1)] dark:border-[rgba(255,255,255,0.1)]">
        <div className="w-full flex justify-between items-center">
            <div className="flex gap-2 items-center">
                <img className="h-7 w-7" src={sBtcImg} alt="" />
            </div>
            <div className="flex gap-2">
                <p className="text-2xl font-medium leading-6">{sendAmount}</p>
                <p className="text-[28px] leading-6">sBTC</p>
            </div>
        </div>
        <div className="w-7 h-7 flex items-center justify-center">
            {stxStatus === "in-escrow-pending" ?
                <AnimatedImage variant="bounce" imageComponent={DownImg} />
                : <DownImg className="dark:stroke-white stroke-special-black" />}
        </div>
        <div className={`w-full flex justify-between items-center ${stxStatus === "in-escrow-pending" ? "animate-pulse" : ""}`}>
            <div className="flex gap-2 items-center">
                <img className={`h-7 w-7 ${mode === "confirm" ? "filter grayscale" : ""}`} src={sBtcImg} alt="" />
                Escrow
            </div>
            <div className="flex gap-2">
                <p className="text-2xl font-medium leading-6">{sendAmount}</p>
                <p className="text-[28px] leading-6">sBTC</p>
            </div>
        </div>
        <div className="w-7 h-7 flex items-center justify-center">
            <DownImg className="dark:stroke-white stroke-special-black" />

        </div>
        <div className="w-full flex justify-between items-center">
            <div className="flex gap-2 items-center">
                <img className={`h-7 w-7 ${mode === "confirm" || mode === "in-escrow" ? "filter grayscale" : ""}`} src={BtcImg} alt="" />
            </div>
            <div className="flex gap-2">
                <p className="text-2xl font-medium leading-6">{receiveAmount}</p>
                <p className="text-[28px] leading-6">&nbsp;BTC</p>
            </div>
        </div>
        <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between sm:items-center text-sm leading-[17px] opacity-50 font-normal">
            <p>Sending sBTC to</p>
            <p className="text-xs">{receiverSTXAddress}</p>
        </div>
        <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between sm:items-center text-sm leading-[17px] opacity-50 font-normal">
            <p>Receiving BTC at</p>
            <p className="text-xs text-end">{userBTCAddress} <br />{(mode === "confirm" && userBTCAddress) && <><em>scriptPubKey:</em> {bytesToHex(address.toOutputScript(userBTCAddress))}</>}</p>
        </div>
    </div>
}

export default SwapItem;
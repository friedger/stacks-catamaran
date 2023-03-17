import React, { useState } from "react";
import CantamaranPreview from "./cantamaran-swap/CantamaranPreview";
import SwapButton from "./SwapButton";
import SwapConfirm from "./SwapConfirm";
import SwapComplete from "./SwapComplete";

export const enum SwapItems {
  CANTAMARAN_SWAP = "Catamaran Swap",
  STX_SWAP = "STX Swap",
  NFT_SWAP = "NFT Swap",
}

export const enum SwapProgress {
  PREVEIW_SWAP = "Preview Swap",
  SWAP_CONFIRM = "Swap confirm",
  SWAP_COMPLETED = "Swap completed",
}

const Swap = () => {
  const [swapProgress, setSwapProgress] = useState<SwapProgress>(
    SwapProgress.PREVEIW_SWAP
  );
  const [selectedHeaderItem, setSelectedHeaderItem] = useState<SwapItems>(
    SwapItems.CANTAMARAN_SWAP
  );

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1440px] flex justify-center px-5 pb-8">
        <div className="max-w-[590px] w-full mg-18 sm:mt-24 flex flex-col gap-5">
          {SwapProgress.PREVEIW_SWAP === swapProgress ? (
            <>
              <div className="w-full flex rounded-[18px] bg-white dark:bg-[rgba(11,11,15,0.9)] p-2 gap-2.5 text-center">
                <SwapButton
                  name={SwapItems.CANTAMARAN_SWAP}
                  setSelectedHeaderItem={setSelectedHeaderItem}
                  selectedHeaderItem={selectedHeaderItem}
                />
                <SwapButton
                  name={SwapItems.STX_SWAP}
                  setSelectedHeaderItem={setSelectedHeaderItem}
                  selectedHeaderItem={selectedHeaderItem}
                />
                <SwapButton
                  name={SwapItems.NFT_SWAP}
                  setSelectedHeaderItem={setSelectedHeaderItem}
                  selectedHeaderItem={selectedHeaderItem}
                />
              </div>
              {(() => {
                switch (selectedHeaderItem) {
                  case SwapItems.CANTAMARAN_SWAP:
                    return (
                      <CantamaranPreview setSwapProgress={setSwapProgress} />
                    );
                  default:
                    break;
                }
              })()}
            </>
          ) : (
            <>
              {(() => {
                switch (swapProgress) {
                  case SwapProgress.SWAP_CONFIRM:
                    return <SwapConfirm setSwapProgress={setSwapProgress} />;
                  case SwapProgress.SWAP_COMPLETED:
                    return <SwapComplete setSwapProgress={setSwapProgress} />;
                }
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Swap;

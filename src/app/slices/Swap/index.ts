import { createSlice } from '@reduxjs/toolkit';
import { setSwapAddressDetail, setSwapAmountDetail, setSwapTransactions } from './thunks';
import { Address } from '@stacks/transactions';

export interface SwapAmountDetail {
  sendAmount: number;
  receiveAmount: number;
}

export interface SwapAddressDetail {
  userBTCAddress: string;
  receiverSTXAddress: string;
}

export interface SwapTransactions {
  createTx?: string;
  btcTransferTx?: string;
  submitTx?: string;
  cancelTx?: string;
  swapId?: string;
  done?: boolean;
}

export interface SwapDetail {
  amountInfo: SwapAmountDetail;
  addressInfo: SwapAddressDetail;
  swapTxs: SwapTransactions;
}

const initialState: SwapDetail = {
  amountInfo: {
    sendAmount: 0,
    receiveAmount: 0,
  },
  addressInfo: {
    userBTCAddress: '',
    receiverSTXAddress: '',
  },
  swapTxs: {},
};

export const swapSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(setSwapAmountDetail.fulfilled, (state, action) => {
        return {
          ...state,
          amountInfo: {
            ...state.amountInfo,
            ...action.payload,
          },
        };
      })
      .addCase(setSwapAddressDetail.fulfilled, (state, action) => {
        return {
          ...state,
          addressInfo: {
            ...state.addressInfo,
            ...action.payload,
          },
        };
      })
      .addCase(setSwapTransactions.fulfilled, (state, action) => {
        return {
          ...state,
          swapTxs: {
            ...state.swapTxs,
            ...action.payload,
          },
        };
      });
  },
});

export default swapSlice.reducer;

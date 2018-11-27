// @flow
/* eslint-disable */

import { type Fixed8 } from 'neon-js'

import {
  ROUTES,
  NOTIFICATION_LEVELS,
  NOTIFICATION_POSITIONS,
  MODAL_TYPES,
  TX_TYPES,
  ASSETS,
  THEME,
} from '../app/core/constants'

declare type ActionCreatorType = any

declare type DispatchType = (actionCreator: ActionCreatorType) => Promise<*>

declare type GetStateType = () => Object

declare type ReduxAction = () => {
  type: string,
  payload: Object,
  meta?: Object,
  error?: Object
}

declare type NetworkType = string

declare type ExplorerType = $Values<Explorer>

declare type Explorer = {
  NEO_TRACKER: string,
  NEO_SCAN: string,
  ANT_CHAIN: string
}

declare type RouteType = $Values<typeof ROUTES>

declare type NotificationType = {
  id: string,
  level: $Values<typeof NOTIFICATION_LEVELS>,
  title?: string,
  message: string,
  position: $Values<typeof NOTIFICATION_POSITIONS>,
  dismissible: boolean,
  autoDismiss: number
}

declare type TransactionHistoryType = {
  change: {
    NEO: Fixed8,
    GAS: Fixed8
  },
  txid: string,
  blockHeight: Fixed8
}

declare type ModalType = $Values<typeof MODAL_TYPES>

declare type TxType = $Values<typeof TX_TYPES>

declare type TxEntryType = {
  type: TxType,
  txid: string,
  to: string,
  from?: string,
  amount: number,
  label: $Values<typeof ASSETS>,
  time?: number,
  isNetworkFee?: boolean
}

declare type SymbolType = string

declare type NetworkItemType = {
  value: string,
  id: string,
  label: string,
  network: NetworkType
}

declare type TokenItemType = {
  id: string,
  scriptHash: string,
  networkId: string,
  isUserGenerated: boolean,
  symbol?: string,
  totalSupply?: number,
  decimals?: number,
  image?: ?string,
  isNotValidated?: boolean
}

declare type TokenType = {
  symbol: SymbolType,
  balance: number,
  totalSupply: number,
  decimals: number,
  name: string
}

declare type TokenBalanceType = {
  symbol: SymbolType,
  image: string,
  balance: string,
  scriptHash: string,
  totalSupply: number,
  decimals: number,
  name: string
}

declare type SendEntryType = {
  amount: string,
  address: string,
  symbol: SymbolType
}

declare type ThemeType = THEME.LIGHT | THEME.DARK

// polyfill flow's bom since Node does implement navigator.mediaDevices
declare interface Navigator extends Navigator {
  mediaDevices: MediaDevicesType;
}

// https://mdn.io/MediaDevices
// https://mdn.io/MediaDevices/enumerateDevices
declare type MediaDevicesType = {
  enumerateDevices(): Promise<Array<MediaDeviceInfoType>>
}

// https://mdn.io/MediaDeviceInfo
declare type MediaDeviceInfoType = {
  deviceId: string,
  groupId: string,
  kind: 'videoinput' | 'audioinput' | 'audiooutput',
  label: string
}

// @flow
import hashToSymbol from './hashToSymbol'

const INVALID_FORMAT = 'Invalid format'
const INVALID_PROTOCOL = 'Invalid protocol'
const MISSING_ADDRESS = 'Missing recipient address'
const UNRECOGNIZED_ASSET = 'Unrecognized asset'

export type RecipientData = {
  address: string,
  asset: ?string,
  amount: ?number,
  reference: ?string
}

const parseQRCode = (data: string): RecipientData => {
  let parsedData

  try {
    parsedData = new URL(data)
  } catch (err) {
    throw INVALID_FORMAT
  }

  const { protocol, pathname, searchParams } = parsedData

  if (protocol !== 'neo:') throw INVALID_PROTOCOL
  if (!pathname) throw MISSING_ADDRESS

  let asset = searchParams.get('asset')
  const assetIsHash = asset && asset !== 'NEO' && asset !== 'GAS'

  if (assetIsHash) {
    asset = hashToSymbol(asset)
    if (!asset) throw UNRECOGNIZED_ASSET
  }

  const parsedAmount = searchParams.get('amount')
  const amount = parsedAmount ? Number(parsedAmount) : null

  return {
    address: pathname,
    asset,
    amount,
    reference: searchParams.get('description')
  }
}

export default parseQRCode

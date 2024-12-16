import { ODD_CODE } from '@shared/constants'

export const getCode = (number, specialOdd, typeOdd, bet, nameHome) => {
  const isHome = bet === nameHome
  const isOver = bet === 'Over'

  const baseCode =
    number === 0 ? (specialOdd === 1 ? 'FT' : 'FT_0') : specialOdd === 1 ? 'FH' : 'FH_0'

  const typeCode =
    typeOdd === 'SPREAD'
      ? isHome
        ? '_HDP_HOME'
        : '_HDP_AWAY'
      : isOver
        ? '_POINT_OVER'
        : '_POINT_UNDER'

  return ODD_CODE[baseCode + typeCode]
}

export const eventMappings = [
  { indexHome: 25, indexAway: 29, indexLeague: 7 },
  { indexHome: 69, indexAway: 73, indexLeague: 51 },
  { indexHome: 71, indexAway: 75, indexLeague: 53 },
  { indexHome: 73, indexAway: 77, indexLeague: 55 },
  { indexHome: 75, indexAway: 79, indexLeague: 57 },
  { indexHome: 77, indexAway: 81, indexLeague: 59 },
  { indexHome: 87, indexAway: 91, indexLeague: 69 },
  { indexHome: 89, indexAway: 93, indexLeague: 71 },
  { indexHome: 91, indexAway: 95, indexLeague: 73 }
]

export const ODD_CODE = {
  FT: {
    HDP: {
      HOME: '0|2|0|1',
      AWAY: '0|2|1|1',
      '0HOME': '0|2|0|0',
      '0AWAY': '0|2|1|0'
    },
    POINT: {
      OVER: '0|3|3|1',
      UNDER: '0|3|4|1',
      '0OVER': '0|3|3|0',
      '0UNDER': '0|3|4|0'
    }
  },
  FH: {
    HDP: {
      HOME: '1|2|0|1',
      AWAY: '1|2|1|1',
      '0HOME': '1|2|0|0',
      '0AWAY': '1|2|1|0'
    },
    POINT: {
      OVER: '1|3|3|1',
      UNDER: '1|3|4|1',
      '0OVER': '1|3|3|0',
      '0UNDER': '1|3|4|0'
    }
  }
}

export const HEADERS_P88BET = {
  'Accept-Language':
    'en-US,en;q=0.9,th;q=0.8,zh-CN;q=0.7,zh;q=0.6,ja;q=0.5,cs;q=0.4,zh-TW;q=0.3,ms;q=0.2',
  'Accept-Encoding': 'gzip, deflate, br',
  Referer: 'https://www.p88.bet/en/sports',
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Content-Type': 'application/json; charset=utf-8'
}

export const SPREAD = 'SPREAD'
export const TOTAL = 'TOTAL'

export const FT = 0
export const FH = 1

export const HDP_FT = 1
export const HDP_FH = 7
export const OU_FT = 3
export const OU_FH = 1

export const gameTypeMapP88: { [key: string]: number } = {
  Early: 0,
  Today: 1,
  Running: 2
}

export const gameTypeMapViva88: { [key: string]: string } = {
  Early: 'E',
  Today: 'T',
  Running: 'L'
}

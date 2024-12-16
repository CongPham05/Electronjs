export type CombinationPlatformType = {
  id: number
  namePlatform1: string
  namePlatform2: string
  combinationPlatform: string
}

const combinationPlatformSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        namePlatform1 TEXT,
        namePlatform2 TEXT,

        combinationPlatform TEXT
        `

export default combinationPlatformSchema

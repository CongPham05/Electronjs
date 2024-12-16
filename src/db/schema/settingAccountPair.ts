const settingAccountPairSchema = `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        
        id_account1 INTEGER,
        account1_BetAmount INTEGER,
        account1_SelectBet TEXT,
        account1_CheckOdd INTEGER,
        account1_CheckOdd_From TEXT,
        account1_CheckOdd_To TEXT,

        id_account2 INTEGER,
        account2_BetAmount INTEGER,
        account2_SelectBet TEXT,
        account2_CheckOdd INTEGER,
        account2_CheckOdd_From TEXT,
        account2_CheckOdd_To TEXT,

        combinationPlatform TEXT,

        FOREIGN KEY (id_account1) REFERENCES account(id),
        FOREIGN KEY (id_account2) REFERENCES account(id)
      `

export default settingAccountPairSchema

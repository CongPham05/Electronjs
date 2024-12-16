import { Account } from '@db/model'
import { AccountType } from '@shared/types'

export function checkAmounts(data) {
  const results = data.map(({ idAccount, betAmount }) => {
    const account = Account.findOne({ id: idAccount }) as AccountType

    return account && +account.credit >= +betAmount
  })

  return results.every((result) => result)
}

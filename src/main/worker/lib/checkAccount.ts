import { Account } from '@db/model'

export const isAccountActive = (accountId: number) => {
  const account = Account.findOne({ id: accountId, status: 'Logout', statusLogin: 'Success' })
  return !!account
}

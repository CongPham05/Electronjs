import { Account } from '@db/model'
import { DataPlaceBet } from '@shared/types'

export const checkAccountContinues = (ticketPair: DataPlaceBet[]) => {
  const [ticketI, ticketII]: DataPlaceBet[] = ticketPair

  const checkAccount = (ticket: DataPlaceBet) =>
    Account.findOne({
      id: ticket.idAccount,
      status: 'Logout',
      bet: 1,
      statusLogin: 'Success'
    })

  const accountInfoI = checkAccount(ticketI)
  const accountInfoII = checkAccount(ticketII)

  if (accountInfoI && accountInfoII) {
    return { accountInfoI, accountInfoII }
  }

  return false
}

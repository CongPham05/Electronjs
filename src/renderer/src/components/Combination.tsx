import { memo } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const CombinationComponent = ({ listAccountPair, selectAccountPair, handleClickAccountPair }) => {
  return (
    <div className="flex-1 py-3.5 px-2 flex flex-col gap-2 overflow-hidden">
      <div className="h-full ">
        <div className="h-full flex flex-col">
          <div>Combination</div>
          <div className="flex-1 border border-gray-500 w-full bg-blue-50 py-1 overflow-auto custom-scrollbar">
            {listAccountPair.map((accountPair) => (
              <p
                key={`${accountPair.id_account1}_${accountPair.id_account2}`}
                className={twMerge(
                  'py-0.5 cursor-pointer hover:bg-blue-500 hover:text-white pl-2 transition duration-300',
                  clsx({
                    'border-blue-500 bg-blue-500 text-white':
                      `${selectAccountPair?.id_account1}_${selectAccountPair?.id_account2}` ===
                      `${accountPair.id_account1}_${accountPair.id_account2}`
                  })
                )}
                onClick={() => handleClickAccountPair(accountPair)}
              >
                {accountPair.account1_platForm + '-' + (accountPair.account1_loginID ?? '')}
                {' _ '}
                {accountPair.account2_platForm + '-' + (accountPair.account2_loginID ?? '')}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const Combination = memo(CombinationComponent)

import { AlertError } from '@renderer/components/AlertError'
import { Button } from '@renderer/components/ui/button'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { AccountType } from '@shared/types'
import { useEffect, useState } from 'react'

export default function AddSelectedAccountPair() {
  const [listAccount, setListAccount] = useState<AccountType[]>([])
  const [selectedIdsList1, setSelectedIdsList1] = useState<number[]>([])
  const [selectedIdsList2, setSelectedIdsList2] = useState<number[]>([])

  const [title, setTitle] = useState('')
  const [messageError, setMessageError] = useState('')
  const [showAlertError, setShowAlertError] = useState(false)

  useEffect(() => {
    const fetchListAccount = async () => {
      const data = await window.electron.ipcRenderer.invoke('GetAccount1Account2')
      setListAccount(data)
    }
    fetchListAccount()
  }, [])

  const handleCheckboxChange = (
    id: number,
    setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>,
    selectedIds: number[]
  ) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleSave = () => {
    if (listAccount.length) {
      if (!selectedIdsList1.length || !selectedIdsList2.length) {
        setMessageError('No item selected')
        setShowAlertError(true)
        return
      }
    }

    const list1Accounts = listAccount.filter((account) => selectedIdsList1.includes(account.id))
    const list2Accounts = listAccount.filter((account) => selectedIdsList2.includes(account.id))

    const validPairs: { account1: AccountType; account2: AccountType }[] = []

    for (const account1 of list1Accounts) {
      for (const account2 of list2Accounts) {
        if (
          !validPairs.some(
            (pair) =>
              (pair.account1.id === account1.id && pair.account2.id === account2.id) ||
              (pair.account1.id === account2.id && pair.account2.id === account1.id)
          )
        ) {
          validPairs.push({ account1, account2 })
        }
      }
    }

    window.electron.ipcRenderer.send('DataSelection', validPairs)
  }

  return (
    <div className="flex flex-col bg-layout-color px-2 pt-5 h-full">
      <div>
        <BoxLabel label="Account List" className="w-full h-[333px]">
          <div className="flex gap-4 justify-center pt-4 pb-2 px-2">
            <div className="border border-gray-500 flex-1 h-[310px] bg-white overflow-auto custom-scrollbar">
              <div className="p-1">
                {listAccount.map((account) => (
                  <div key={account.id} className="flex items-center py-[0.9px]">
                    <input
                      id={`list1_checkbox-${account.id}`}
                      type="checkbox"
                      onChange={() =>
                        handleCheckboxChange(account.id, setSelectedIdsList1, selectedIdsList1)
                      }
                      checked={selectedIdsList1.includes(account.id)}
                      className=" outline-none w-4 h-4 text-blue-600"
                    />
                    <label
                      htmlFor={`list1_checkbox-${account.id}`}
                      className={`w-full leading-none ml-1 text-sm pl-1 py-[1px] ${
                        selectedIdsList1.includes(account.id) ? 'bg-blue-600 text-white' : ''
                      }`}
                    >
                      {account.platformName} - {account?.loginID}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <p className="font-bold text-[#0000FF]">VS</p>
            </div>

            {/* Second List */}
            <div className="border border-gray-500 flex-1 h-[310px] bg-white overflow-auto custom-scrollbar">
              <div className="p-1">
                {listAccount.map((account) => (
                  <div key={account.id} className="flex items-center py-[0.9px]">
                    <input
                      id={`list2_checkbox-${account.id}`}
                      type="checkbox"
                      onChange={() =>
                        handleCheckboxChange(account.id, setSelectedIdsList2, selectedIdsList2)
                      }
                      checked={selectedIdsList2.includes(account.id)}
                      className=" outline-none w-4 h-4 text-blue-600"
                    />
                    <label
                      htmlFor={`list2_checkbox-${account.id}`}
                      className={`w-full leading-none ml-1 text-sm pl-1 py-[1px] ${
                        selectedIdsList2.includes(account.id) ? 'bg-blue-600 text-white' : ''
                      }`}
                    >
                      {account.platformName} - {account?.loginID}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </BoxLabel>
      </div>
      <div className="absolute bottom-5 right-5">
        <Button
          variant="outline"
          className="border border-solid border-gray-400 hover:border-blue-500 py-0 px-8 leading-none h-7 w-24"
          onClick={handleSave}
        >
          OK
        </Button>
      </div>
      <AlertError
        showAlertDialog={showAlertError}
        setShowAlertDialog={setShowAlertError}
        title={title}
        messageError={messageError}
        ReactElement={<ExclamationTriangle className="size-11 text-[#FF8C00]   mr-1" />}
      />
    </div>
  )
}

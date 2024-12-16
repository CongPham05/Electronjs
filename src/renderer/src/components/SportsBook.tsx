import PlusCircle from '@renderer/icons/plus-circle'
import { Separator } from '@/components/ui/separator'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DataPlatformType } from '@shared/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import ChevronDown from '@renderer/icons/chevron-down'
import DetailSportsBook from '@renderer/components/DetailSportsBook'

export const SportsBook = () => {
  const listSportsBookRef = useRef([
    'SportsBook1',
    'SportsBook2',
    'SportsBook3',
    'SportsBook4',
    'SportsBook5'
  ])
  const [dataSportBook, setDataSportBook] = useState<DataPlatformType[]>([])
  const [selectedSportsBook, setSelectedSportsBook] = useState<string>(() => {
    const sportsBookCurrent = sessionStorage.getItem('SportsBook')
    if (sportsBookCurrent) {
      return sportsBookCurrent
    }
    sessionStorage.setItem('SportsBook', 'SportsBook1')
    return 'SportsBook1'
  })

  useEffect(() => {
    const fetch = async () => {
      const data = await window.electron.ipcRenderer.invoke('GetDataSportsBook')
      setDataSportBook(data)
    }
    fetch()
  }, [selectedSportsBook])

  useEffect(() => {
    const listener = (_, newData: DataPlatformType[]) => {
      setDataSportBook(newData)
    }

    window.electron.ipcRenderer.on('DataSportsBook', listener)
    return () => {
      window.electron.ipcRenderer.removeAllListeners('DataSportsBook')
    }
  }, [])

  const addSportsBook = () => {
    window.electron.ipcRenderer.send('ShowListPlatform')
  }

  const handleSelectSportsBook = (sportsBook: string) => {
    sessionStorage.setItem('SportsBook', sportsBook)
    setSelectedSportsBook(sportsBook)
    window.electron.ipcRenderer.send('SelectSportsBook', sportsBook)
  }

  const handleLoginAll = () => {
    window.electron.ipcRenderer.send('LoginAll')
  }

  const handleLogoutAll = () => {
    window.electron.ipcRenderer.send('LogoutAll')
  }

  const handleDelayLoginAll = () => {
    window.electron.ipcRenderer.send('DelayLoginAll')
  }

  const filteredSportsBooks = useMemo(() => {
    return dataSportBook.filter((sportsBook) => sportsBook.name === selectedSportsBook)
  }, [dataSportBook, selectedSportsBook])

  return (
    <div className="flex flex-col h-full">
      <div className="flex mb-1  px-3 py-1  bg-gradient-to-b from-white to-layout-color">
        <div
          className="cursor-pointer border border-transparent hover:bg-blue-200 hover:border hover:border-blue-300 flex items-center pr-2"
          onClick={addSportsBook}
        >
          <PlusCircle className="text-green-500 size-6 inline-block " />
          <h4 className="text-blue-700 font-extrabold cursor-pointer inline-block text-sm leading-none">
            Add SportsBook
          </h4>
        </div>
        <div className="flex items-center mx-1 cursor-pointer">
          <input
            id="bordered-checkbox-1"
            type="checkbox"
            value=""
            name="bordered-checkbox"
            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 cursor-pointer"
          />
          <label
            htmlFor="bordered-checkbox-1"
            className="ms-1 text-sm font-bold cursor-pointer pr-2"
          >
            Quick
          </label>
        </div>
        <DropdownMenu>
          <div className="border-x ">
            <DropdownMenuTrigger
              className="h-full focus:outline-none border border-transparent cursor-pointer hover:bg-blue-200 hover:border hover:border-blue-300 transition duration-300 px-2 mx-[2px]
            data-[state=open]:bg-blue-200 data-[state=open]:border data-[state=open]:border-blue-300"
            >
              <div className="flex items-center">
                <p className="text-blue-700 font-extrabold">Menu</p>
                <ChevronDown className="pl-1 size-2.5 w-4" />
              </div>
            </DropdownMenuTrigger>
          </div>

          <DropdownMenuContent className=" ml-[160px] rounded-none w-64  border border-gray-400 shadow-lg p-[1px]">
            <DropdownMenuItem
              className="text-blue-700 font-bold focus:text-blue-700 cursor-pointer   border border-white  focus:border-blue-500 focus:bg-blue-100"
              onClick={handleLoginAll}
            >
              Login All
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500 font-bold focus:text-red-500 cursor-pointer   border border-white  focus:border-blue-500 focus:bg-blue-100"
              onClick={handleLogoutAll}
            >
              Logout All
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-blue-700 font-bold focus:text-blue-700 cursor-pointer   border border-white  focus:border-blue-500 focus:bg-blue-100"
              onClick={handleDelayLoginAll}
            >
              Delayed Login All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex px-2 h-5 items-center text-sm mb-4">
        {listSportsBookRef.current.map((sportsBook: string) => {
          const isSelected = selectedSportsBook === sportsBook
          return (
            <div key={sportsBook} className="flex justify-between">
              <div className={`border ${isSelected ? 'border-gray-400' : 'border-transparent'}`}>
                <button
                  className={`px-2 border ${
                    isSelected
                      ? 'border-gray-500 border-r-gray-300 border-b-gray-300'
                      : 'border-transparent'
                  }`}
                  onClick={() => handleSelectSportsBook(sportsBook)}
                >
                  {sportsBook}
                </button>
              </div>
              <Separator orientation="vertical" className="bg-gray-500 mx-3 py-3" />
            </div>
          )
        })}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar ">
        <div className="h-96">
          {selectedSportsBook && (
            <div className="px-4">
              {filteredSportsBooks.map((sportsBook) => (
                <DetailSportsBook key={sportsBook.id} sportsBook={sportsBook} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

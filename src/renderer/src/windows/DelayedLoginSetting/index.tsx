import { Button } from '@renderer/components/ui/button'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { useEffect, useState } from 'react'

export default function DelayedLoginSetting() {
  const [delayLoginFrom, setDelayLoginFrom] = useState<string>('0')
  const [delayLoginTo, setDelayLoginTo] = useState<string>('0')

  useEffect(() => {
    const fetchListAccount = async () => {
      const data = await window.electron.ipcRenderer.invoke('DataDelayedLoginSetting')

      if (data) {
        setDelayLoginFrom(data.delayLoginSec_from)
        setDelayLoginTo(data.delayLoginSec_to)
      }
    }
    fetchListAccount()
  }, [])

  const handleDelayFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelayLoginFrom(e.target.value)
  }

  const handleDelayToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelayLoginTo(e.target.value)
  }

  const handleOk = () => {
    let newDelayLoginFrom = delayLoginFrom === '' ? 50 : parseInt(String(delayLoginFrom), 10)
    let newDelayLoginTo = delayLoginTo === '' ? 50 : parseInt(String(delayLoginTo), 10)

    if (newDelayLoginFrom <= 0) newDelayLoginFrom = 50
    if (newDelayLoginTo <= 0) newDelayLoginTo = 50

    if (newDelayLoginFrom > 9999) newDelayLoginFrom = 9999
    if (newDelayLoginTo > 9999) newDelayLoginTo = 9999

    if (newDelayLoginTo < newDelayLoginFrom) {
      newDelayLoginTo = newDelayLoginFrom
    }

    newDelayLoginFrom = Math.floor(newDelayLoginFrom)
    newDelayLoginTo = Math.floor(newDelayLoginTo)

    setDelayLoginFrom(newDelayLoginFrom + '')
    setDelayLoginTo(newDelayLoginTo + '')

    window.electron.ipcRenderer.send('DataUpdateDelayedLoginSetting', {
      delayLoginSec_from: newDelayLoginFrom + '',
      delayLoginSec_to: newDelayLoginTo + ''
    })
  }
  return (
    <div className="flex flex-col bg-layout-color px-3 pt-5 h-full">
      <div className="h-[82px] ">
        <BoxLabel label="Setting" className=" w-full flex items-center justify-center ">
          <div className="flex">
            <p className="mr-9">Delay Login Sec </p>
            <div className="flex gap-4">
              <input
                type="number"
                id="quantity1"
                name="quantity1"
                min="1"
                max="9999"
                className="outline-none border border-gray-400 pl-1 w-16"
                value={delayLoginFrom}
                onChange={handleDelayFromChange}
              />
              <p>to</p>
              <input
                type="number"
                id="quantity2"
                name="quantity2"
                min="1"
                max="9999"
                className="outline-none border border-gray-400 pl-1 w-16"
                value={delayLoginTo}
                onChange={handleDelayToChange}
              />
            </div>
          </div>
        </BoxLabel>
        <div className="absolute bottom-3 right-5">
          <Button
            variant="outline"
            onClick={handleOk}
            className="border border-solid py-0 px-8 leading-none h-6 w-20  hover:border-blue-500  border-gray-400"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  )
}

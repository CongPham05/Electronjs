import { useEffect, useState } from 'react'
import BoxLabel from '@renderer/layouts/BoxLabel'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function Setting() {
  const [profitMin, setProfitMin] = useState<number | string>()
  const [profitMax, setProfitMax] = useState<number | string>()
  const [gameType, setGameType] = useState<string>('None')

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.electron.ipcRenderer.invoke('GetDataSetting')
      if (data.length > 0) {
        setProfitMin(data[0].profitMin || 0)
        setProfitMax(data[0].profitMax || 0)
        setGameType(data[0].gameType || 'None')
      }
    }

    fetchData()

    return () => {
      window.electron.ipcRenderer.removeAllListeners('GetDataSetting')
    }
  }, [])

  const handleChangeMin = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setProfitMin(value)
  }

  const handleChangeMax = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setProfitMax(value)
  }

  const handleChangeGameType = (value: string) => {
    setGameType(value)
  }

  const handleSaveSetting = () => {
    window.electron.ipcRenderer.send('SaveSettingWindow', {
      profitMin,
      profitMax,
      gameType
    })
  }

  return (
    <div className="bg-layout-color p-3 h-full flex flex-col">
      <div className="grid gap-3.5 grid-cols-2">
        <BoxLabel label="Basic Setting" className="w-full">
          <div className="flex flex-col my-4 mx-3 gap-2">
            <div className="flex  items-center justify-between">
              <div>Odds Type</div>
              <Select defaultValue="Malay">
                <SelectTrigger className="w-[140px] h-6 bg-white rounded-none border-gray-500 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-gray-500 focus:ring-0">
                  <SelectItem value="Malay">Malay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className=" flex items-center justify-between">
              <p className="font-bold">Profit Commission</p>
              <input
                type="number"
                id="quantity"
                name="quantity"
                step="0.1"
                className="w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 "
                value={profitMin}
                onChange={handleChangeMin}
              />
              <p className="font-bold">to</p>
              <input
                type="number"
                id="quantity"
                name="quantity"
                step="0.1"
                className="w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 "
                value={profitMax}
                onChange={handleChangeMax}
              />
            </div>
          </div>
        </BoxLabel>
      </div>
      <div className="mt-8 h-[60px]">
        <BoxLabel label="Game Type" className="w-[301px] ">
          <RadioGroup
            value={gameType}
            onValueChange={handleChangeGameType}
            className="flex h-full justify-center items-center"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Running" id="Running" className="bg-white" />
              <Label htmlFor="Running">Running</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Today" id="Today" className="bg-white" />
              <Label htmlFor="Today">Today</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Early" id="Early" className="bg-white" />
              <Label htmlFor="Early">Early</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="None" id="None" className="bg-white" />
              <Label htmlFor="None">None</Label>
            </div>
          </RadioGroup>
        </BoxLabel>
      </div>
      <div className="flex-1 mt-4"></div>
      <div className="text-right mt-1.5 mr-3 ">
        <Button
          variant="outline"
          className=" border  border-solid  border-gray-400 hover:border-blue-500 py-0 px-8 leading-none h-7 font-bold w-24"
          onClick={handleSaveSetting}
        >
          Save
        </Button>
      </div>
    </div>
  )
}

import TopSportsBookPerMatchLimitSettingWindow from '@renderer/components/TopSportsBookPerMatchLimitSettingWindow'
import BottomSportsBookPerMatchLimitSettingWindow from '@renderer/components/BottomSportsBookPerMatchLimitSettingWindow'

import { Button } from '@renderer/components/ui/button'
import { SettingPerMatchLimitType } from '@shared/types'
import { useState, useEffect, useCallback } from 'react'

export default function SportsBookPerMatchLimitSetting() {
  const [data, setData] = useState<{
    enable: number
    data: SettingPerMatchLimitType[]
  } | null>(null)

  const [showDisable, setShowDisable] = useState<boolean>(false)
  const [listPlatform, setListPlatform] = useState<SettingPerMatchLimitType[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<SettingPerMatchLimitType>({
    id: 999999,
    namePlatform: '',
    limitMethod: 'TeamName',
    livePreGame: 0,
    limitType: 'TotalCount',
    totalAmount: '5000',
    totalCount: '2'
  })

  useEffect(() => {
    const fetchData = async () => {
      const result = (await window.electron.ipcRenderer.invoke('PerMatchLimitSetting')) as {
        enable: number
        data: SettingPerMatchLimitType[]
      }
      setData(result)
      setShowDisable(Boolean(result.enable))
      setListPlatform(result.data)
      if (result.data.length > 0) {
        setSelectedPlatform(result.data[0] as SettingPerMatchLimitType)
      }
    }

    fetchData()
  }, [])

  const handleSave = () => {
    window.electron.ipcRenderer.send('CloseSportsBookPerMatchLimitSetting', {
      enable: +showDisable,
      listPlatform
    })
  }

  if (!data || !listPlatform.length || !selectedPlatform) {
    return null
  }

  return (
    <div className="h-full w-full flex flex-col">
      <TopSportsBookPerMatchLimitSettingWindow
        showDisable={showDisable}
        setShowDisable={setShowDisable}
        listPlatform={listPlatform}
        setListPlatform={setListPlatform}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
      />
      <BottomSportsBookPerMatchLimitSettingWindow
        selectedPlatform={selectedPlatform || data.data[0]}
      />
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="bg-white border border-solid border-gray-400 hover:border-blue-500 mr-2 my-2 px-8 leading-none h-6 w-20"
          onClick={handleSave}
        >
          OK
        </Button>
      </div>
    </div>
  )
}

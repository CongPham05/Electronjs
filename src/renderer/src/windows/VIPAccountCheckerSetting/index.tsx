import { Button } from '@renderer/components/ui/button'
import { useEffect, useState } from 'react'

export default function VIPAccountCheckerSetting() {
  const [isAutoLogoutEnabled, setIsAutoLogoutEnabled] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.electron.ipcRenderer.invoke('VIPAccountCheckerSetting')
      setIsAutoLogoutEnabled(Boolean(data))
    }
    fetchData()
  }, [])

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAutoLogoutEnabled(event.target.checked)
  }

  const handleSave = () => {
    window.electron.ipcRenderer.send('updateVIPAccountCheckerSetting', {
      VIPAccountLogout: +isAutoLogoutEnabled
    })
  }

  return (
    <div className="pt-4 px-2 flex flex-col gap-2">
      <div className=" h-[102px] flex items-center justify-center cursor-pointer border border-gray-300">
        <input
          id="bordered-checkbox-1"
          type="checkbox"
          checked={isAutoLogoutEnabled}
          name="bordered-checkbox"
          onChange={handleCheckboxChange}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 cursor-pointer"
        />
        <label htmlFor="bordered-checkbox-1" className="ms-1 text-sm font-medium cursor-pointer">
          Auto logout VIP Account
        </label>
      </div>
      <div className="flex justify-end ">
        <Button
          variant="outline"
          className="bg-white border border-solid border-gray-400 hover:border-blue-500 py-0 px-8 leading-none h-6 w-20"
          onClick={handleSave}
        >
          OK
        </Button>
      </div>
    </div>
  )
}

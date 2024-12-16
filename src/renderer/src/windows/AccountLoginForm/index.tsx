import { AlertError } from '@renderer/components/AlertError'
import { Button } from '@renderer/components/ui/button'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'
import Eye from '@renderer/icons/eye'
import EyeSlash from '@renderer/icons/eye-slash'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { AccountType } from '@shared/types'
import { useEffect, useRef, useState } from 'react'

export const AccountLoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [username, setUsername] = useState('')

  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    visible: false
  })

  const firstInputRef = useRef<HTMLInputElement>(null)

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  useEffect(() => {
    const fetchAccount = async () => {
      const data = (await window.electron.ipcRenderer.invoke('DataAccount')) as AccountType
      setFormData({
        username: data.loginID || '',
        password: data.password || ''
      })
      setUsername(data.loginID)
    }
    fetchAccount()
  }, [])

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [])

  const handleOk = async () => {
    if (formData.username && formData.username !== username) {
      const isDuplicate = await window.electron.ipcRenderer.invoke(
        'CheckUserNameAccount',
        formData.username
      )
      if (isDuplicate) {
        setAlertConfig({
          title: 'Notification',
          message: 'This account already exists!',
          visible: true
        })
        return
      }
    }

    window.electron.ipcRenderer.send('Data_AccountLoginForm', formData)
  }

  return (
    <div className="flex flex-col bg-layout-color px-3 pt-5 h-full">
      <div>
        <BoxLabel label="Account Information" className="w-full h-[333px]">
          <div className="pt-4 pb-3 px-7 flex flex-col gap-4 p">
            <div className="flex">
              <p className="w-36">Account Login</p>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="outline-none pl-1 border-b-2 border-gray-300 focus:border-blue-500 flex-1"
                spellCheck={false}
                maxLength={20}
              />
            </div>
            <div className="flex">
              <p className="w-36">Account Password</p>
              <div className="bg-white pl-1 border-b-2 border-gray-300 focus-within:border-blue-500 flex-1 flex items-center">
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="outline-none flex-1"
                  spellCheck={false}
                  maxLength={20}
                />
                <button
                  type="button"
                  className=" w-4 text-gray-400  mr-1"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                >
                  {isPasswordVisible ? <Eye /> : <EyeSlash />}
                </button>
              </div>
            </div>
          </div>
        </BoxLabel>
      </div>
      <div className="absolute bottom-4 right-5">
        <Button
          variant="outline"
          onClick={handleOk}
          className="border border-solid py-0 px-8 leading-none h-7 w-20  hover:border-blue-500 border-gray-400"
        >
          OK
        </Button>
      </div>
      <AlertError
        showAlertDialog={alertConfig.visible}
        setShowAlertDialog={(visible) => setAlertConfig((prev) => ({ ...prev, visible }))}
        title={alertConfig.title}
        messageError={alertConfig.message}
        ReactElement={<ExclamationTriangle className="size-11 text-[#FF8C00] mr-1" />}
      />
    </div>
  )
}

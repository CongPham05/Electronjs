import { Spinner } from '@renderer/components/ui/spinner'
import Eye from '@renderer/icons/eye'
import EyeSlash from '@renderer/icons/eye-slash'
import { useCallback, useEffect, useState } from 'react'

export default function Login() {
  const [username, setUserName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isSaveLogin, setIsSaveLogin] = useState<boolean>(() => {
    const savedState = localStorage.getItem('isSaveLogin')
    return savedState !== null ? JSON.parse(savedState) : false
  })

  const [isLoading, setIsLoading] = useState(false)

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  useEffect(() => {
    localStorage.setItem('isSaveLogin', JSON.stringify(isSaveLogin))

    if (isSaveLogin) {
      const savedUserName = localStorage.getItem('username')
      const savedPassword = localStorage.getItem('password')
      if (savedUserName && savedPassword) {
        setUserName(savedUserName)
        setPassword(savedPassword)
      }
    } else {
      localStorage.removeItem('username')
      localStorage.removeItem('password')
    }
  }, [isSaveLogin])

  const CloseLoginWindow = useCallback(() => {
    window.electron.ipcRenderer.send('CloseLoginWindow')
  }, [])

  const checkInternetConnection = () => {
    return navigator.onLine
  }

  const handleLogin = useCallback(() => {
    setErrorMessage('')

    if (!username || !password) {
      setErrorMessage('Please enter both username and password.')
      return
    }

    if (!checkInternetConnection()) {
      setErrorMessage('No internet. Please check your connection and try again.')
      return
    }

    setIsLoading(true)
    window.electron.ipcRenderer.send('AttemptLogin', { username, password })

    window.electron.ipcRenderer.once('LoginResult', (_event, { success, message }) => {
      setIsLoading(false)
      if (success) {
        if (isSaveLogin) {
          localStorage.setItem('username', username)
          localStorage.setItem('password', password)
        } else {
          localStorage.removeItem('username')
          localStorage.removeItem('password')
        }
      } else {
        setErrorMessage(message || 'Login failed. Please try again.')
      }
    })
  }, [username, password, isSaveLogin])

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSaveLogin(e.target.checked)
    if (!e.target.checked) {
      localStorage.removeItem('username')
      localStorage.removeItem('password')
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleLogin()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleLogin])

  return (
    <div className="bg-black opacity-90 h-full text-gray-500 flex flex-col relative border border-gray-600">
      <div className="flex justify-between px-2 pt-1">
        <p className="underline cursor-pointer hover:text-blue-700" onClick={handleLogin}>
          Re-Update
        </p>

        <div className="flex items-center ">
          <input
            type="checkbox"
            id="checkboxLogin"
            className=" cursor-pointer"
            checked={isSaveLogin}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="checkboxLogin" className="pl-2 cursor-pointer">
            SaveLogin
          </label>
        </div>
      </div>
      <div className="flex-1 flex justify-center items-center">
        <p className=" text-5xl tracking-widest font-serif text-white ">B-SOFT</p>
      </div>
      <div className="text-[#FF0000] font-semibold text-center h-1 mb-9">{errorMessage ?? ''}</div>
      <div className=" px-6 pb-5 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex">
            <p className=" w-[66px] font-bold text-slate-300">ID</p>
            <input
              type="text"
              maxLength={20}
              className="w-[118px] outline-none text-gray-200 bg-[#374b57] border border-gray-400 "
              value={username}
              onChange={(e) => {
                setUserName(e.target.value)
                setErrorMessage('')
              }}
            />
          </div>
          <div className="flex">
            <p className="w-[66px] font-bold text-slate-300">Password</p>
            <div className="flex-1  border border-gray-400 bg-[#374b57] flex  items-center justify-between">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                maxLength={20}
                value={password}
                className="w-28 outline-none text-gray-200 bg-[#374b57] border-red-400 "
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrorMessage('')
                }}
              />
              <button
                type="button"
                className=" w-4 text-gray-400 hover:text-gray-200 mr-1"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
              >
                {isPasswordVisible ? <Eye /> : <EyeSlash />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="bg-gray-200 text-black font-bold block h-6 w-28 hover:bg-orange-300 transition duration-300"
            onClick={handleLogin}
          >
            Login
          </button>
          <button
            className="bg-gray-200 text-black font-bold block h-6 w-28 hover:bg-orange-300 transition duration-300"
            onClick={CloseLoginWindow}
          >
            Cancel
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center w-full h-full absolute  bg-gray-950 bg-opacity-70 ">
          <Spinner className="text-white " />
        </div>
      )}
    </div>
  )
}

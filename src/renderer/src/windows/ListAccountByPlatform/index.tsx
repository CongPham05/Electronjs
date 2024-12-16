import { useEffect, useState } from 'react'
import {
  useReactTable,
  ColumnResizeMode,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  ColumnResizeDirection,
  RowData
} from '@tanstack/react-table'
import { Button } from '@renderer/components/ui/button'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { AccountType } from '@shared/types'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
    setHasError: (hasError: boolean) => void // Add this line
  }
}

const defaultColumns: ColumnDef<AccountType>[] = [
  {
    accessorKey: 'No',
    header: () => <span>No</span>,
    footer: (props) => props.column.id,
    cell: ({ row }) => {
      return (
        <div className="px-1 w-full h-full outline-none rounded-none flex items-center justify-center">
          {row.index + 1}
        </div>
      )
    }
  },
  {
    accessorKey: 'loginID',
    header: () => <span>Login ID</span>,
    footer: (props) => props.column.id
  },
  {
    accessorKey: 'password',
    header: () => <span>Password</span>,
    footer: (props) => props.column.id
  },
  {
    accessorKey: 'loginURL',
    header: () => <span>Login URL</span>,
    footer: (props) => props.column.id,
    cell: ({ getValue }) => {
      return (
        <div className="px-1  hover:border-blue-500 leading-none">
          <span>{getValue() as string}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'proxyIP',
    header: () => <span>Proxy IP</span>,
    footer: (props) => props.column.id
  },
  {
    accessorKey: 'proxyPort',
    header: () => <span>Proxy Port</span>,
    footer: (props) => props.column.id
  },
  {
    accessorKey: 'proxyUsername',
    header: () => <span>ProxyUsername</span>,
    footer: (props) => props.column.id
  },
  {
    accessorKey: 'proxyPassword',
    header: () => <span>ProxyPassword</span>,
    footer: (props) => props.column.id
  }
]

const defaultColumn: Partial<ColumnDef<AccountType>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = (getValue() as string) ?? ''
    const [value, setValue] = useState<string>(initialValue)
    const [error, setError] = useState<string | null>(null)

    const onBlur = () => {
      table.options.meta?.updateData(index, id, value)
    }

    useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)

      // Check for duplicate LoginIDs
      if (id === 'loginID') {
        const allLoginIDs = table.getCoreRowModel().rows.map((row) => row.original.loginID)
        const isDuplicate = allLoginIDs.some(
          (loginID, rowIdx) => loginID === newValue && rowIdx !== index
        )

        if (isDuplicate) {
          setError('This Login ID is already in use.')
          table.options.meta?.setHasError(true) // Set error state
        } else {
          setError(null)
          table.options.meta?.setHasError(false) // Reset error state
        }
      }
    }

    return (
      <div>
        <input
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          className={`px-1 w-full h-full bg-white outline-none rounded-none focus:ring-0 cursor-pointer ${
            error ? 'border-red-500' : 'focus:border-blue-500'
          }`}
        />
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      </div>
    )
  }
}

export const ListAccountByPlatform = () => {
  const [data, setData] = useState<AccountType[]>([])
  const [hasError, setHasError] = useState<boolean>(false) // State to track validation errors
  const [columns] = useState<typeof defaultColumns>(() => [...defaultColumns])
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange')
  const [columnResizeDirection] = useState<ColumnResizeDirection>('ltr')

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    columnResizeMode,
    columnResizeDirection,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...row,
                [columnId]: value
              }
            }
            return row
          })
        )
      },
      setHasError // Pass setHasError function to update error state
    }
  })

  useEffect(() => {
    const fetch = async () => {
      const listAccountByPlatform = await window.electron.ipcRenderer.invoke(
        'GetListAccountByPlatform'
      )
      setData(listAccountByPlatform)
    }
    fetch()
  }, [])

  const handleSaveAccountList = () => {
    const dataAccountNew = table.getCoreRowModel().rows.map((row) => {
      const original = row.original
      const trimmedOriginal = Object.fromEntries(
        Object.entries(original).map(([key, value]) =>
          typeof value === 'string' ? [key, value.trim()] : [key, value]
        )
      )
      return trimmedOriginal
    })

    window.electron.ipcRenderer.send('SaveAccountListWindow', dataAccountNew)
  }

  return (
    <div className="bg-layout-color h-full py-3 px-2">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden pt-2">
          <BoxLabel label="Account List" className="w-full pt-4 px-2 ">
            <div className="h-full w-full border border-zinc-500 overflow-hidden ">
              <div
                style={{ direction: table.options.columnResizeDirection }}
                className="h-full w-full overflow-auto custom-scrollbar"
              >
                <div className="">
                  <table
                    {...{
                      style: {
                        width: table.getCenterTotalSize()
                      }
                    }}
                  >
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header, index) => (
                            <th
                              key={header.id}
                              {...{
                                colSpan: header.colSpan,
                                style: {
                                  width: index === 0 ? '20px' : header.getSize()
                                }
                              }}
                              className="bg-white"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                              <div
                                {...{
                                  onDoubleClick: () => header.column.resetSize(),
                                  onMouseDown: header.getResizeHandler(),
                                  onTouchStart: header.getResizeHandler(),
                                  className: `resizer ${table.options.columnResizeDirection} ${
                                    header.column.getIsResizing() ? 'isResizing' : ''
                                  }`,
                                  style: {
                                    transform:
                                      columnResizeMode === 'onEnd' && header.column.getIsResizing()
                                        ? `translateX(${
                                            (table.options.columnResizeDirection === 'rtl'
                                              ? -1
                                              : 1) *
                                            (table.getState().columnSizingInfo.deltaOffset ?? 0)
                                          }px)`
                                        : ''
                                  }
                                }}
                              />
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="bg-white">
                          {row.getVisibleCells().map((cell, index) => (
                            <td
                              key={cell.id}
                              {...{
                                style: {
                                  width: index === 0 ? '20px' : cell.column.getSize()
                                }
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </BoxLabel>
        </div>
        <div className="text-right mt-1.5 mr-3">
          <Button
            variant="outline"
            className=" border  border-solid  border-gray-400 hover:border-blue-500 py-0 px-8 leading-none h-7 font-bold w-24"
            onClick={handleSaveAccountList}
            disabled={hasError}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

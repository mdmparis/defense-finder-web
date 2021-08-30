import { TableInstance } from 'react-table'

interface TableProps {
  tableInstance: TableInstance
}

export const Table = ({ tableInstance }: TableProps) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance
  return (
    <div {...getTableProps()} className="border-l border-t border-black text-sm">
      <div>
        {headerGroups.map(headerGroup => (
          <div {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <div {...column.getHeaderProps()} className="bg-beige text-shrimp p-1 border-r border-b border-black break-words">
                {column.render('Header')}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row)
          return (
            <div {...row.getRowProps()}>
              {row.cells.map(cell => {
                return (
                  <div {...cell.getCellProps()} className="break-words p-1 border-r border-b border-black " title="test">
                    {cell.render('Cell')}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

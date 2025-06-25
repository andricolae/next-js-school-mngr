const Table = ({
    columns,
    renderRow,
    data
}: {
    columns: { header: string, accessor: string; className?: string }[];
    renderRow: (item: any) => React.ReactNode;
    data: any[]
}) => {
    return (
        <div id="table-container">
            <table className='w-full mt-4'>
                <thead>
                    <tr className="text-left text-gray-500 text-sm">
                        {columns.map(col => (
                            <th key={col.accessor} className={col.className}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody id="table-body">{data.map((item) => renderRow(item))}</tbody>
            </table>
        </div>
    )
}

export default Table
import { useState } from 'react';
import { motion } from 'framer-motion';
import s from './Table.module.css';

const EmptyRows = ({ columns, message }) => (
  <tr>
    <td colSpan={columns.length} className={s.emptyCell}>
      <div className={s.emptyInner}>
        <div className={s.emptyIcon}>📭</div>
        <p className={s.emptyText}>{message}</p>
      </div>
    </td>
  </tr>
);

const Table = ({
  columns = [],
  data = [],
  emptyMessage = 'No data found.',
  onRowClick,
  rowKey = '_id',
  className = '',
  loading = false,
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const getThClass = (align) => {
    if (align === 'center') return s.thCenter;
    if (align === 'right') return s.thRight;
    return s.thLeft;
  };

  const getTdClass = (align) => {
    if (align === 'center') return s.tdCenter;
    if (align === 'right') return s.tdRight;
    return s.tdLeft;
  };

  return (
    <div className={`${s.wrapper} ${className}`}>
      <div className={s.scrollArea}>
        <table className={s.table}>
          <thead className={s.thead}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${getThClass(col.align)} ${col.headerClassName || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={s.skeletonRow}>
                  {columns.map((col) => (
                    <td key={col.key} className={s.skeletonCell}>
                      <div className={s.skeletonBar} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <EmptyRows columns={columns} message={emptyMessage} />
            ) : (
              data.map((row, idx) => (
                <motion.tr
                  key={row[rowKey] || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`${hoveredRow === idx ? s.trHover : s.tr} ${onRowClick ? s.trClickable : ''}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${getTdClass(col.align)} ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row[col.key], row, idx) : row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

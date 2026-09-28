// Real client-side CSV export utility
// Generates and triggers actual browser download of .csv files

export function exportToCsv(filename, headers, rows) {
  if (!rows || !rows.length) {
    const csvContent = headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';
    triggerDownload(filename, csvContent);
    return;
  }

  const escapeCell = (cell) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map(row => row.map(escapeCell).join(','));
  const csvContent = [headerLine, ...rowLines].join('\r\n');

  triggerDownload(filename, csvContent);
}

function triggerDownload(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

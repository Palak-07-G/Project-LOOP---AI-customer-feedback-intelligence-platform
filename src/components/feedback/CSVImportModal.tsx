import React, { useState } from 'react';
import Papa from 'papaparse';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { api } from '../../lib/api.js';
import { Upload, FileText, CheckCircle2, AlertTriangle, Download } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{
    imported: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);

  const sampleCsvContent = `content,channel,customer_label,created_at
"Team member invitation link is expiring too quickly during onboarding.","Support Ticket","Enterprise #99","2026-08-15"
"Love the fast search bar and clean analytics dashboard.","NPS Survey","Growth Pro #12","2026-08-16"
"Double billed for 2 extra seats when upgrading tier.","Support Ticket","SaaS Founder","2026-08-17"
"Would love a Microsoft Teams webhook integration.","Community Post","Developer #404","2026-08-18"`;

  const downloadSampleTemplate = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loop_feedback_sample_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setImportSummary(null);

    Papa.parse(selected, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('CSV file is empty or formatted incorrectly.');
          setParsedRows([]);
        } else {
          setParsedRows(results.data);
        }
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const summary = await api.importCsvFeedback(parsedRows);
      setImportSummary(summary);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to import CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Customer Feedback via CSV"
      description="Upload batch feedback. Expected columns: content, channel, customer_label, created_at."
      maxWidth="lg"
    >
      {importSummary ? (
        <div className="space-y-4 py-2 font-serif">
          <div className="p-4 bg-[#1B4D3E] text-[#FFFFFF] border-2 border-[#1A1A1A] flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#FFFFFF] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-serif font-bold text-[#FFFFFF]">Import Operation Complete</h4>
              <p className="text-xs font-sans text-[#F9F7F2] mt-1">
                Successfully processed and classified <strong>{importSummary.imported}</strong> customer records.
              </p>
            </div>
          </div>

          {importSummary.failed > 0 && (
            <div className="p-4 bg-[#8E2828] text-[#FFFFFF] border-2 border-[#1A1A1A] space-y-2">
              <div className="flex items-center gap-2 text-xs font-sans font-bold">
                <AlertTriangle className="w-4 h-4 text-[#FFFFFF]" />
                <span>{importSummary.failed} Rows Failed Validation:</span>
              </div>
              <ul className="text-xs font-mono space-y-1 max-h-36 overflow-y-auto pl-5 list-disc">
                {importSummary.errors.map((e, idx) => (
                  <li key={idx}>
                    Row {e.row}: {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t-2 border-[#1A1A1A]">
            <Button onClick={onClose} variant="primary" size="sm">
              Done & View Ledger
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 font-serif">
          {error && (
            <div className="p-3 bg-[#8E2828] text-[#FFFFFF] text-xs font-sans font-bold">
              {error}
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-[#1A1A1A] bg-[#F9F7F2] hover:bg-[#FFFFFF] p-6 text-center transition-colors cursor-pointer">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center">
              <div className="w-10 h-10 border border-[#1A1A1A] bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-serif font-bold text-[#1A1A1A]">
                {file ? file.name : 'Click to select or drag and drop CSV file'}
              </p>
              <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#5C5850] mt-1">Standard comma-separated format UTF-8</p>
            </label>
          </div>

          {/* CSV Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-sans font-bold text-[#5C5850]">
                <span>Previewing {parsedRows.length} parsed records</span>
                <span className="text-[#1B4D3E]">Ready to classify & ingest</span>
              </div>
              <div className="max-h-40 overflow-y-auto border-2 border-[#1A1A1A] bg-[#FFFFFF] text-xs font-serif">
                <table className="w-full text-left">
                  <thead className="bg-[#EBE7DF] border-b border-[#1A1A1A] sticky top-0 text-[#1A1A1A] font-sans font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-2">Content</th>
                      <th className="p-2">Channel</th>
                      <th className="p-2">Customer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]/10">
                    {parsedRows.slice(0, 4).map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2 truncate max-w-xs">{row.content || row.Content}</td>
                        <td className="p-2 whitespace-nowrap">{row.channel || row.Channel}</td>
                        <td className="p-2 whitespace-nowrap">{row.customer_label || row.Customer || 'User'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-[#1A1A1A]">
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="text-xs font-sans font-bold uppercase tracking-wider text-[#1A1A1A] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Sample CSV Template
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleImport}
                loading={loading}
                disabled={parsedRows.length === 0}
              >
                Import {parsedRows.length > 0 ? `${parsedRows.length} Rows` : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};


'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Upload, FileText, Check, AlertTriangle, Download, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';

const PLATFORMS = [
  { id: 'csv', name: 'CSV File', desc: 'Upload a spreadsheet', icon: FileText },
  { id: 'trainerize', name: 'Trainerize', desc: 'Import from Trainerize', icon: Users },
  { id: 'truecoach', name: 'TrueCoach', desc: 'Import from TrueCoach', icon: Users },
  { id: 'everfit', name: 'Everfit', desc: 'Import from Everfit', icon: Users },
];

const SAMPLE_ROWS = [
  { name: 'John Smith', email: 'john@email.com', phone: '+1 555-0101', status: 'valid' },
  { name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+1 555-0102', status: 'valid' },
  { name: 'Mike Davis', email: 'mike@email.com', phone: '', status: 'warning' },
  { name: '', email: 'noname@email.com', phone: '+1 555-0104', status: 'error' },
  { name: 'Emma Wilson', email: 'emma@email.com', phone: '+1 555-0105', status: 'valid' },
];

export default function ImportClientsPage() {
  const [step, setStep] = useState<'select' | 'upload' | 'review' | 'done'>('select');
  const [platform, setPlatform] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleUpload = () => { setStep('review'); };
  const handleImport = async () => {
    setImporting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setImporting(false);
    setStep('done');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-slide-up">
      <Link href="/clients" className="inline-flex items-center gap-1 text-body-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
        <ChevronLeft size={16} /> Clients
      </Link>

      <div>
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">Import Clients</h1>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          Migrate your roster from another platform or upload a CSV.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {['Source', 'Upload', 'Review', 'Done'].map((s, i) => {
          const stepIdx = ['select', 'upload', 'review', 'done'].indexOf(step);
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-body-xs font-medium',
                i <= stepIdx ? 'bg-brand-500 text-white' : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]'
              )}>
                {i < stepIdx ? <Check size={12} /> : i + 1}
              </div>
              <span className={cn('text-body-xs', i <= stepIdx ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]')}>{s}</span>
              {i < 3 && <div className={cn('w-8 h-px', i < stepIdx ? 'bg-brand-500' : 'bg-[var(--color-border)]')} />}
            </div>
          );
        })}
      </div>

      {/* Step: Select source */}
      {step === 'select' && (
        <div className="grid grid-cols-2 gap-4">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPlatform(p.id); setStep('upload'); }}
              className={cn(
                'rounded-xl border p-5 text-left transition-all hover:border-brand-500/50 hover:bg-brand-50/20 dark:hover:bg-brand-900/10',
                platform === p.id ? 'border-brand-500 bg-brand-50/30' : 'border-[var(--color-border)]'
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-surface-tertiary)] mb-3">
                <p.icon size={18} className="text-[var(--color-text-secondary)]" />
              </div>
              <p className="text-sub-md text-[var(--color-text-primary)]">{p.name}</p>
              <p className="text-body-xs text-[var(--color-text-tertiary)] mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step: Upload */}
      {step === 'upload' && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20 mb-4">
                <Upload size={28} className="text-brand-500" />
              </div>
              <p className="text-sub-md text-[var(--color-text-primary)]">Upload your {platform === 'csv' ? 'CSV file' : `${platform} export`}</p>
              <p className="text-body-sm text-[var(--color-text-secondary)] mt-1 mb-6 max-w-md">
                {platform === 'csv'
                  ? 'Columns needed: name, email. Optional: phone, goals, start_date.'
                  : `Export your client list from ${platform} as CSV, then upload here.`}
              </p>

              <div className="w-full max-w-sm rounded-xl border-2 border-dashed border-[var(--color-border)] p-8 hover:border-brand-500/50 transition-colors cursor-pointer mb-4">
                <Upload size={24} className="mx-auto text-[var(--color-text-tertiary)] mb-2" />
                <p className="text-body-sm text-[var(--color-text-secondary)]">Drop CSV here or click to browse</p>
                <p className="text-body-xs text-[var(--color-text-tertiary)] mt-1">.csv, .xlsx up to 10MB</p>
              </div>

              <Button variant="primary" onClick={handleUpload}>Continue</Button>

              <button onClick={() => {}} className="mt-4 flex items-center gap-1 text-body-xs text-brand-500 hover:text-brand-600">
                <Download size={11} /> Download CSV template
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sub-md text-[var(--color-text-primary)]">Review import</p>
                <p className="text-body-xs text-[var(--color-text-tertiary)]">5 clients detected</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="success" dot>3 valid</Badge>
                <Badge variant="warning" dot>1 warning</Badge>
                <Badge variant="danger" dot>1 error</Badge>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="bg-[var(--color-surface-secondary)]">
                    <th className="px-3 py-2 text-left text-body-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-body-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2 text-left text-body-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">Email</th>
                    <th className="px-3 py-2 text-left text-body-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_ROWS.map((row, i) => (
                    <tr key={i} className="border-t border-[var(--color-border-light)]">
                      <td className="px-3 py-2">
                        {row.status === 'valid' && <Badge variant="success" dot>OK</Badge>}
                        {row.status === 'warning' && <Badge variant="warning" dot>Missing</Badge>}
                        {row.status === 'error' && <Badge variant="danger" dot>Error</Badge>}
                      </td>
                      <td className={cn('px-3 py-2', !row.name && 'text-error-500 italic')}>{row.name || 'Missing name'}</td>
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">{row.email}</td>
                      <td className={cn('px-3 py-2', !row.phone && 'text-[var(--color-text-tertiary)] italic')}>{row.phone || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-warning-50/50 dark:bg-amber-900/10 border border-warning-500/20 p-3">
              <AlertTriangle size={14} className="text-warning-500 shrink-0" />
              <p className="text-body-xs text-[var(--color-text-primary)]">1 row has errors. Invalid rows will be skipped during import.</p>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep('upload')}>Back</Button>
              <Button variant="primary" onClick={handleImport} loading={importing} icon={<ArrowRight size={14} />}>
                {importing ? 'Importing...' : 'Import 4 clients'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 dark:bg-emerald-900/20 mx-auto mb-4 animate-scale-in">
              <Check size={28} className="text-success-500" />
            </div>
            <p className="text-heading-2 text-[var(--color-text-primary)]">Import Complete</p>
            <p className="text-body-md text-[var(--color-text-secondary)] mt-2">4 clients imported successfully. 1 row skipped.</p>
            <div className="flex gap-2 justify-center mt-6">
              <Link href="/clients"><Button variant="primary">View Clients</Button></Link>
              <Button variant="secondary" onClick={() => { setStep('select'); setPlatform(null); }}>Import More</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

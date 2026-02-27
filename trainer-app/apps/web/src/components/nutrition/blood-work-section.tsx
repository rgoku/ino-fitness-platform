'use client';

import { useRef } from 'react';
import { FileUp, ChevronDown, ChevronRight, FileText, Image, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { simulateMarkerExtraction } from '@/lib/blood-work-types';
import type { BloodWorkRecord } from '@/lib/blood-work-types';
import type { MockClient } from '@/lib/mock-data';

interface BloodWorkSectionProps {
  records: BloodWorkRecord[];
  onRecordsChange: (records: BloodWorkRecord[]) => void;
  clients: MockClient[];
  expanded: boolean;
  onToggle: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function BloodWorkSection({
  records,
  onRecordsChange,
  clients,
  expanded,
  onToggle,
}: BloodWorkSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newRecords: BloodWorkRecord[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) return;

      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = () => {
        const record: BloodWorkRecord = {
          id: `bw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          clientId: clients[0]?.id || '',
          clientName: clients[0]?.name || '',
          fileName: file.name,
          fileType: isImage ? 'image' : 'pdf',
          fileSize: file.size,
          dataUrl: reader.result as string,
          uploadedAt: new Date().toISOString(),
          markers: simulateMarkerExtraction(),
        };
        newRecords.push(record);
        onRecordsChange([...records, ...newRecords]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeRecord = (id: string) => {
    onRecordsChange(records.filter((r) => r.id !== id));
  };

  const assignClient = (recordId: string, clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    onRecordsChange(
      records.map((r) =>
        r.id === recordId
          ? { ...r, clientId: client.id, clientName: client.name }
          : r
      )
    );
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const flaggedMarkers = (record: BloodWorkRecord) => {
    const flags: string[] = [];
    const m = record.markers;
    if (m.vitaminD !== undefined && m.vitaminD < 30) flags.push(`Vit D: ${m.vitaminD}`);
    if (m.crp !== undefined && m.crp > 3) flags.push(`CRP: ${m.crp}`);
    if (m.ldl !== undefined && m.ldl > 130) flags.push(`LDL: ${m.ldl}`);
    if (m.ferritin !== undefined && m.ferritin < 30) flags.push(`Ferritin: ${m.ferritin}`);
    return flags;
  };

  return (
    <Card>
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-5 py-3 text-left hover:bg-[var(--color-surface-hover)] transition-colors rounded-lg"
      >
        <FileUp size={16} strokeWidth={1.8} className="text-[var(--color-text-tertiary)]" />
        <span className="text-sm font-medium text-[var(--color-text-primary)]">Blood Work</span>
        {records.length > 0 && (
          <Badge variant="info">{records.length}</Badge>
        )}
        <span className="ml-auto text-[var(--color-text-tertiary)]">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-4 space-y-3 border-t border-[var(--color-border)]">
          {/* Upload zone */}
          <div
            onClick={() => inputRef.current?.click()}
            className={cn(
              'mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-colors',
              'border-[var(--color-border)] bg-[var(--color-surface-secondary)]',
              'hover:border-[var(--color-accent)]'
            )}
          >
            <FileUp size={20} className="text-[var(--color-text-tertiary)]" />
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Drop blood work files here or click to browse
            </p>
            <p className="text-[10px] text-[var(--color-text-tertiary)]">
              PDF, JPG, PNG — max 10MB each
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* File list */}
          {records.length > 0 && (
            <div className="space-y-2">
              {records.map((record) => {
                const flags = flaggedMarkers(record);
                return (
                  <div
                    key={record.id}
                    className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2.5"
                  >
                    {/* File icon */}
                    <div className="mt-0.5 shrink-0">
                      {record.fileType === 'pdf' ? (
                        <FileText size={16} className="text-red-500" />
                      ) : (
                        <Image size={16} className="text-blue-500" />
                      )}
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                          {record.fileName}
                        </p>
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">
                          {formatSize(record.fileSize)}
                        </span>
                      </div>

                      {/* Client assignment */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">Client:</span>
                        <select
                          value={record.clientId}
                          onChange={(e) => assignClient(record.id, e.target.value)}
                          className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[11px] text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
                        >
                          {clients.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Flagged markers */}
                      {flags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {flags.map((flag) => (
                            <Badge key={flag} variant="warning">{flag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeRecord(record.id)}
                      className="shrink-0 rounded-md p-1 text-[var(--color-text-tertiary)] hover:text-red-500 hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

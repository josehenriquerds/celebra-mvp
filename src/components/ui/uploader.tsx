'use client';

import * as React from 'react';
import { Upload, X, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  value?: File[];
  onChange?: (files: File[]) => void;
  className?: string;
}

export function Uploader({
  accept = 'image/*',
  multiple = false,
  maxSize = 5 * 1024 * 1024,
  value = [],
  onChange,
  className,
}: UploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      if (maxSize && file.size > maxSize) {
        return false;
      }
      return true;
    });

    if (multiple) {
      onChange?.([...value, ...validFiles]);
    } else {
      onChange?.(validFiles.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange?.(newFiles);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          Clique ou arraste arquivos aqui
        </p>
        <p className="text-xs text-muted-foreground">
          Máximo {Math.round(maxSize / 1024 / 1024)}MB por arquivo
        </p>
      </div>

      {/* File list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border"
            >
              <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-destructive/10 rounded transition-colors"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

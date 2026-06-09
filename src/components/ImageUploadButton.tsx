import { useRef, useState } from 'react';
import { adminUploadImage, type UploadFolder } from '../lib/api';
import { Button } from './Button';

interface ImageUploadButtonProps {
  folder: UploadFolder;
  onUploaded: (url: string) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export function ImageUploadButton({
  folder,
  onUploaded,
  disabled,
  label = '上传图片',
  size = 'sm',
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const { url } = await adminUploadImage(file, folder);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="secondary"
        size={size}
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? '上传中...' : label}
      </Button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

import { useRef, useState } from 'react';
import { adminUploadImage, adminUploadImages, type UploadFolder } from '../lib/api';
import { Button } from './Button';

interface ImageUploadButtonProps {
  folder: UploadFolder;
  onUploaded?: (url: string) => void;
  onBatchUploaded?: (urls: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export function ImageUploadButton({
  folder,
  onUploaded,
  onBatchUploaded,
  multiple = false,
  disabled,
  label = '上传图片',
  size = 'sm',
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    setError('');
    setSuccess('');
    setUploading(true);
    setProgress('');

    try {
      if (multiple) {
        const list = Array.from(files);
        setProgress(`上传中 ${list.length} 张...`);
        const { urls, failed } = await adminUploadImages(list, folder);
        onBatchUploaded?.(urls);
        if (failed > 0) {
          setSuccess(`成功上传 ${urls.length} 张${failed > 0 ? `，${failed} 张失败` : ''}`);
        } else {
          setSuccess(`成功上传 ${urls.length} 张`);
        }
      } else {
        const { url } = await adminUploadImage(files[0], folder);
        onUploaded?.(url);
        setSuccess('上传成功');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      setProgress('');
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
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
        {uploading ? progress || '上传中...' : label}
      </Button>
      <p className="mt-1 text-xs text-ink/40">
        {multiple
          ? '支持 JPG/PNG/WebP/GIF，单张最大 10MB，可多选。文件名按拍摄时间命名（如 20250609143025.jpg）'
          : '支持 JPG/PNG/WebP/GIF，单张最大 10MB。文件名按拍摄时间命名（如 20250609143025.jpg）'}
      </p>
      {success && <p className="mt-1 text-xs text-green-600">{success}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

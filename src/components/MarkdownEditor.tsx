'use client';

import { useState, useCallback, useRef, DragEvent, ClipboardEvent, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { ImageResizer } from './ImageResizer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type ImageAlign = 'left' | 'center' | 'right';

interface SelectedImage {
  src: string;
  alt: string;
  width?: number;
  align?: ImageAlign;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<{ url: string; type: 'image' | 'video' }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const data = await response.json();
    return { url: data.url, type: data.type };
  };

  const insertImageMarkdown = (imageUrl: string, fileName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const imageMarkdown = `![${fileName}](${imageUrl})`;
    const newText = text.substring(0, start) + imageMarkdown + text.substring(end);

    onChange(newText);

    // 커서를 이미지 마크다운 뒤로 이동
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + imageMarkdown.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertVideoMarkdown = (videoUrl: string, fileName: string = 'video') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const videoMarkdown = `\n<video width="100%" controls>\n  <source src="${videoUrl}" type="video/mp4">\n  브라우저가 비디오 태그를 지원하지 않습니다.\n</video>\n`;
    const newText = text.substring(0, start) + videoMarkdown + text.substring(end);

    onChange(newText);

    // 커서를 비디오 마크다운 뒤로 이동
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + videoMarkdown.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertYouTubeEmbed = (url: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // YouTube URL에서 video ID 추출
    let videoId = '';
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        videoId = match[1];
        break;
      }
    }

    if (!videoId) {
      alert('올바른 YouTube URL이 아닙니다.');
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const youtubeEmbed = `\n<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n`;
    const newText = text.substring(0, start) + youtubeEmbed + text.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + youtubeEmbed.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const mediaFiles = files.filter((file) =>
        file.type.startsWith('image/') || file.type.startsWith('video/')
      );

      for (const file of mediaFiles) {
        try {
          const { url, type } = await uploadFile(file);
          if (type === 'video') {
            insertVideoMarkdown(url, file.name);
          } else {
            insertImageMarkdown(url, file.name);
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          alert('파일 업로드에 실패했습니다.');
        }
      }
    },
    [onChange]
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const items = Array.from(e.clipboardData.items);
      const imageItems = items.filter((item) => item.type.startsWith('image/'));

      if (imageItems.length === 0) return;

      e.preventDefault();

      for (const item of imageItems) {
        const file = item.getAsFile();
        if (!file) continue;

        try {
          const { url } = await uploadFile(file);
          const fileName = `pasted-image-${Date.now()}.${file.type.split('/')[1]}`;
          insertImageMarkdown(url, fileName);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('이미지 업로드에 실패했습니다.');
        }
      }
    },
    [onChange]
  );

  const handleDragOver = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('비디오 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      const { url } = await uploadFile(file);
      insertVideoMarkdown(url, file.name);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('비디오 업로드에 실패했습니다.');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVideoModalSubmit = () => {
    if (!videoUrl.trim()) {
      alert('URL을 입력해주세요.');
      return;
    }

    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      insertYouTubeEmbed(videoUrl);
    } else {
      insertVideoMarkdown(videoUrl);
    }

    setVideoUrl('');
    setShowVideoModal(false);
  };

  // 프리뷰 영역의 이미지 클릭 이벤트 처리
  useEffect(() => {
    const previewElement = previewRef.current;
    if (!previewElement) return;

    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        const width = img.getAttribute('width') ? parseInt(img.getAttribute('width')!) : undefined;

        // style 속성에서 정렬 정보 추출
        const style = img.getAttribute('style') || '';
        let align: ImageAlign = 'left';
        if (style.includes('display: block') && style.includes('margin: 0 auto')) {
          align = 'center';
        } else if (style.includes('float: right')) {
          align = 'right';
        } else if (style.includes('float: left')) {
          align = 'left';
        }

        setSelectedImage({ src, alt, width, align });
      }
    };

    previewElement.addEventListener('click', handleImageClick);
    return () => {
      previewElement.removeEventListener('click', handleImageClick);
    };
  }, [showPreview]);

  // 이미지 크기 조절 후 마크다운 업데이트
  const handleImageResize = (newWidth: number, align: ImageAlign) => {
    if (!selectedImage) return;

    const { src, alt } = selectedImage;

    // 정렬에 따른 style 속성 생성
    const getAlignStyle = (align: ImageAlign): string => {
      switch (align) {
        case 'center':
          return 'display: block; margin: 0 auto;';
        case 'right':
          return 'float: right; margin-left: 1rem;';
        case 'left':
        default:
          return 'float: left; margin-right: 1rem;';
      }
    };

    const alignStyle = getAlignStyle(align);

    // 마크다운과 HTML 이미지 패턴 모두 찾기
    const markdownPattern = new RegExp(`!\\[${escapeRegex(alt)}\\]\\(${escapeRegex(src)}\\)`, 'g');
    const htmlPattern = new RegExp(`<img[^>]*src="${escapeRegex(src)}"[^>]*>`, 'g');

    let newValue = value;

    // 마크다운 형식을 HTML로 변환
    if (markdownPattern.test(value)) {
      newValue = value.replace(
        markdownPattern,
        `<img src="${src}" width="${newWidth}" alt="${alt}" style="${alignStyle}" />`
      );
    }
    // 이미 HTML 형식이면 width와 style 속성 업데이트
    else if (htmlPattern.test(value)) {
      newValue = value.replace(htmlPattern, (match) => {
        // 기존 width와 style 속성 제거 후 새 값 추가
        const withoutAttrs = match
          .replace(/\s*width="\d+"\s*/g, ' ')
          .replace(/\s*style="[^"]*"\s*/g, ' ');
        return withoutAttrs.replace('<img', `<img width="${newWidth}" style="${alignStyle}"`);
      });
    }

    onChange(newValue);
    setSelectedImage(null);
  };

  // 정규식 이스케이프 헬퍼 함수
  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  return (
    <>
      <div className="flex flex-col h-full gap-2">
        {/* 툴바 */}
        <div className="flex gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            📹 비디오 업로드
          </button>
          <button
            onClick={() => setShowVideoModal(true)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            🔗 YouTube/URL 삽입
          </button>
          <button
            onClick={() => setShowPreview((prev) => !prev)}
            aria-expanded={showPreview}
            className="ml-auto px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            {showPreview ? '미리보기 접기' : '미리보기 펴기'}
          </button>
        </div>

        <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4 flex-1`}>
          {/* 에디터 */}
          <div className="relative h-full">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onPaste={handlePaste}
              placeholder={placeholder || '마크다운으로 작성하세요...\n\n이미지/비디오를 드래그 앤 드롭하거나 붙여넣기 할 수 있습니다.\n프리뷰에서 이미지를 클릭하면 크기를 조절할 수 있습니다.'}
              className={`w-full h-full p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none dark:bg-gray-800 dark:text-white dark:border-gray-700 ${
                isDragging ? 'border-primary bg-neutral-100 dark:bg-gray-800' : 'border-gray-300'
              }`}
            />
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100/80 dark:bg-gray-800/80 rounded-lg pointer-events-none">
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">파일을 여기에 놓으세요</p>
              </div>
            )}
          </div>

          {/* 프리뷰 */}
          {showPreview && (
            <div
              ref={previewRef}
              className="h-full overflow-y-auto px-6 py-8 border rounded-lg bg-background dark:border-gray-700"
            >
              {/* 발행된 글 본문(/blog/[slug])과 같은 스타일과 폭으로 렌더링한다 */}
              <article className="prose-blog mx-auto max-w-[42rem] [&_img]:cursor-pointer [&_img]:hover:opacity-80 [&_img]:transition-opacity [&_video]:max-w-full">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                >
                  {value || '*프리뷰가 여기에 표시됩니다*'}
                </ReactMarkdown>
              </article>
            </div>
          )}
        </div>
      </div>

      {/* 숨겨진 파일 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoFileSelect}
        className="hidden"
      />

      {/* 비디오 URL 입력 모달 */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              비디오 URL 삽입
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              YouTube URL 또는 직접 비디오 파일 URL을 입력하세요.
            </p>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleVideoModalSubmit();
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setVideoUrl('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleVideoModalSubmit}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                삽입
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 크기 조절 모달 */}
      {selectedImage && (
        <ImageResizer
          src={selectedImage.src}
          alt={selectedImage.alt}
          initialWidth={selectedImage.width}
          initialAlign={selectedImage.align}
          onResize={handleImageResize}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}

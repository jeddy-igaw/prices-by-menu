import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ImageUpload({ onImageSelect, isLoading }) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert("이미지 파일만 업로드할 수 있습니다.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        onImageSelect(file);
    };

    const clearImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        onImageSelect(null);
    }

    return (
        <div className="upload-container">
            <div
                className={`drop-zone ${dragActive ? 'drag-active' : ''} ${preview ? 'has-preview' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden-input"
                    accept="image/*"
                    onChange={handleChange}
                    disabled={isLoading}
                />

                {preview ? (
                    <div className="preview-wrapper">
                        <img src={preview} alt="메뉴 미리보기" className="preview-image" />
                        {!isLoading && (
                            <button className="remove-btn" onClick={clearImage} title="이미지 제거">
                                <X size={20} />
                            </button>
                        )}
                        {isLoading && (
                            <div className="loading-overlay">
                                <Loader2 className="spinner" size={48} />
                                <p>메뉴판 분석 중...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <div className="icon-circle">
                            <Upload size={32} />
                        </div>
                        <h3>메뉴판 사진 업로드</h3>
                        <p>클릭하거나 이미지를 드래그하세요</p>
                    </div>
                )}
            </div>
        </div>
    );
}

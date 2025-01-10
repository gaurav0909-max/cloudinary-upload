"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, X, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/helper';


const CloudinaryUploader = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const validateFile = (file) => {
        if (!ALLOWED_FILE_TYPES[file.type]) {
            return 'File type not supported. Please upload an image, PDF, or Word document.';
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'File size exceeds 5MB limit.';
        }
        return null;
    };

    const createPreview = (file) => {
        if (file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
        } else {
            setPreview('');
        }
    };

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            const validationError = validateFile(selectedFile);
            if (validationError) {
                setError(validationError);
                return;
            }
            setFile(selectedFile);
            createPreview(selectedFile);
            setError('');
            setUploadedUrl('');
            setUploadProgress(0);
        }
    };

    const simulateProgress = () => {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 10;
            });
        }, 500);
        return interval;
    };

    const uploadToCloudinary = useCallback(async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setError('');
        const progressInterval = simulateProgress();

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            setUploadProgress(100);
            setUploadedUrl(data.secure_url);
            setFile(null);
            setPreview('');
        } catch (err) {
            setError(err.message || 'Failed to upload file');
        } finally {
            clearInterval(progressInterval);
            setUploading(false);
        }
    }, [file]);

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        const validationError = validateFile(droppedFile);
        if (validationError) {
            setError(validationError);
            return;
        }
        setFile(droppedFile);
        createPreview(droppedFile);
        setError('');
        setUploadedUrl('');
        setUploadProgress(0);
    };

    const clearFile = () => {
        setFile(null);
        setPreview('');
        setError('');
        setUploadProgress(0);
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-800 ">File Uploader</CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors relative"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => !file && document.getElementById('fileInput').click()}
                >
                    <input
                        type="file"
                        id="fileInput"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx"
                    />

                    {!file && (
                        <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                                Drag and drop a file here, or click to select
                            </p>
                        </>
                    )}

                    {file && (
                        <div className="relative">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-h-48 mx-auto rounded-lg"
                                />
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-gray-500">
                                    <FileIcon className="h-8 w-8" />
                                    <span>{file.name}</span>
                                </div>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {uploadProgress > 0 && (
                    <div className="mt-4">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-sm text-gray-500 mt-1">
                            Upload progress: {uploadProgress}%
                        </p>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {uploadedUrl && (
                    <Alert className=" p-4 flex justify-center items-center">
                        {/* <CheckCircle className="h-6 w-6" /> */}
                        <AlertDescription>
                            <p className="text-green-800 font-semibold text-balance ">
                                File uploaded successfully!
                            </p>
                            <a
                                href={uploadedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mt-1 text-green-700 hover:underline break-all  text-pretty"
                            >
                                {uploadedUrl}
                            </a>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={uploadToCloudinary}
                    disabled={!file || uploading}
                >
                    {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default CloudinaryUploader;
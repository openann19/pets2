'use client';
import React, { useState, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion } from 'framer-motion';
import { CameraIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
export const PhotoAnalyzer = () => {
    const [image, setImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
            analyzePhoto(file);
        };
        reader.readAsDataURL(file);
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
        },
        maxFiles: 1,
    });
    const analyzePhoto = async (file) => {
        setAnalyzing(true);
        setResult(null);
        try {
            // Simulate AI analysis
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Mock result
            setResult({
                breed: 'Golden Retriever',
                age: '2-3 years',
                temperament: ['Friendly', 'Energetic', 'Loyal'],
                healthScore: 95,
                confidence: 87,
                suggestions: [
                    'Great photo quality!',
                    'Well-lit and clear',
                    'Shows personality well',
                ],
            });
        }
        catch (error) {
            logger.error('Analysis failed:', { error });
        }
        finally {
            setAnalyzing(false);
        }
    };
    return (<div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <CameraIcon className="w-8 h-8 text-white"/>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            AI Photo Analysis
          </h2>
          <p className="text-gray-600">
            Upload a pet photo for instant AI-powered insights
          </p>
        </div>

        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${isDragActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}`}>
          <input {...getInputProps()}/>
          {image ? (<img src={image} alt="Uploaded pet" className="max-h-64 mx-auto rounded-lg"/>) : (<div>
              <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4"/>
              <p className="text-lg text-gray-600">
                {isDragActive
                ? 'Drop the photo here'
                : 'Drag & drop a photo, or click to select'}
              </p>
            </div>)}
        </div>

        {analyzing && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 text-purple-600">
              <SparklesIcon className="w-6 h-6 animate-spin"/>
              <span className="text-lg font-medium">Analyzing photo...</span>
            </div>
          </motion.div>)}

        {result && !analyzing && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleIcon className="w-6 h-6 text-green-500"/>
                <h3 className="text-xl font-bold text-gray-900">Analysis Complete</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {result.breed && (<div>
                    <p className="text-sm text-gray-600">Breed</p>
                    <p className="text-lg font-semibold text-gray-900">{result.breed}</p>
                  </div>)}
                {result.age && (<div>
                    <p className="text-sm text-gray-600">Estimated Age</p>
                    <p className="text-lg font-semibold text-gray-900">{result.age}</p>
                  </div>)}
                {result.healthScore && (<div>
                    <p className="text-sm text-gray-600">Health Score</p>
                    <p className="text-lg font-semibold text-green-600">{result.healthScore}/100</p>
                  </div>)}
                {result.confidence && (<div>
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-lg font-semibold text-purple-600">{result.confidence}%</p>
                  </div>)}
              </div>

              {result.temperament && result.temperament.length > 0 && (<div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Temperament</p>
                  <div className="flex flex-wrap gap-2">
                    {result.temperament.map((trait, index) => (<span key={index} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-purple-600">
                        {trait}
                      </span>))}
                  </div>
                </div>)}

              {result.suggestions && result.suggestions.length > 0 && (<div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Suggestions</p>
                  <ul className="space-y-1">
                    {result.suggestions.map((suggestion, index) => (<li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{suggestion}</span>
                      </li>))}
                  </ul>
                </div>)}
            </div>
          </motion.div>)}
      </div>
    </div>);
};
//# sourceMappingURL=PhotoAnalyzer.jsx.map
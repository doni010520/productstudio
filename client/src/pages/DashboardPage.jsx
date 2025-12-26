import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';
import { Upload, Sparkles, Download, Loader2, X } from 'lucide-react';
import { styles as stylesApi, generation as generationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

const DashboardPage = () => {
    const [styles, setStyles] = useState([]);
    const [groupedStyles, setGroupedStyles] = useState({});
    const [selectedStyle, setSelectedStyle] = useState(null);
    const [customPrompt, setCustomPrompt] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [generationId, setGenerationId] = useState(null);
    const { user, updateUser } = useAuth();

    useEffect(() => {
        loadStyles();
    }, []);

    const loadStyles = async () => {
        try {
            const response = await stylesApi.getAll();
            setStyles(response.data.styles);
            setGroupedStyles(response.data.grouped);
        } catch (error) {
            toast.error('Erro ao carregar estilos');
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            setUploadedFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setUploadedImage(reader.result);
            };
            reader.readAsDataURL(file);
            setGeneratedImage(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024 // 10MB
    });

    const handleGenerate = async () => {
        if (!uploadedFile) {
            toast.error('Por favor, faça upload de uma imagem');
            return;
        }

        if (!selectedStyle && !customPrompt) {
            toast.error('Selecione um estilo ou digite um prompt customizado');
            return;
        }

        if (user.credits < 1) {
            toast.error('Créditos insuficientes. Adicione mais créditos para continuar.');
            return;
        }

        setGenerating(true);
        setGeneratedImage(null);

        try {
            const formData = new FormData();
            formData.append('image', uploadedFile);
            if (selectedStyle) {
                formData.append('stylePreset', selectedStyle.slug);
            }
            if (customPrompt) {
                formData.append('customPrompt', customPrompt);
            }

            const response = await generationApi.create(formData);
            setGenerationId(response.data.generationId);

            // Poll for completion
            pollGenerationStatus(response.data.generationId);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro ao gerar imagem');
            setGenerating(false);
        }
    };

    const pollGenerationStatus = async (genId) => {
        const maxAttempts = 60; // 2 minutes max
        let attempts = 0;

        const interval = setInterval(async () => {
            attempts++;

            try {
                const response = await generationApi.getStatus(genId);
                const generation = response.data.generation;

                if (generation.status === 'completed') {
                    clearInterval(interval);
                    setGeneratedImage(generation.generated_image_url);
                    setGenerating(false);
                    updateUser({ credits: user.credits - 1 });
                    toast.success('Imagem gerada com sucesso!');
                } else if (generation.status === 'failed') {
                    clearInterval(interval);
                    setGenerating(false);
                    toast.error(generation.error_message || 'Falha ao gerar imagem');
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    setGenerating(false);
                    toast.error('Tempo limite excedido');
                }
            } catch (error) {
                clearInterval(interval);
                setGenerating(false);
                toast.error('Erro ao verificar status');
            }
        }, 2000); // Check every 2 seconds
    };

    const handleDownload = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = `productstudio-${Date.now()}.png`;
            link.click();
        }
    };

    const resetGeneration = () => {
        setUploadedImage(null);
        setUploadedFile(null);
        setGeneratedImage(null);
        setGenerationId(null);
        setSelectedStyle(null);
        setCustomPrompt('');
    };

    return (
        <div className="min-h-screen bg-dark-900 bg-animated-mesh pt-24 pb-12 px-6">
            <Toaster position="top-center" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-5xl font-bold mb-4">
                        Crie Backgrounds <span className="gradient-text">Incríveis</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Faça upload da sua imagem e escolha um estilo
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Upload & Result */}
                    <div className="space-y-6">
                        {/* Upload Area */}
                        {!uploadedImage ? (
                            <GlassCard>
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                                        isDragActive
                                            ? 'border-primary-500 bg-primary-500/10'
                                            : 'border-white/20 hover:border-primary-500/50'
                                    }`}
                                >
                                    <input {...getInputProps()} />
                                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg font-medium mb-2">
                                        {isDragActive
                                            ? 'Solte a imagem aqui'
                                            : 'Arraste uma imagem ou clique para selecionar'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        PNG, JPG ou WebP (máx. 10MB)
                                    </p>
                                </div>
                            </GlassCard>
                        ) : (
                            <GlassCard>
                                <div className="relative">
                                    <button
                                        onClick={resetGeneration}
                                        className="absolute top-2 right-2 glass p-2 rounded-lg hover:bg-red-500/20 z-10"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <img
                                        src={uploadedImage}
                                        alt="Uploaded"
                                        className="w-full rounded-xl"
                                    />
                                </div>
                            </GlassCard>
                        )}

                        {/* Generated Result */}
                        <AnimatePresence>
                            {(generating || generatedImage) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <GlassCard>
                                        <h3 className="text-xl font-bold mb-4 flex items-center">
                                            <Sparkles className="w-5 h-5 mr-2 text-primary-400" />
                                            Resultado
                                        </h3>
                                        {generating ? (
                                            <div className="aspect-square bg-dark-800/50 rounded-xl flex items-center justify-center">
                                                <div className="text-center">
                                                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                                                    <p className="text-gray-400">Gerando sua imagem...</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <img
                                                    src={generatedImage}
                                                    alt="Generated"
                                                    className="w-full rounded-xl mb-4"
                                                />
                                                <motion.button
                                                    onClick={handleDownload}
                                                    className="btn-primary w-full flex items-center justify-center"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <Download className="w-5 h-5 mr-2" />
                                                    Baixar Imagem
                                                </motion.button>
                                            </div>
                                        )}
                                    </GlassCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column - Styles & Prompt */}
                    <div className="space-y-6">
                        {/* Style Selection */}
                        <GlassCard>
                            <h3 className="text-xl font-bold mb-4">Escolha um Estilo</h3>
                            <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                {Object.entries(groupedStyles).map(([category, categoryStyles]) => (
                                    <div key={category}>
                                        <h4 className="text-sm font-semibold text-primary-400 mb-3">
                                            {category}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {categoryStyles.map((style) => (
                                                <motion.button
                                                    key={style.id}
                                                    onClick={() => setSelectedStyle(style)}
                                                    className={`glass p-4 rounded-xl text-left transition-all ${
                                                        selectedStyle?.id === style.id
                                                            ? 'bg-primary-500/20 border-primary-500 shadow-glow-blue'
                                                            : 'hover:bg-white/10'
                                                    }`}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <p className="font-medium text-sm">{style.name}</p>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Custom Prompt */}
                        <GlassCard>
                            <h3 className="text-xl font-bold mb-4">Ou use um Prompt Customizado</h3>
                            <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="Descreva o fundo que você deseja... (opcional)"
                                className="input-glass w-full min-h-[100px] resize-none"
                            />
                        </GlassCard>

                        {/* Generate Button */}
                        <motion.button
                            onClick={handleGenerate}
                            disabled={generating || !uploadedImage}
                            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={!generating && uploadedImage ? { scale: 1.02 } : {}}
                            whileTap={!generating && uploadedImage ? { scale: 0.98 } : {}}
                        >
                            {generating ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Gerando...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Gerar Background (1 crédito)
                                </span>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

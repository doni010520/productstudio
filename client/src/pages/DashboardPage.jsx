import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, LogOut, User, Zap, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import AspectRatioSelector from '../components/AspectRatioSelector';
import ImageCompare from '../components/ImageCompare';
import StylePresetCard from '../components/StylePresetCard';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // States
    const [uploadedImage, setUploadedImage] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [styles, setStyles] = useState([]);
    const [groupedStyles, setGroupedStyles] = useState({});
    const [selectedStyle, setSelectedStyle] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('free');
    const [mode, setMode] = useState('quick'); // 'quick' or 'custom'
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState('');
    const [credits, setCredits] = useState(user?.credits || 0);

    // Fetch styles on mount
    useEffect(() => {
        fetchStyles();
        fetchUserCredits();
    }, []);

    const fetchStyles = async () => {
        try {
            const response = await api.get('/styles');
            const stylesData = response.data.styles || [];
            const groupedData = response.data.grouped || {};
            
            setStyles(stylesData);
            setGroupedStyles(groupedData);
        } catch (err) {
            console.error('Error fetching styles:', err);
        }
    };

    const fetchUserCredits = async () => {
        try {
            const response = await api.get('/user/profile');
            setCredits(response.data.credits);
        } catch (err) {
            console.error('Error fetching credits:', err);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Imagem muito grande. Máximo 10MB.');
                return;
            }

            setUploadedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
                setUploadedImage(file);
                setError('');
                setGeneratedImage(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!uploadedFile) {
            setError('Por favor, faça upload de uma imagem');
            return;
        }

        if (!selectedStyle && !customPrompt) {
            setError('Selecione um estilo ou digite um prompt customizado');
            return;
        }

        if (credits < 1) {
            setError('Créditos insuficientes');
            return;
        }

        setIsGenerating(true);
        setError('');

        const formData = new FormData();
        formData.append('image', uploadedFile);
        if (selectedStyle) formData.append('stylePreset', selectedStyle);
        if (customPrompt) formData.append('customPrompt', customPrompt);
        formData.append('aspectRatio', aspectRatio);

        try {
            const response = await api.post('/generation/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const generationId = response.data.id;

            // Poll for completion
            const pollInterval = setInterval(async () => {
                try {
                    const statusResponse = await api.get(`/generation/status/${generationId}`);
                    const generation = statusResponse.data;

                    if (generation.status === 'completed') {
                        clearInterval(pollInterval);
                        setGeneratedImage(generation.generated_image_url);
                        setIsGenerating(false);
                        fetchUserCredits(); // Update credits
                    } else if (generation.status === 'failed') {
                        clearInterval(pollInterval);
                        setError(generation.error_message || 'Falha na geração');
                        setIsGenerating(false);
                    }
                } catch (err) {
                    clearInterval(pollInterval);
                    setError('Erro ao verificar status');
                    setIsGenerating(false);
                }
            }, 2000);

        } catch (err) {
            setIsGenerating(false);
            setError(err.response?.data?.message || 'Erro ao gerar imagem');
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        
        const link = document.createElement('a');
        link.href = `${import.meta.env.VITE_API_URL.replace('/api', '')}${generatedImage}`;
        link.download = `productstudio-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 text-transparent bg-clip-text">
                            ProductStudio
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="glass px-4 py-2 rounded-lg flex items-center space-x-2">
                            <Sparkles className="w-5 h-5 text-primary-400" />
                            <span className="font-bold text-lg">{credits}</span>
                            <span className="text-sm text-gray-400">créditos</span>
                        </div>
                        
                        <button className="glass p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <User className="w-5 h-5" />
                        </button>
                        
                        <button
                            onClick={handleLogout}
                            className="glass p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Upload & Preview */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Upload Area */}
                        <GlassCard>
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold flex items-center">
                                    <Upload className="w-5 h-5 mr-2" />
                                    Faça Upload
                                </h2>

                                <label className="block">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <div className="glass border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
                                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        <p className="text-sm text-gray-300">
                                            Clique para selecionar
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG ou WebP (máx. 10MB)
                                        </p>
                                    </div>
                                </label>

                                {previewUrl && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative rounded-xl overflow-hidden bg-white/5"
                                    >
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full rounded-xl object-contain max-h-96"
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </GlassCard>

                        {/* Result with Compare */}
                        {generatedImage && previewUrl && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <GlassCard>
                                    <h2 className="text-xl font-bold mb-4 flex items-center">
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Resultado
                                    </h2>
                                    <ImageCompare
                                        originalImage={previewUrl}
                                        generatedImage={`${import.meta.env.VITE_API_URL.replace('/api', '')}${generatedImage}`}
                                        onDownload={handleDownload}
                                    />
                                </GlassCard>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Configuration */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Mode Toggle */}
                        <GlassCard>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setMode('quick')}
                                    className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-all ${
                                        mode === 'quick'
                                            ? 'bg-primary-500 text-white'
                                            : 'glass hover:bg-white/10'
                                    }`}
                                >
                                    <Zap className="w-5 h-5 mr-2" />
                                    Modo Rápido
                                </button>
                                <button
                                    onClick={() => setMode('custom')}
                                    className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-all ${
                                        mode === 'custom'
                                            ? 'bg-primary-500 text-white'
                                            : 'glass hover:bg-white/10'
                                    }`}
                                >
                                    <Sliders className="w-5 h-5 mr-2" />
                                    Personalizar
                                </button>
                            </div>
                        </GlassCard>

                        {/* Aspect Ratio Selector */}
                        {mode === 'custom' && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <GlassCard>
                                    <AspectRatioSelector
                                        selected={aspectRatio}
                                        onSelect={setAspectRatio}
                                    />
                                </GlassCard>
                            </motion.div>
                        )}

                        {/* Style Selection */}
                        <GlassCard>
                            <h2 className="text-xl font-bold mb-4">Escolha o Estilo</h2>
                            
                            {Object.entries(groupedStyles).map(([category, categoryStyles]) => (
                                <div key={category} className="mb-6 last:mb-0">
                                    <h3 className="text-sm font-medium text-primary-400 mb-3">
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {categoryStyles.map((style) => (
                                            <StylePresetCard
                                                key={style.id}
                                                style={style}
                                                isSelected={selectedStyle === style.slug}
                                                onClick={() => setSelectedStyle(style.slug)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </GlassCard>

                        {/* Custom Prompt */}
                        {mode === 'custom' && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <GlassCard>
                                    <h2 className="text-xl font-bold mb-4">Ou use um Prompt Customizado</h2>
                                    <textarea
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        placeholder="Descreva o fundo que você deseja... (opcional)"
                                        className="input-field w-full h-24 resize-none"
                                    />
                                </GlassCard>
                            </motion.div>
                        )}

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="glass border border-red-500/50 bg-red-500/10 p-4 rounded-xl"
                                >
                                    <p className="text-red-400 text-sm">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Generate Button */}
                        <motion.button
                            onClick={handleGenerate}
                            disabled={isGenerating || !uploadedImage}
                            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isGenerating ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                                    Gerando... (pode levar 20-30s)
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 mr-2" />
                                    Gerar Background (1 crédito)
                                </div>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

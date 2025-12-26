import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Image, TrendingUp } from 'lucide-react';

const LandingPage = () => {
    const features = [
        {
            icon: <Image className="w-8 h-8" />,
            title: 'IA Avançada',
            description: 'Powered by DALL-E 3 para resultados fotorrealísticos'
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'Rápido e Fácil',
            description: 'Resultados profissionais em segundos'
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: '15 Estilos',
            description: 'Presets profissionais para todos os nichos'
        },
    ];

    return (
        <div className="min-h-screen bg-dark-900 bg-animated-mesh">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center glass px-4 py-2 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-primary-400 mr-2" />
                            <span className="text-sm text-gray-300">Powered by DALL-E 3</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                            Transforme suas fotos
                            <br />
                            <span className="gradient-text">em arte profissional</span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                            Crie backgrounds cinematográficos para seus produtos usando IA. 
                            Sem fotógrafos, sem estúdio, sem complicação.
                        </p>

                        <div className="flex items-center justify-center space-x-4">
                            <Link to="/register">
                                <motion.button
                                    className="btn-primary text-lg px-8 py-4"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Começar Agora
                                </motion.button>
                            </Link>
                            <Link to="/login">
                                <motion.button
                                    className="btn-secondary text-lg px-8 py-4"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Ver Demo
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Hero Image Placeholder */}
                    <motion.div
                        className="mt-20 glass p-8 rounded-3xl"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="aspect-video bg-gradient-to-br from-primary-900/20 to-blue-900/20 rounded-2xl flex items-center justify-center border border-white/10">
                            <div className="text-center">
                                <Sparkles className="w-20 h-20 text-primary-500 mx-auto mb-4 animate-pulse-slow" />
                                <p className="text-gray-400 text-lg">Preview de transformação</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold mb-4">
                            Por que escolher o <span className="gradient-text">ProductStudio</span>?
                        </h2>
                        <p className="text-gray-400 text-lg">
                            A maneira mais rápida de criar fotos profissionais
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="card-glow h-full">
                                    <div className="bg-gradient-to-br from-primary-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-gray-400">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 px-6">
                <motion.div
                    className="max-w-4xl mx-auto text-center glass p-12 rounded-3xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl font-bold mb-4">
                        Pronto para começar?
                    </h2>
                    <p className="text-gray-400 text-lg mb-8">
                        Ganhe 3 créditos gratuitos no trial de 7 dias
                    </p>
                    <Link to="/register">
                        <motion.button
                            className="btn-primary text-lg px-10 py-4"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Criar Conta Grátis
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;

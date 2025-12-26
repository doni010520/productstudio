import { motion } from 'framer-motion';

const AspectRatioSelector = ({ selected, onSelect }) => {
    const ratios = [
        { label: '1:1', value: '1:1', width: 40, height: 40, desc: 'Quadrado' },
        { label: '4:3', value: '4:3', width: 48, height: 36, desc: 'Padrão' },
        { label: '16:9', value: '16:9', width: 56, height: 32, desc: 'Widescreen' },
        { label: '9:16', value: '9:16', width: 28, height: 50, desc: 'Stories' },
        { label: 'Livre', value: 'free', width: 40, height: 40, desc: 'Original' }
    ];

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Proporção da Imagem</label>
            <div className="grid grid-cols-5 gap-2">
                {ratios.map((ratio) => (
                    <motion.button
                        key={ratio.value}
                        onClick={() => onSelect(ratio.value)}
                        className={`glass p-3 rounded-lg text-center transition-all ${
                            selected === ratio.value
                                ? 'bg-primary-500/20 border-primary-500 shadow-glow-blue'
                                : 'hover:bg-white/10'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="flex items-center justify-center mb-2 h-12">
                            <div
                                className="border-2 border-current"
                                style={{
                                    width: `${ratio.width}px`,
                                    height: `${ratio.height}px`,
                                }}
                            />
                        </div>
                        <div className="text-xs font-medium">{ratio.label}</div>
                        <div className="text-[10px] text-gray-400">{ratio.desc}</div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default AspectRatioSelector;

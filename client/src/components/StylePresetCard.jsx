import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const StylePresetCard = ({ style, isSelected, onClick }) => {
    // Placeholder image - você pode substituir por URLs reais depois
    const thumbnailUrl = style.thumbnail_url || `https://picsum.photos/seed/${style.slug}/400/300`;

    return (
        <motion.button
            onClick={onClick}
            className={`relative overflow-hidden rounded-xl transition-all ${
                isSelected
                    ? 'ring-2 ring-primary-500 shadow-glow-blue'
                    : 'hover:scale-105'
            }`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Thumbnail Image */}
            <div className="aspect-[4/3] relative">
                <img
                    src={thumbnailUrl}
                    alt={style.name}
                    className="w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                
                {/* Selected Indicator */}
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                        <Check className="w-5 h-5 text-white" />
                    </motion.div>
                )}
            </div>

            {/* Style Name */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-medium text-white text-sm text-left">
                    {style.name}
                </h3>
                <p className="text-xs text-gray-300 text-left mt-0.5">
                    {style.category}
                </p>
            </div>
        </motion.button>
    );
};

export default StylePresetCard;

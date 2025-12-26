import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = false, onClick, ...props }) => {
    const baseClass = "glass rounded-2xl p-6";
    const hoverClass = hover ? "glass-hover cursor-pointer" : "";
    
    return (
        <motion.div
            className={`${baseClass} ${hoverClass} ${className}`}
            onClick={onClick}
            whileHover={hover ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;

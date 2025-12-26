import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User, CreditCard } from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to={isAuthenticated ? '/dashboard' : '/'}>
                        <motion.div
                            className="flex items-center space-x-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="bg-gradient-to-br from-primary-500 to-blue-500 p-2 rounded-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold gradient-text">
                                ProductStudio
                            </span>
                        </motion.div>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Credits */}
                                <div className="glass px-4 py-2 rounded-lg flex items-center space-x-2">
                                    <CreditCard className="w-4 h-4 text-primary-400" />
                                    <span className="text-sm font-medium">
                                        {user?.credits || 0} créditos
                                    </span>
                                </div>

                                {/* User menu */}
                                <div className="flex items-center space-x-3">
                                    <Link to="/profile">
                                        <motion.button
                                            className="glass p-2 rounded-lg hover:bg-white/10"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <User className="w-5 h-5" />
                                        </motion.button>
                                    </Link>

                                    <motion.button
                                        onClick={handleLogout}
                                        className="glass px-4 py-2 rounded-lg hover:bg-red-500/10 hover:border-red-500/50 flex items-center space-x-2"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm">Sair</span>
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login">
                                    <motion.button
                                        className="btn-glass"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Entrar
                                    </motion.button>
                                </Link>
                                <Link to="/register">
                                    <motion.button
                                        className="btn-primary"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Começar Agora
                                    </motion.button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

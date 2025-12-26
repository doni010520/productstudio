-- ProductStudio Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    credits INTEGER DEFAULT 0,
    trial_used BOOLEAN DEFAULT FALSE,
    trial_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generations table (history of all generated images)
CREATE TABLE IF NOT EXISTS generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_image_url TEXT NOT NULL,
    generated_image_url TEXT NOT NULL,
    style_preset VARCHAR(100),
    custom_prompt TEXT,
    cost_credits INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- positive for additions, negative for usage
    transaction_type VARCHAR(50) NOT NULL, -- purchase, trial, generation, refund
    description TEXT,
    generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Style presets table (for the 15 predefined styles)
CREATE TABLE IF NOT EXISTS style_presets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    prompt_template TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_style_presets_slug ON style_presets(slug);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert the 15 predefined styles
INSERT INTO style_presets (name, slug, category, prompt_template, display_order) VALUES
('Fundo Branco Puro', 'white-clean', 'E-commerce Geral', 'Clean white background, professional product photography, soft shadows, studio lighting, high quality, commercial photography', 1),
('Luxo Premium', 'luxury-premium', 'E-commerce Geral', 'Elegant dark background with gold accents, dramatic lighting, luxury setting, high-end product photography, premium atmosphere', 2),
('Minimalista Moderno', 'minimalist-modern', 'E-commerce Geral', 'Minimalist beige background, natural shadows, soft daylight, contemporary aesthetic, clean and modern', 3),
('Mesa Rústica', 'rustic-table', 'Alimentos & Bebidas', 'Rustic wooden table, natural ingredients around, warm lighting, food photography style, appetizing atmosphere, culinary setting', 4),
('Cozinha Profissional', 'professional-kitchen', 'Alimentos & Bebidas', 'Professional kitchen background, stainless steel surfaces, chef atmosphere, dramatic lighting, culinary setting, restaurant quality', 5),
('Outdoor Natural', 'outdoor-natural', 'Alimentos & Bebidas', 'Outdoor picnic setting, natural sunlight, grass and nature elements, fresh and organic vibe, outdoor dining', 6),
('Spa Zen', 'spa-zen', 'Cosméticos & Beleza', 'Spa background with soft towels, stones, plants, calming atmosphere, natural light, wellness aesthetic, relaxation', 7),
('Glamour Dourado', 'golden-glamour', 'Cosméticos & Beleza', 'Glamorous gold and marble background, luxury cosmetics setting, elegant lighting, high-fashion style, sophisticated', 8),
('Natureza Botânica', 'botanical-nature', 'Cosméticos & Beleza', 'Botanical background with green leaves, flowers, natural organic setting, fresh and clean, eco-friendly atmosphere', 9),
('Urbano Moderno', 'urban-modern', 'Moda & Acessórios', 'Modern urban background, concrete walls, industrial chic, fashion photography style, dramatic shadows, street style', 10),
('Boutique Elegante', 'elegant-boutique', 'Moda & Acessórios', 'Elegant boutique interior, soft velvet textures, warm lighting, luxury retail atmosphere, high-end fashion', 11),
('Tech Futurista', 'tech-futuristic', 'Tecnologia & Eletrônicos', 'Futuristic tech background, blue neon lights, modern workspace, sleek and professional, cutting-edge technology', 12),
('Escritório Corporativo', 'corporate-office', 'Tecnologia & Eletrônicos', 'Modern office desk, professional workspace, clean and organized, business atmosphere, corporate setting', 13),
('Reflexo Espelhado', 'mirror-reflection', 'Joias & Luxo', 'Mirror reflection background, dramatic lighting, jewelry display style, elegant and sophisticated, luxury presentation', 14),
('Veludo Negro', 'black-velvet', 'Joias & Luxo', 'Black velvet background, dramatic spotlight, luxury jewelry photography, high contrast, premium quality', 15);

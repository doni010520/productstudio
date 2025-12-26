import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AIService {
    constructor() {
        this.openaiApiKey = process.env.OPENAI_API_KEY;
        this.clipdropApiKey = process.env.CLIPDROP_API_KEY;
        this.uploadsDir = path.join(__dirname, '../../uploads');
    }

    /**
     * Remove background from image using Clipdrop API
     */
    async removeBackground(imagePath) {
        try {
            const formData = new FormData();
            formData.append('image_file', fs.createReadStream(imagePath));

            const response = await axios.post(
                'https://clipdrop-api.co/remove-background/v1',
                formData,
                {
                    headers: {
                        'x-api-key': this.clipdropApiKey,
                        ...formData.getHeaders()
                    },
                    responseType: 'arraybuffer'
                }
            );

            // Save the image without background
            const outputFilename = `nobg-${uuidv4()}.png`;
            const outputPath = path.join(this.uploadsDir, outputFilename);
            
            await fs.promises.writeFile(outputPath, response.data);

            return {
                path: outputPath,
                url: `/uploads/${outputFilename}`
            };
        } catch (error) {
            console.error('Clipdrop API error:', error.response?.data || error.message);
            throw new Error('Failed to remove background from image');
        }
    }

    /**
     * Generate new background with DALL-E 3
     */
    async generateBackground(prompt, size = '1024x1024') {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/images/generations',
                {
                    model: 'dall-e-3',
                    prompt: `Professional product photography background: ${prompt}. High quality, commercial photography, studio lighting, professional grade.`,
                    n: 1,
                    size: size,
                    quality: 'hd',
                    style: 'natural'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.openaiApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const imageUrl = response.data.data[0].url;
            
            // Download the generated image
            const imageResponse = await axios.get(imageUrl, {
                responseType: 'arraybuffer'
            });

            const filename = `bg-${uuidv4()}.png`;
            const filepath = path.join(this.uploadsDir, filename);
            
            await fs.promises.writeFile(filepath, imageResponse.data);

            return {
                path: filepath,
                url: `/uploads/${filename}`
            };
        } catch (error) {
            console.error('DALL-E 3 API error:', error.response?.data || error.message);
            throw new Error('Failed to generate background with DALL-E 3');
        }
    }

    /**
     * Composite product image with new background
     */
    async compositeImages(productPath, backgroundPath) {
        try {
            const outputFilename = `final-${uuidv4()}.png`;
            const outputPath = path.join(this.uploadsDir, outputFilename);

            // Get product image metadata
            const productMetadata = await sharp(productPath).metadata();

            // Resize background to match product dimensions if needed
            const background = await sharp(backgroundPath)
                .resize(productMetadata.width, productMetadata.height, {
                    fit: 'cover',
                    position: 'center'
                })
                .toBuffer();

            // Composite product on top of background
            await sharp(background)
                .composite([{
                    input: productPath,
                    blend: 'over'
                }])
                .png({ quality: 100 })
                .toFile(outputPath);

            return {
                path: outputPath,
                url: `/uploads/${outputFilename}`
            };
        } catch (error) {
            console.error('Image composition error:', error);
            throw new Error('Failed to composite images');
        }
    }

    /**
     * Complete workflow: remove bg, generate new bg, composite
     */
    async processProductImage(originalImagePath, prompt) {
        try {
            console.log('Step 1: Removing background...');
            const productNoBg = await this.removeBackground(originalImagePath);

            console.log('Step 2: Generating new background...');
            const newBackground = await this.generateBackground(prompt);

            console.log('Step 3: Compositing images...');
            const finalImage = await this.compositeImages(productNoBg.path, newBackground.path);

            // Cleanup temporary files
            await this.cleanupFile(productNoBg.path);
            await this.cleanupFile(newBackground.path);

            return {
                originalUrl: `/uploads/${path.basename(originalImagePath)}`,
                finalUrl: finalImage.url
            };
        } catch (error) {
            console.error('Process product image error:', error);
            throw error;
        }
    }

    /**
     * Delete temporary file
     */
    async cleanupFile(filePath) {
        try {
            await fs.promises.unlink(filePath);
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    /**
     * Estimate cost for generation (in credits)
     */
    estimateCost() {
        // Clipdrop: ~$0.002-0.01 per image
        // DALL-E 3 HD: ~$0.08 per image
        // Total: ~$0.09 per generation
        // Charge user 1 credit = can adjust pricing as needed
        return 1;
    }
}

export default new AIService();

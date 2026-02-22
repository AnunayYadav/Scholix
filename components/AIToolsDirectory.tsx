import React, { useState } from 'react';
import { AITool } from '../types.ts';

const AIToolsDirectory: React.FC = () => {
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const tools: AITool[] = [
        // AI Chat & Assistants
        { id: '1', name: 'ChatGPT', description: 'The gold standard for conversational AI and complex problem solving.', url: 'https://chat.openai.com', category: 'General', pricing: 'Freemium', tags: ['OpenAI', 'Chat'] },
        { id: '2', name: 'Gemini AI', description: 'Googles powerful multimodal AI integrated with the Google ecosystem.', url: 'https://gemini.google.com', category: 'General', pricing: 'Freemium', tags: ['Google', 'Search'] },
        { id: '3', name: 'Claude AI', description: 'Advanced AI known for high-quality writing and safe reasoning.', url: 'https://claude.ai', category: 'Writing', pricing: 'Freemium', tags: ['Anthropic', 'Writing'] },
        { id: '4', name: 'Grok', description: 'X (Twitter)s real-time AI with access to live social data.', url: 'https://x.ai', category: 'General', pricing: 'Paid', tags: ['X', 'Real-time'] },
        { id: '5', name: 'Qwen', description: 'Alibabas massive language model with strong multilingual capabilities.', url: 'https://chat.qwen.ai', category: 'General', pricing: 'Free', tags: ['Alibaba', 'Global'] },
        { id: '6', name: 'DeepSeek', description: 'Hyper-efficient coding and reasoning model from China.', url: 'https://chat.deepseek.com', category: 'Coding', pricing: 'Free', tags: ['Efficiency', 'Reasoning'] },
        { id: '7', name: 'Microsoft Copilot', description: 'Your everyday AI companion integrated into Windows and Office.', url: 'https://copilot.microsoft.com', category: 'Productivity', pricing: 'Freemium', tags: ['Microsoft', 'Work'] },
        { id: '8', name: 'Kimi AI', description: 'Specialized in processing extremely long documents and large files.', url: 'https://kimi.moonshot.cn', category: 'Research', pricing: 'Free', tags: ['Long Context', 'PDF'] },
        { id: '9', name: 'Anychat', description: 'Universal interface to access multiple AI models in one place.', url: 'https://anychat.one', category: 'General', pricing: 'Freemium', tags: ['Multi-model', 'UI'] },
        { id: '10', name: 'Replit Agent', description: 'Autonomous agent that builds and deploys software from natural language.', url: 'https://replit.com/ai', category: 'Coding', pricing: 'Paid', tags: ['Autonomous', 'Deploy'] },

        // Productivity & Office
        { id: '11', name: 'Gamma AI', description: 'Create stunning presentations and docs in seconds with a prompt.', url: 'https://gamma.app', category: 'Presentations', pricing: 'Freemium', tags: ['PPT', 'Design'] },
        { id: '12', name: 'Beautiful.ai', description: 'Presentation software that applies design rules in real-time.', url: 'https://beautiful.ai', category: 'Presentations', pricing: 'Freemium', tags: ['Slides', 'Smart Design'] },
        { id: '13', name: 'Notion AI', description: 'AI assistant integrated directly into your Notion workspace.', url: 'https://www.notion.so/product/ai', category: 'Productivity', pricing: 'Paid', tags: ['Notes', 'Workflow'] },
        { id: '14', name: 'Zapier AI', description: 'Automate workflows across 5,000+ apps using natural language.', url: 'https://zapier.com/ai', category: 'Productivity', pricing: 'Freemium', tags: ['Automation', 'Logic'] },
        { id: '15', name: 'AskYourPDF', description: 'Chat with any PDF document to get summaries and answers instantly.', url: 'https://askyourpdf.com', category: 'Research', pricing: 'Freemium', tags: ['PDF', 'Chat'] },
        { id: '16', name: 'DeepL', description: 'The worlds most accurate and nuanced instant translator.', url: 'https://www.deepl.com', category: 'Productivity', pricing: 'Freemium', tags: ['Translation', 'Nuance'] },
        { id: '17', name: 'Perplexity', description: 'AI search engine that provides real-time citations and reliable sources.', url: 'https://www.perplexity.ai', category: 'Research', pricing: 'Freemium', tags: ['Search', 'Study'] },
        { id: '18', name: 'Scribe', description: 'Auto-generates step-by-step guides by observing your workflow.', url: 'https://scribehow.com', category: 'Productivity', pricing: 'Freemium', tags: ['Tutorials', 'Documentation'] },
        { id: '19', name: 'Arc Search', description: 'The browser that browses for you, summarizing the web.', url: 'https://arc.net', category: 'Productivity', pricing: 'Free', tags: ['Browser', 'Summary'] },

        // Video Tools
        { id: '20', name: 'HeyGen', description: 'Create AI avatars and professional video content from text.', url: 'https://www.heygen.com', category: 'Video', pricing: 'Freemium', tags: ['Avatar', 'Marketing'] },
        { id: '21', name: 'Runway', description: 'Next-gen video generation tools for professional VFX and film.', url: 'https://runwayml.com', category: 'Video', pricing: 'Freemium', tags: ['Gen-2', 'VFX'] },
        { id: '22', name: 'Lumiere', description: 'Googles space-time diffusion model for realistic video generation.', url: 'https://deepmind.google/discover/blog/lumiere-a-space-time-diffusion-model-for-video-generation/', category: 'Video', pricing: 'Free', tags: ['Google', 'Research'] },
        { id: '23', name: 'CapCut AI', description: 'Powerful trending video editor with integrated AI features.', url: 'https://www.capcut.com', category: 'Video', pricing: 'Freemium', tags: ['Edit', 'TikTok'] },
        { id: '24', name: 'Seaweed.video', description: 'High-fidelity cinematic video generation from text prompts.', url: 'https://seaweed.video', category: 'Video', pricing: 'Freemium', tags: ['Cinematic', 'Gen'] },

        // Image & Art
        { id: '25', name: 'Midjourney', description: 'Museum-quality digital art and hyper-realistic image generation.', url: 'https://www.midjourney.com', category: 'Design', pricing: 'Paid', tags: ['Art', 'Ultra-real'] },
        { id: '26', name: 'Adobe Firefly', description: 'Generative AI designed for creators, integrated with Photoshop.', url: 'https://firefly.adobe.com', category: 'Design', pricing: 'Freemium', tags: ['Adobe', 'Creative'] },
        { id: '27', name: 'Leonardo.ai', description: 'Creative platform for generating high-quality assets and art.', url: 'https://leonardo.ai', category: 'Design', pricing: 'Freemium', tags: ['Assets', 'Prompt'] },
        { id: '28', name: 'FaceSwapper', description: 'Seamless AI face swapping for creative photos and videos.', url: 'https://faceswapper.ai', category: 'Design', pricing: 'Freemium', tags: ['Photo', 'Swap'] },
        { id: '29', name: 'LogoCreator AI', description: 'Custom professional logos generated instantly with AI.', url: 'https://logocreator.ai', category: 'Design', pricing: 'Paid', tags: ['Branding', 'Logos'] },

        // Audio & Music
        { id: '30', name: 'ElevenLabs', description: 'The most realistic AI speech and voice synthesis in any language.', url: 'https://elevenlabs.io', category: 'Audio', pricing: 'Freemium', tags: ['Voice', 'TTS'] },
        { id: '31', name: 'MusicGen', description: 'Generate original music from text prompts by Meta AI.', url: 'https://huggingface.co/spaces/facebook/MusicGen', category: 'Audio', pricing: 'Free', tags: ['Meta', 'Music'] },
        { id: '32', name: 'Otter.ai', description: 'AI-powered meeting notes and real-time transcription.', url: 'https://otter.ai', category: 'Audio', pricing: 'Freemium', tags: ['Transcription', 'Study'] },
        { id: '33', name: 'Voicemod', description: 'Real-time AI voice changer and soundboard for gamers.', url: 'https://www.voicemod.net', category: 'Audio', pricing: 'Freemium', tags: ['Voice', 'Gaming'] },
        { id: '34', name: 'SoundMagic AI', description: 'Suite of AI tools for audio cleaning and enhancement.', url: 'https://soundmagic.ai', category: 'Audio', pricing: 'Freemium', tags: ['Clean', 'Engine'] },

        // Business & Marketing
        { id: '35', name: 'AdCreative.ai', description: 'Generate conversion-focused ad creatives and social posts.', url: 'https://www.adcreative.ai', category: 'Business', pricing: 'Freemium', tags: ['Ads', 'Conversion'] },
        { id: '36', name: 'Surfer SEO', description: 'AI-driven SEO content orchestration and keyword research.', url: 'https://surferseo.com', category: 'Business', pricing: 'Paid', tags: ['SEO', 'Growth'] },
        { id: '37', name: 'Shopify Magic', description: 'AI-powered commerce tools built directly into Shopify.', url: 'https://www.shopify.com/magic', category: 'Business', pricing: 'Paid', tags: ['Shopify', 'Sales'] },
        { id: '38', name: 'Apollo AI', description: 'Find leads and close deals with massive B2B database and AI.', url: 'https://apollo.io', category: 'Business', pricing: 'Freemium', tags: ['Leads', 'Sales'] },
        { id: '39', name: 'MarketMuse', description: 'AI content strategy platform for better search rankings.', url: 'https://www.marketmuse.com', category: 'Business', pricing: 'Paid', tags: ['Strategy', 'AI'] },

        // Code / Developer
        { id: '40', name: 'GitHub Copilot', description: 'The worlds most popular AI pair programmer in your IDE.', url: 'https://github.com/features/copilot', category: 'Coding', pricing: 'Paid', tags: ['Autofill', 'Algorithms'] },
        { id: '41', name: 'Cursor', description: 'The AI code editor built to understand your entire codebase.', url: 'https://cursor.sh', category: 'Coding', pricing: 'Freemium', tags: ['Forge', 'IDE'] },
        { id: '42', name: 'Lovable', description: 'Automate build and deployment of full-stack applications.', url: 'https://lovable.dev', category: 'Coding', pricing: 'Freemium', tags: ['Apps', 'No-code'] },
        { id: '43', name: 'Codeium', description: 'Fast, free AI code completion extension for all major IDEs.', url: 'https://codeium.com', category: 'Coding', pricing: 'Free', tags: ['Extension', 'Autocomplete'] },
        { id: '44', name: 'Bolt.new', description: 'Browser-based fullstack web development via prompting.', url: 'https://bolt.new', category: 'Coding', pricing: 'Freemium', tags: ['Vite', 'Fullstack'] },
        { id: '45', name: 'Pieces AI', description: 'Manage and search your developer snippets with AI context.', url: 'https://pieces.app', category: 'Coding', pricing: 'Freemium', tags: ['Snippets', 'Context'] }
    ];

    const categories = ['All', 'General', 'Writing', 'Coding', 'Research', 'Design', 'Productivity', 'Presentations', 'Video', 'Audio', 'Business'];

    const filteredTools = tools.filter(tool => {
        const matchesFilter = filter === 'All' || tool.category === filter;
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                        AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Forge</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Curated intelligence for the modern student.</p>
                </div>

                <div className="relative w-full md:w-64 mt-4 md:mt-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 font-bold"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <input
                        type="text"
                        placeholder="Search AI tools..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-orange-500/10 transition-all dark:text-white"
                    />
                </div>
            </header>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap border-none cursor-pointer ${filter === cat ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 hover:bg-orange-500/10'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map(tool => (
                    <div key={tool.id} className="group p-5 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl rounded-[28px] border border-slate-200 dark:border-white/10 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-600/5 transition-all duration-500 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 2a10 10 0 1 0 10 10H12V2Z" /><path d="M12 12l7-7" /></svg>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-lg ${tool.pricing === 'Free' ? 'text-emerald-500' : tool.pricing === 'Freemium' ? 'text-orange-500' : 'text-blue-500'}`}>{tool.pricing}</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1">{tool.name}</h4>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{tool.description}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {tool.tags.map(tag => (
                                    <span key={tag} className="text-[7px] font-black uppercase tracking-widest text-orange-600/60 dark:text-orange-400/40 bg-orange-500/5 px-2 py-0.5 rounded">#{tag}</span>
                                ))}
                            </div>
                        </div>

                        <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white dark:hover:text-white transition-all no-underline"
                        >
                            Visit Tool
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-2.5 h-2.5"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AIToolsDirectory;

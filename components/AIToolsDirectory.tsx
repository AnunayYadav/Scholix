import React, { useState } from 'react';
import { AITool } from '../types.ts';

const AIToolsDirectory: React.FC = () => {
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const tools: AITool[] = [
        // AI Chat & Assistants (General)
        { id: '1', name: 'ChatGPT', description: 'The gold standard for conversational AI and complex problem solving.', url: 'https://chat.openai.com', category: 'General', pricing: 'Freemium', tags: ['OpenAI', 'Chat'] },
        { id: '2', name: 'Gemini AI', description: 'Google\'s powerful multimodal AI integrated with the Google ecosystem.', url: 'https://gemini.google.com', category: 'General', pricing: 'Freemium', tags: ['Google', 'Search'] },
        { id: '3', name: 'Claude AI', description: 'Advanced AI known for high-quality writing and safe reasoning.', url: 'https://claude.ai', category: 'General', pricing: 'Freemium', tags: ['Anthropic', 'Writing'] },
        { id: '4', name: 'Grok', description: 'X (Twitter)\'s real-time AI with access to live social data.', url: 'https://x.ai', category: 'General', pricing: 'Paid', tags: ['X', 'Real-time'] },
        { id: '5', name: 'Le Chat Mistral', description: 'The premier European AI model known for efficiency and open weights.', url: 'https://chat.mistral.ai', category: 'General', pricing: 'Free', tags: ['Europe', 'Open'] },
        { id: 'anychat', name: 'Anychat', description: 'Universal interface to access multiple AI models in one place.', url: 'https://anychat.one', category: 'General', pricing: 'Freemium', tags: ['Multi-model', 'UI'] },
        { id: 'pi', name: 'Pi AI', description: 'A personal AI designed to be supportive, smart, and available anytime.', url: 'https://pi.ai', category: 'General', pricing: 'Free', tags: ['Personal', 'Voice'] },

        // Coding
        { id: '6', name: 'DeepSeek', description: 'Hyper-efficient coding and reasoning model from China.', url: 'https://chat.deepseek.com', category: 'Coding', pricing: 'Free', tags: ['Efficiency', 'Reasoning'] },
        { id: '10', name: 'Replit Agent', description: 'Autonomous agent that builds and deploys software from natural language.', url: 'https://replit.com/ai', category: 'Coding', pricing: 'Paid', tags: ['Autonomous', 'Deploy'] },
        { id: '40', name: 'GitHub Copilot', description: 'The world\'s most popular AI pair programmer in your IDE.', url: 'https://github.com/features/copilot', category: 'Coding', pricing: 'Paid', tags: ['Autofill', 'Algorithms'] },
        { id: '41', name: 'Cursor', description: 'The AI code editor built to understand your entire codebase.', url: 'https://cursor.sh', category: 'Coding', pricing: 'Freemium', tags: ['Forge', 'IDE'] },
        { id: 'phind', name: 'Phind', description: 'The AI search engine optimized specifically for developers and coding.', url: 'https://phind.com', category: 'Coding', pricing: 'Free', tags: ['Search', 'Docs'] },
        { id: 'tabnine', name: 'Tabnine', description: 'Private and secure AI code completion for various programming languages.', url: 'https://tabnine.com', category: 'Coding', pricing: 'Freemium', tags: ['Private', 'Safety'] },
        { id: 'codium', name: 'CodiumAI', description: 'AI that helps developers write tests and understand code logic.', url: 'https://codium.ai', category: 'Coding', pricing: 'Free', tags: ['Testing', 'Logic'] },
        { id: 'blackbox', name: 'Blackbox AI', description: 'Ultra-fast code generation and code search for VS Code.', url: 'https://useblackbox.io', category: 'Coding', pricing: 'Freemium', tags: ['Speed', 'Search'] },
        { id: 'warp', name: 'Warp', description: 'The modern terminal with built-in AI for command generation.', url: 'https://warp.dev', category: 'Coding', pricing: 'Free', tags: ['Terminal', 'CLI'] },

        // Writing & Content
        { id: 'jasper', name: 'Jasper', description: 'Professional AI platform for high-performance marketing copy.', url: 'https://jasper.ai', category: 'Writing', pricing: 'Paid', tags: ['Marketing', 'Ads'] },
        { id: 'copyai', name: 'Copy.ai', description: 'Scale your content marketing with AI-driven workflows.', url: 'https://copy.ai', category: 'Writing', pricing: 'Freemium', tags: ['SEO', 'Blogs'] },
        { id: 'quillbot', name: 'QuillBot', description: 'The ultimate paraphrasing and grammar correction tool.', url: 'https://quillbot.com', category: 'Writing', pricing: 'Freemium', tags: ['Edit', 'Rewrite'] },
        { id: 'wordtune', name: 'Wordtune', description: 'AI writing assistant that helps you rephrase thoughts clearly.', url: 'https://wordtune.com', category: 'Writing', pricing: 'Freemium', tags: ['Clarity', 'Tone'] },
        { id: 'sudowrite', name: 'Sudowrite', description: 'The specialized AI playground for fiction and creative writers.', url: 'https://sudowrite.com', category: 'Writing', pricing: 'Freemium', tags: ['Stories', 'Creative'] },
        { id: 'hemingway', name: 'Hemingway Editor', description: 'AI-assisted editor that makes your writing bold and clear.', url: 'https://hemingwayapp.com', category: 'Writing', pricing: 'Free', tags: ['Clarity', 'Verto'] },

        // Research & Learning
        { id: '17', name: 'Perplexity', description: 'AI search engine that provides real-time citations and reliable sources.', url: 'https://www.perplexity.ai', category: 'Research', pricing: 'Freemium', tags: ['Search', 'Study'] },
        { id: 'notebooklm', name: 'NotebookLM', description: 'Google\'s AI research tool that understands your uploaded notes.', url: 'https://notebooklm.google', category: 'Research', pricing: 'Free', tags: ['Google', 'Notes'] },
        { id: 'elicit', name: 'Elicit', description: 'Automate your research workflow by finding data in 200m papers.', url: 'https://elicit.org', category: 'Research', pricing: 'Freemium', tags: ['Science', 'Data'] },
        { id: 'consensus', name: 'Consensus', description: 'Search engine that finds answers in peer-reviewed research.', url: 'https://consensus.app', category: 'Research', pricing: 'Freemium', tags: ['Evidence', 'Reliable'] },
        { id: 'scite', name: 'Scite.ai', description: 'Verify scientific claims using smart citations and AI analysis.', url: 'https://scite.ai', category: 'Research', pricing: 'Paid', tags: ['Citations', 'Trust'] },
        { id: '8', name: 'Kimi AI', description: 'Specialized in processing extremely long documents and large files.', url: 'https://kimi.moonshot.cn', category: 'Research', pricing: 'Free', tags: ['Long Context', 'PDF'] },
        { id: '15', name: 'AskYourPDF', description: 'Chat with any PDF document to get summaries and answers instantly.', url: 'https://askyourpdf.com', category: 'Research', pricing: 'Freemium', tags: ['PDF', 'Chat'] },

        // Design & Image
        { id: '25', name: 'Midjourney', description: 'Museum-quality digital art and hyper-realistic image generation.', url: 'https://www.midjourney.com', category: 'Design', pricing: 'Paid', tags: ['Art', 'Ultra-real'] },
        { id: '26', name: 'Adobe Firefly', description: 'Generative AI designed for creators, integrated with Photoshop.', url: 'https://firefly.adobe.com', category: 'Design', pricing: 'Freemium', tags: ['Adobe', 'Creative'] },
        { id: 'canva', name: 'Canva Magic Studio', description: 'All-in-one AI design suite for social media and branding.', url: 'https://canva.com', category: 'Design', pricing: 'Freemium', tags: ['Speed', 'Social'] },
        { id: 'framer', name: 'Framer AI', description: 'Design and deploy a professional website with a single prompt.', url: 'https://framer.com', category: 'Design', pricing: 'Freemium', tags: ['Web', 'Layout'] },
        { id: 'uizard', name: 'Uizard', description: 'Generate UI designs from text and sketches effortlessly.', url: 'https://uizard.io', category: 'Design', pricing: 'Freemium', tags: ['UI/UX', 'Prototypes'] },
        { id: 'removal', name: 'Removal.ai', description: 'High-precision AI background removal for photos.', url: 'https://removal.ai', category: 'Design', pricing: 'Free', tags: ['Cleanup', 'Photo'] },
        { id: 'looka', name: 'Looka', description: 'AI platform to design logos and build your entire brand.', url: 'https://looka.com', category: 'Design', pricing: 'Paid', tags: ['Logo', 'Branding'] },

        // Productivity
        { id: '7', name: 'Microsoft Copilot', description: 'Your everyday AI companion integrated into Windows and Office.', url: 'https://copilot.microsoft.com', category: 'Productivity', pricing: 'Freemium', tags: ['Microsoft', 'Work'] },
        { id: '13', name: 'Notion AI', description: 'AI assistant integrated directly into your Notion workspace.', url: 'https://www.notion.so/product/ai', category: 'Productivity', pricing: 'Paid', tags: ['Notes', 'Workflow'] },
        { id: 'otter', name: 'Otter.ai', description: 'AI-powered meeting notes and real-time transcription.', url: 'https://otter.ai', category: 'Productivity', pricing: 'Freemium', tags: ['Meeting', 'Audio'] },
        { id: 'taskade', name: 'Taskade', description: 'AI productivity workspace for mapping out complex projects.', url: 'https://taskade.com', category: 'Productivity', pricing: 'Freemium', tags: ['Tasks', 'Mindmap'] },
        { id: 'morgen', name: 'Morgen', description: 'AI calendar and task manager for focused deep work.', url: 'https://morgen.ai', category: 'Productivity', pricing: 'Freemium', tags: ['Time', 'Calendar'] },
        { id: 'deepwell', name: 'DeepL', description: 'The world\'s most accurate and nuanced instant translator.', url: 'https://www.deepl.com', category: 'Productivity', pricing: 'Freemium', tags: ['Translation', 'Accuracy'] },

        // Video & Presentations
        { id: '11', name: 'Gamma AI', description: 'Create stunning presentations and docs in seconds with a prompt.', url: 'https://gamma.app', category: 'Presentations', pricing: 'Freemium', tags: ['PPT', 'Design'] },
        { id: 'tome', name: 'Tome', description: 'Generative storytelling for professional visual narratives.', url: 'https://tome.app', category: 'Presentations', pricing: 'Freemium', tags: ['Story', 'Slides'] },
        { id: 'decktopus', name: 'Decktopus', description: 'World\'s #1 AI-powered presentation generator.', url: 'https://decktopus.com', category: 'Presentations', pricing: 'Paid', tags: ['Fast', 'Presentation'] },
        { id: 'runway', name: 'Runway Gen-3', description: 'Next-gen video generation tools for professional VFX and film.', url: 'https://runwayml.com', category: 'Video', pricing: 'Freemium', tags: ['VFX', 'High-res'] },
        { id: 'pika', name: 'Pika Labs', description: 'Cinematic video generation from text and image prompts.', url: 'https://pika.art', category: 'Video', pricing: 'Freemium', tags: ['Motion', 'Art'] },
        { id: 'heygen', name: 'HeyGen', description: 'Create AI avatars and professional video content from text.', url: 'https://www.heygen.com', category: 'Video', pricing: 'Freemium', tags: ['Avatar', 'Marketing'] },
        { id: 'descript', name: 'Descript', description: 'Edit video and audio as easily as editing a text document.', url: 'https://descript.com', category: 'Video', pricing: 'Freemium', tags: ['Edit', 'Podcast'] },

        // Audio & Business
        { id: 'suno', name: 'Suno AI', description: 'Generate full songs with lyrics and vocals from a prompt.', url: 'https://suno.com', category: 'Audio', pricing: 'Freemium', tags: ['Music', 'Gen'] },
        { id: 'udio', name: 'Udio', description: 'High-fidelity music generation with incredible vocal range.', url: 'https://udio.com', category: 'Audio', pricing: 'Freemium', tags: ['Audio', 'Vocal'] },
        { id: 'elevenlabs', name: 'ElevenLabs', description: 'The most realistic AI speech synthesis and voice cloning.', url: 'https://elevenlabs.io', category: 'Audio', pricing: 'Freemium', tags: ['Voice', 'TTS'] },
        { id: 'adcreative', name: 'AdCreative.ai', description: 'Generate conversion-focused ad creatives and social posts.', url: 'https://www.adcreative.ai', category: 'Business', pricing: 'Paid', tags: ['Ads', 'Marketing'] },
        { id: 'namelix', name: 'Namelix', description: 'Generate short, brandable business names using AI.', url: 'https://namelix.com', category: 'Business', pricing: 'Free', tags: ['Names', 'Branding'] },
        { id: 'shopmagic', name: 'Shopify Magic', description: 'AI commerce tools built directly into Shopify.', url: 'https://shopify.com/magic', category: 'Business', pricing: 'Paid', tags: ['Sales', 'Ecom'] },
        { id: 'lavender', name: 'Lavender', description: 'The AI email assistant that helps you write better sales emails.', url: 'https://lavender.ai', category: 'Business', pricing: 'Freemium', tags: ['Email', 'Sales'] }
    ];

    const categories = ['All', 'General', 'Writing', 'Coding', 'Research', 'Design', 'Productivity', 'Presentations', 'Video', 'Audio', 'Business'];

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'General': return <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zM12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6z" />;
            case 'Writing': return <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />;
            case 'Coding': return <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />;
            case 'Research': return (
                <>
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                </>
            );
            case 'Design': return <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10a10 10 0 0 0 10-10c0-5.53-4.47-10-10-10zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />;
            case 'Productivity': return <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />;
            case 'Presentations': return (
                <>
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <path d="M8 21h8M12 17v4" />
                </>
            );
            case 'Video': return (
                <>
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
                </>
            );
            case 'Audio': return (
                <>
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" />
                </>
            );
            case 'Business': return (
                <>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </>
            );
            default: return <circle cx="12" cy="12" r="10" />;
        }
    };

    const getToolIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('chatgpt')) return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
        );
        if (n.includes('gemini')) return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-blue-500">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36" />
                <path d="M12 8l4 4-4 4-4-4 4-4z" />
            </svg>
        );
        if (n.includes('github') || n.includes('copilot')) return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
        );
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                <path d="M12 2a10 10 0 1 0 10 10H12V2Z" /><path d="M12 12l7-7" />
            </svg>
        );
    };

    const filteredTools = tools.filter(tool => {
        const matchesFilter = filter === 'All' || tool.category === filter;
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-fade-in pb-32">
            {/* Header Section */}
            <header className="text-center space-y-4 relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/10 blur-[80px] rounded-full" />
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                    AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Forge</span>
                </h2>
                <div className="flex items-center justify-center gap-2">
                    <div className="h-[1px] w-8 md:w-16 bg-slate-200 dark:bg-white/10" />
                    <p className="text-slate-500 text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] leading-none">
                        Intelligence Hub Nexus
                    </p>
                    <div className="h-[1px] w-8 md:w-16 bg-slate-200 dark:bg-white/10" />
                </div>

                <div className="relative max-w-xl mx-auto mt-8 group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-all duration-300 z-10 pointer-events-none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Ignite your search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="off"
                        spellCheck="false"
                        className="w-full pl-16 pr-6 py-5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[24px] text-[13px] md:text-[14px] font-bold outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-500/40 transition-all dark:text-white shadow-2xl shadow-black/5"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <kbd className="hidden md:flex h-6 px-1.5 items-center justify-center rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-black text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10">CMD</kbd>
                        <kbd className="hidden md:flex h-6 px-1.5 items-center justify-center rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-black text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10">K</kbd>
                    </div>
                </div>
            </header>

            {/* Category Filter */}
            <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide px-2 md:px-0 scroll-smooth">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border cursor-pointer active:scale-95 ${filter === cat
                                ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20'
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-orange-500/30'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredTools.length > 0 ? (
                    filteredTools.map((tool, i) => (
                        <div
                            key={tool.id}
                            style={{ animationDelay: `${i * 50}ms` }}
                            className="group relative p-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[40px] hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-600/5 transition-all duration-500 flex flex-col justify-between overflow-hidden group/card"
                        >
                            {/* Watermark Icon */}
                            <div className="absolute -right-6 -top-6 w-32 h-32 text-slate-900/[0.02] dark:text-white/[0.02] group-hover/card:text-orange-500/[0.05] transition-colors duration-500 pointer-events-none -rotate-12">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    {getCategoryIcon(tool.category)}
                                </svg>
                            </div>

                            <div className="relative z-10 space-y-5">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 rounded-[20px] bg-slate-50 dark:bg-white/5 flex items-center justify-center p-3 text-slate-900 dark:text-white transition-all group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-600/20">
                                        {getToolIcon(tool.name)}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${tool.pricing === 'Free' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' :
                                            tool.pricing === 'Freemium' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' :
                                                'text-blue-500 border-blue-500/20 bg-blue-500/5'
                                        }`}>
                                        {tool.pricing}
                                    </span>
                                </div>

                                <div className="space-y-2 text-left">
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                                        {tool.name}
                                    </h4>
                                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 uppercase tracking-wide">
                                        {tool.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {tool.tags.map(tag => (
                                        <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-white/5">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative z-10 mt-8 group/btn h-12 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white dark:hover:text-white transition-all no-underline shadow-lg active:scale-95"
                            >
                                Forge Ahead
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10"><path d="M12 2v2M12 20v2M2 12h2M20 12h2M12 12l4 4M12 12l-4-4" /></svg>
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No intelligence found in the forge.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIToolsDirectory;

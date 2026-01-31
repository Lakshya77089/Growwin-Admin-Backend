
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbUser = process.env["DB_USERNAME"];
const dbPass = process.env["DB_PASSWORD"];
const dbName = process.env["DB_NAME"];
const dbUri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.qp9lkym.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

const allPosts = [
    {
        id: 1,
        title: "The Future of Passive Income: Navigating 2026 with Fixed Returns",
        date: "Jan 25, 2026",
        author: "Sarah Jenkins",
        excerpt: "As traditional markets shift, fixed return investments are emerging as the gold standard for reliable wealth building in 2026.",
        image: "/blogs/future_passive_income.webp",
        category: "Market News",
        readTime: "12 min read",
        content: [
            { type: 'paragraph', value: "The investment landscape of 2026 is vastly different from anything we've seen before. With global markets becoming increasingly interconnected and volatile, the pursuit of passive income has shifted from speculative growth to reliable stability. Fixed return investments are now at the forefront of this evolution, offering a sanctuary for capital in an era of digital transition." },
            { type: 'heading', value: "Why Traditional Models are Shifting" },
            { type: 'paragraph', value: "For decades, the standard advice was to chase high-growth stocks and hope for the best. However, as we move through 2026, many investors are finding that the emotional toll of market volatility isn't worth the variable returns. The 'Fixed Return' model simplifies the equation: you provide the capital, we provide the steady, predictable yield." },
            { type: 'split_section', layout: 'left', value: { title: "Redefining Financial Stability", description: "Modern investors are looking for more than just potential; they are looking for promises. Fixed return models provide a shield against the erratic swings of tech-heavy indices and commodity markets. By prioritizing preservation alongside consistent output, these plans form the bedrock of a modern financial strategy.", subTitle: "Key Trends in 2026:", list: ["Shift from high-risk equity to stabilized yield products.", "Increased demand for transparent, audit-ready fund management.", "The integration of AI in risk mitigation for fixed return plans.", "Direct-to-investor platforms removing the middleman."], footer: "Stability is the new luxury in the world of finance." }, image: "/blogs/future_passive_income.webp" },
            { type: 'heading', value: "The Role of Technology in Yield Generation" },
            { type: 'paragraph', value: "At Growwin Capital, we leverage advanced algorithmic trading and real-time market sentiment analysis to find the most resilient yield opportunities. This isn't about guessing; it's about processing millions of data points to ensure that the 'Fixed' in our returns remains truly fixed, regardless of external economic noise." },
            { type: 'list', value: ["Predictive Analytics: Anticipating market shifts before they happen.", "Automated Rebalancing: Ensuring optimal asset allocation 24/7.", "Risk Hedging: Protecting against 'black swan' events with multi-layer strategies.", "Transparent Reporting: Real-time insights for every investor."] },
            { type: 'heading', value: "Building a Legacy with Consistent Returns" },
            { type: 'paragraph', value: "The true power of fixed returns is compounding. When you know exactly what your monthly income will be, you can plan your reinvestment strategy with surgical precision. This allows you to build a legacy that isn't dependent on a single lucky trade, but on a disciplined system of growth." },
            { type: 'quote', value: "In a fast-aced world, the most powerful financial move is knowing exactly what you'll earn tomorrow." },
            { type: 'paragraph', value: "As we look toward the remainder of 2026 and beyond, the message is clear: the future belongs to the disciplined. Growwin Capital is here to provide the platform and the expertise to help you navigate this future with confidence and peace of mind." }
        ]
    },
    {
        id: 2,
        title: "Why Multi-Asset Diversification is Your Best Defense",
        date: "Jan 24, 2026",
        author: "David Chen",
        excerpt: "Learn how Growwin Capital balances Forex, Equities, and Real Estate to protect your capital and ensure consistent returns.",
        image: "/blogs/market_diversification_expert.webp",
        category: "Investment Tips",
        readTime: "10 min read",
        content: [
            { type: 'paragraph', value: "The old saying 'don't put all your eggs in one basket' has never been more relevant. In today's market, a single geopolitical event or technological disruption can ripple through a specific sector in seconds. True security in 2026 comes from a meticulously balanced multi-asset approach that spans across different markets and classes." },
            { type: 'heading', value: "The Anatomy of a Diversified Portfolio" },
            { type: 'paragraph', value: "A truly resilient portfolio doesn't just hold different stocks; it holds different *types* of value. At Growwin Capital, we combine high-liquidity assets like Forex with the long-term appreciation of Real Estate and the innovative growth of Equities. This triad creates a circular safety net for your capital." },
            { type: 'split_section', layout: 'right', value: { title: "The Growwin Balancing Act", description: "We don't just invest; we allocate with purpose. By spreading capital across Forex, traditional Equities, and tangible Real Estate, we create a portfolio that can thrive in any economic weather. When one sector faces headwinds, another is often experiencing tailwinds, keeping the overall trajectory steady and positive.", subTitle: "Our Allocation Strategy:", list: ["Forex: Capturing value from global currency fluctuations and high liquidity.", "Equities: Long-term growth derived from high-performing global companies.", "Real Estate: Anchoring the portfolio with physical asset security and steady rental yields.", "Emerging Markets: Selective exposure to high-growth zones for alpha."], footer: "Diversity isn't just about safety; it's about capturing opportunity everywhere." }, image: "/blogs/market_diversification_expert.webp" },
            { type: 'heading', value: "Forex: The Liquidity Engine" },
            { type: 'paragraph', value: "Foreign exchange trading provides the liquidity necessary to fund monthly returns without needing to liquidate long-term positions. It's the engine that keeps the cash flow moving. Our expert traders use 24/5 market access to find spreads that others miss, ensuring a constant stream of income." },
            { type: 'heading', value: "Equities and Real Estate: The Growth Pillars" },
            { type: 'paragraph', value: "While Forex provides the pace, Equities and Real Estate provide the power. Stocks allow us to own a piece of the world's most innovative companies, while physical real estate provides a non-volatile anchor that resists the digital noise of the daily markets. Together, they ensure that your principal doesn't just stay safe—it grows." },
            { type: 'list', value: ["Sector Coverage: Tech, Healthcare, Energy, and Infrastructure.", "Geographic Reach: USA, Europe, Asia, and Emerging Africa.", "Asset Variety: Commercial, Residential, and Industrial Real Estate.", "Risk Tiers: From high-yield adventurous assets to AAA-rated security."] },
            { type: 'paragraph', value: "The result of this complex orchestration is a simple, stress-free experience for the Growwin investor. You don't need to watch the news or track the markets—our multi-asset fortress does that for you, delivering your returns like clockwork." }
        ]
    },
    {
        id: 3,
        title: "Radical Transparency: Inside Our Fund Management Process",
        date: "Jan 23, 2026",
        author: "Michael Ross",
        excerpt: "Trust is built on clarity. Discover the technology and ethics behind Growwin Capital's transparent investment tracking.",
        image: "/blogs/transparent_management.webp",
        category: "Trust & Transparency",
        readTime: "11 min read",
        content: [
            { type: 'paragraph', value: "In the world of finance, 'trust' is often a marketing buzzword. At Growwin Capital, we treat it as a fundamental technical requirement. We believe every investor should have a front-row seat to how their capital is being managed, protected, and grown. This is what we call 'Radical Transparency'." },
            { type: 'heading', value: "Why the Old Guard Fails at Transparency" },
            { type: 'paragraph', value: "Traditional financial institutions often hide their processes behind a wall of complex jargon, quarterly reports that are outdated by the time they are published, and hidden fees that erode your wealth. We decided to do things differently. We use technology to pull back the curtain and show you everything in real-time." },
            { type: 'split_section', layout: 'left', value: { title: "The Tech Behind the Trust", description: "We use a combination of real-time dashboards and verified reporting to ensure that what you see is always the ground truth. Our internal systems are designed to be an open book for our clients, providing a level of detail that was previously only available to institutional hedge fund managers.", subTitle: "Transparency Features:", list: ["Live Portfolio Tracking: See your returns update as the markets move.", "One-Click Audit Trails: Every trade and transaction is recorded and verifiable.", "Direct Manager Insights: Regular updates on our tactical and strategic shifts.", "Zero-Hidden-Fee Policy: Every penny is accounted for and clearly explained."], footer: "Trust is earned every time you check your dashboard and find everything exactly as promised." }, image: "/blogs/transparent_management.webp" },
            { type: 'heading', value: "Real-Time Tracking: The Dashboard Revolution" },
            { type: 'paragraph', value: "When you log into the Growwin App, you aren't just seeing a static number. You're seeing a living representation of your financial future. You can see which asset classes are performing, how your monthly yield is accumulating, and even chat directly with our experts if you have a question. This level of access reduces anxiety and builds long-term confidence." },
            { type: 'list', value: ["24/7 Access: No more waiting for bank hours to see your money.", "Interactive Charts: Visualizing your growth over days, months, and years.", "Instant Support: Resolving queries with human experts, not just chatbots.", "Verified Statements: Exportable data for your own records and tax planning."] },
            { type: 'paragraph', value: "By making our processes transparent, we hold ourselves to a higher standard. We know our investors are watching, and that motivates our team to perform at their absolute best every single day." }
        ]
    },
    {
        id: 4,
        title: "Forex vs. Equities: Finding the Right Balance for Fixed Returns",
        date: "Jan 20, 2026",
        author: "Elena Rodriguez",
        excerpt: "Both markets offer unique strengths. We break down how combining them leads to the perfect fixed-return investment vehicle.",
        image: "/blogs/forex_comparison.webp",
        category: "Beginner Friendly",
        readTime: "13 min read",
        content: [
            { type: 'paragraph', value: "Choosing between Forex and Equities is a common dilemma for new investors. Both markets are massive and offer incredible opportunities, but they behave very differently. While Forex offers high liquidity and 24/5 market action, Equities provide the bedrock of global economic growth. At Growwin Capital, we don't choose—we combine." },
            { type: 'heading', value: "Forex: The Market That Never Sleeps" },
            { type: 'paragraph', value: "The Foreign Exchange market is the largest financial market in the world, with over $6 trillion traded every single day. Its high liquidity means we can enter and exit positions instantly, which is crucial for maintaining the steady cash flow required for fixed monthly returns. It allows us to hedge against local currency risks and take advantage of global economic shifts." },
            { type: 'split_section', layout: 'right', value: { title: "Comparative Analysis", description: "Forex allows us to hedge against local economic downturns, while Equities allow us to participate in the success of the world's greatest innovators. By balancing these two, we can neutralize the risks inherent in either one. It's the financial equivalent of a hybrid engine: efficient, powerful, and reliable.", subTitle: "Market Differences:", list: ["Volatility Profiles: Forex moves fast but often within ranges; Equities trend over months.", "Liquidity: Currency is the ultimate liquid asset; stocks require buyers.", "Yield Drivers: Stocks pay dividends; Forex captures interest rate and price gaps.", "Market Hours: Forex is 24/5; Equities are tied to exchange hours."], footer: "We bridge the gap between these two worlds to create your fixed return oasis." }, image: "/blogs/forex_comparison.webp" },
            { type: 'heading', value: "Equities: Owning the Future" },
            { type: 'paragraph', value: "Equities are about more than just numbers; they are about participating in human ingenuity. When we invest in stocks, we are backing companies that are solving problems, creating jobs, and inventing the future. This provides a long-term capital appreciation that complements the short-term gains from Forex trading." },
            { type: 'list', value: ["Blue Chip Stability: Backing industry leaders with proven track records.", "Growth Potential: Selective exposure to high-growth tech and biotech.", "Dividend Income: Reinvesting corporate profits back into the fund.", "Diversification: Spreading risk across hundreds of different business models."] },
            { type: 'heading', value: "The Synergy of Both" },
            { type: 'paragraph', value: "By using Forex to generate consistent, liquid profit and Equities to build long-term value, Growwin Capital can offer a Fixed Return plan that is both safe in the short term and sustainable over the long term. This balanced approach is what makes our platform beginner-friendly—you get the best of both worlds without needing to be an expert in either." }
        ]
    },
    {
        id: 5,
        title: "Sustainable Wealth: The Intersection of Fintech and Ethics",
        date: "Jan 18, 2026",
        author: "Sanjay Gupta",
        excerpt: "How modern technology is making institutional-grade, stable investments accessible to everyone, sustainably.",
        image: "/blogs/fintech_wealth.webp",
        category: "Investment Tips",
        readTime: "9 min read",
        content: [
            { type: 'paragraph', value: "Wealth building should not be a zero-sum game where one person wins only if another loses. In 2026, the rise of Fintech (Financial Technology) has democratized access to institutional-grade trading strategies, allowing small and individual investors to enjoy the same stability once reserved only for the ultra-wealthy. But at Growwin Capital, we believe technology must be guided by ethics." },
            { type: 'heading', value: "Democratizing Yield" },
            { type: 'paragraph', value: "For decades, the most stable and profitable investment vehicles were locked behind 'minimum investment' walls of $1 million or more. Fintech has shattered those walls. Through fractionalization and automated fund management, we can now offer the same professional-grade fixed returns to someone starting with much less." },
            { type: 'list', value: ["Inclusion: Making safe investing accessible to all demographics.", "Education: Using digital tools to empower investors with knowledge.", "Efficiency: Lowering costs through automation and passing those savings to you.", "Agility: Pivoting to market changes in seconds, not days."] },
            { type: 'heading', value: "The Ethics of Growth" },
            { type: 'paragraph', value: "Sustainable wealth is about more than just percentages; it's about *how* those returns are generated. We avoid speculative 'pump and dump' schemes and focus on real value creation. Our ethical framework ensures that we invest in companies and markets that contribute positively to global development, ensuring your growth doesn't come at an invisible cost." },
            { type: 'split_section', layout: 'left', value: { title: "Building a Better Future", description: "Our approach to Fintech is rooted in the belief that financial freedom is a human right. By creating a secure, transparent, and fair platform, we are helping to build a more equitable world where anyone with the discipline to save can also have the opportunity to grow.", subTitle: "Our Ethical Pillars:", list: ["Environmental focus: Avoiding sectors with high negative impact.", "Social Responsibility: Backing companies with ethical labor practices.", "Governance: Strict adherence to international financial regulations.", "Community: Sharing our success through educational and social initiatives."], footer: "Your wealth can grow while making a positive impact on the world." }, image: "/blogs/fintech_wealth.webp" },
            { type: 'paragraph', value: "Growwin Capital is proud to be at this intersection. We are proof that you can have high-tech returns with a high-touch ethical compass. Join us in building wealth that lasts, for you and for the future." }
        ]
    },
    {
        id: 6,
        title: "Retirement Reimagined: The Power of Monthly Income Streams",
        date: "Jan 15, 2026",
        author: "Dr. Alice Morgan",
        excerpt: "Traditional pension plans are failing. Discover why a fixed monthly return model is the key to a stress-free retirement.",
        image: "/blogs/retirement_planning.webp",
        category: "Retirement Planning",
        readTime: "14 min read",
        content: [
            { type: 'paragraph', value: "Retirement should be about relaxation, pursuing passions, and spending time with loved ones—not checking stock tickers or worrying about the next market crash. Traditional pension plans and savings accounts are no longer enough to support the lifestyle that modern retirees deserve. It's time to reimagine retirement through the lens of fixed monthly income streams." },
            { type: 'heading', value: "The Problem with Traditional Pensions" },
            { type: 'paragraph', value: "Inflation is the silent enemy of retirement. Most traditional pensions do not keep pace with the rising cost of living. Furthermore, the 4% withdrawal rule from a standard stock portfolio can be disastrous if you enter retirement during a market downturn. You need an engine that produces income regardless of the broader market's mood." },
            { type: 'list', value: ["Predictability: Knowing exactly how much you can spend each month.", "Safety: Protecting your principal so it can be passed to the next generation.", "Independence: Not being reliant on government social security changes.", "Simplicity: One platform, one goal, no stress."] },
            { type: 'heading', value: "The Growwin Retirement Strategy" },
            { type: 'paragraph', value: "At Growwin Capital, we've designed our Fixed Return plans to act as a 'Digital Pension'. By depositing your retirement nest egg into our diversified fund, you create a fire-and-forget income engine. We manage the risk, we handle the trades, and you receive your payout on the same day every single month." },
            { type: 'split_section', layout: 'right', value: { title: "Focus on Living, Not Investing", description: "Our retirement-focused investors tell us that the greatest benefit isn't just the money—it's the time. When you don't have to spend your days analyzing charts or worrying about the news, you are free to actually enjoy the retirement you worked so hard for. It's about buying back your peace of mind.", subTitle: "Retirement Benefits:", list: ["Monthly Payouts: Perfect for covering recurring living expenses.", "Capital Preservation: Your initial deposit stays safe and working for you.", "Easy Withdrawals: Access your funds whenever you need extra liquidity.", "Transparency: Your family can also track the performance with ease."], footer: "Retire with a plan that works as hard as you did." }, image: "/blogs/retirement_planning.webp" },
            { type: 'quote', value: "The best retirement plan is one that you don't have to think about." },
            { type: 'paragraph', value: "Whether you are decades away from retirement or already there, a fixed monthly income stream can be the difference between a stressful retirement and a golden one. Let Growwin Capital help you build the financial foundation for the best years of your life." }
        ]
    },
    {
        id: 7,
        title: "Bulletproof Finance: Our Multi-Layer Security Architecture",
        date: "Jan 12, 2026",
        author: "Kevin Smith",
        excerpt: "Your capital's safety is our #1 priority. Go behind the scenes of our digital vault and cybersecurity systems.",
        image: "/blogs/cybersecurity_finance.webp",
        category: "Trust & Transparency",
        readTime: "11 min read",
        content: [
            { type: 'paragraph', value: "In the digital age, a bank vault is made of code, not steel. As an investment platform, our primary responsibility is the absolute security of your capital and your data. At Growwin Capital, we employ a 'Defense-in-Depth' philosophy, ensuring that your wealth is protected by multiple independent layers of world-class security." },
            { type: 'heading', value: "Layer 1: Encryption and Authentication" },
            { type: 'paragraph', value: "Security starts at your front door. We use end-to-end encryption for all data transmissions and require multi-factor authentication for every fund movement. This ensures that even in the unlikely event of a password compromise, your funds remain entirely under your exclusive control." },
            { type: 'list', value: ["AES-256 Encryption: Military-grade protection for all data at rest.", "Biometric MFA: Using your unique face or fingerprint for critical actions.", "Secure Enclaves: Keeping your private keys in specialized, unhackable hardware.", "Real-Time Alerts: Instantly knowing if there is any unusual activity."] },
            { type: 'heading', value: "Layer 2: Tactical Asset Protection" },
            { type: 'paragraph', value: "Security isn't just about stopping hackers; it's about stopping market losses. We use segregated accounts for our investors' capital, meaning your money is never mixed with our operational funds. Furthermore, our risk-management algorithms act as a digital safety net, automatically hedging positions if a market flash-crash is detected." },
            { type: 'split_section', layout: 'left', value: { title: "The Digital Vault", description: "Our digital vault is built on the same principles used by global central banks. We use multi-signature protocols for any major fund movement, meaning no single person at Growwin Capital can move large sums of money alone. Every action requires multiple, verified authorizations.", subTitle: "Security Protocols:", list: ["Multi-Sig Wallets: Decentralized control over major assets.", "Cold Storage: Keeping the majority of funds offline and away from the internet.", "Audit Logs: A permanent, immutable record of every system action.", "24/7 Security Operations Center: Human experts monitoring for threats."], footer: "Your peace of mind is our most valuable asset." }, image: "/blogs/cybersecurity_finance.webp" },
            { type: 'heading', value: "Continuous Auditing" },
            { type: 'paragraph', value: "We don't just say we are secure; we prove it. Growwin Capital undergoes regular third-party security audits and penetration testing. We are always looking for the next threat before it arrives, ensuring that our systems stay ahead of the evolving cybersecurity landscape." }
        ]
    },
    {
        id: 8,
        title: "The Disciplined Investor: Mastering Financial Psychology",
        date: "Jan 10, 2026",
        author: "Isabel Thorne",
        excerpt: "Why staying calm and sticking to a plan is the most valuable 'technical' skill an investor can have.",
        image: "/blogs/investor_psychology.webp",
        category: "Beginner Friendly",
        readTime: "12 min read",
        content: [
            { type: 'paragraph', value: "The biggest threat to your wealth isn't a market crash, a greedy broker, or a bad trade; it's the person you see in the mirror. Financial psychology—the study of how our minds interact with money—is the secret ingredient to long-term success. Even the best investment plan will fail if you cannot control your emotional reactions to market noise." },
            { type: 'heading', value: "Fear and Greed: The Twins of Failure" },
            { type: 'paragraph', value: "Our brains are wired for survival, not for modern investing. The same instincts that saved our ancestors from predators now make us want to 'fear' when markets are down and feel 'greedy' when they are up. This leads people to buy high and sell low. The disciplined investor learns to recognize these biological signals and act against them." },
            { type: 'list', value: ["Loss Aversion: The tendency to feel the pain of loss 2x more than the joy of gain.", "F.O.M.O: The destructive urge to chase what everyone else is doing.", "Confirmation Bias: Only looking for data that proves you are right.", "Recency Bias: Thinking that what happened yesterday will keep happening today."] },
            { type: 'heading', value: "How Growwin Solves the Psychology Problem" },
            { type: 'paragraph', value: "This is exactly why we created the Fixed Return model. By providing a steady, predictable monthly income, we remove the primary trigger for emotional decision-making: uncertainty. When you know your returns are locked in, you don't feel the need to panic sell during a temporary dip or chase a risky trend during a peaks." },
            { type: 'split_section', layout: 'right', value: { title: "The Logical Choice", description: "Investing with a fixed-return mindset is like using a compass in a storm. It doesn't matter which way the wind is blowing; you always know where your destination is. It allows you to move from 'reactive' investing to 'proactive' wealth management.", subTitle: "Discipline Building Blocks:", list: ["Automate your savings: Take the emotion out of the entry point.", "Focus on the result, not the process: We handle the messy markets for you.", "Limit your checked-ins: Our real-time dashboard is there, but you don't need to stare at it.", "Education: Understanding *why* your money is safe makes it easier to stay calm."], footer: "Confidence comes from understanding the system, not guessing the market." }, image: "/blogs/investor_psychology.webp" },
            { type: 'quote', value: "Investing is not about being the smartest; it's about being the most disciplined." },
            { type: 'paragraph', value: "At Growwin Capital, we are more than just a fund manager; we are your partner in discipline. Our platform is designed to protect you from the market, and more importantly, to protect your wealth from the emotional impulses that can so easily destroy it." }
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(dbUri);
        const Blog = mongoose.connection.db.collection('blogs');

        console.log("Seeding all 8 blogs...");
        for (const post of allPosts) {
            const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            await Blog.updateOne(
                { slug },
                {
                    $set: {
                        title: post.title,
                        slug: slug,
                        author: post.author,
                        excerpt: post.excerpt,
                        image: post.image,
                        category: post.category,
                        readTime: post.readTime,
                        content: post.content,
                        status: 'published',
                        publishedAt: new Date(post.date),
                        createdAt: new Date(post.date),
                        updatedAt: new Date(post.date)
                    }
                },
                { upsert: true }
            );
            console.log(`Seeded: ${post.title}`);
        }
        console.log("Done seeding all blogs!");
        await mongoose.disconnect();
    } catch (e) {
        console.error("Seeding failed:", e);
    }
}
seed();

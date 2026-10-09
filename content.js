/* The single source for repeatable portfolio content.
 * Empty optional values are intentionally omitted from the public UI.
 * Use verified facts only. See README.md for every supported field. */
window.portfolioContent = {
    resumeUrl: '', // Set to 'assets/James-Michael-Lionel-CV.pdf' AFTER adding the PDF.
    transcriptUrl: 'assets/James-Michael-Lionel-Transcript.pdf', // Shown only when the build verifies this PDF exists.
    skills: [
        { title: 'Programming & markup', symbol: '</>', items: ['Python', 'JavaScript', 'HTML', 'CSS'] },
        { title: 'Frameworks & libraries', symbol: '{ }', items: ['React', 'scikit-learn', 'OpenCV'] },
        { title: 'Models & APIs', symbol: '[ ]', items: ['YOLO', 'DistilBERT', 'LLM APIs'] },
        { title: 'Tools', symbol: '>_', items: ['VS Code', 'GitHub', 'Figma'] }
    ],
    education: [
        { institution: 'BINUS University', program: 'Computer Science', specialization: 'Intelligence System', dates: '' }
    ],
    // No experience was supplied in the portfolio. The section automatically
    // appears when a factual entry is added. Example shape (not a real entry):
    // { role: '', organization: '', type: '', dates: '', description: '', highlights: [] }
    experience: [],
    projects: [
        {
            "title": "VigilEye",
            "type": "Personal",
            "area": "Computer Vision",
            "shortDescription": "Real-Time Driver Drowsiness Detection",
            "description": "A real-time computer vision system designed to monitor driver drowsiness using facial and eye-related signals and provide alerts when signs of drowsiness are detected.",
            "image": "assets/projects/vigileye-cover.png",
            "imageAlt": "VigilEye concept illustration showing a driver-monitoring interface.",
            "visualStyle": "illustration",
            "githubUrl": "https://github.com/jamesmichl/VigilEye",
            "demoUrl": "",
            "technologies": [
                "Python",
                "OpenCV",
                "MediaPipe",
                "NumPy",
                "Pygame"
            ],
            "imageNote": "Concept illustration. Interface values and charts are illustrative, not verified project results.",
            "slug": "vigileye"
        },
        {
            "title": "Trimly",
            "type": "Personal",
            "area": "Software Engineering / Web Development",
            "shortDescription": "Barbershop Booking Web Application",
            "description": "A web-based barbershop booking application that allows users to explore services, choose a barber, and reserve an available appointment slot.",
            "image": "assets/projects/trimly-screenshot.png",
            "imageAlt": "The real Trimly website showing its barbershop introduction and booking action.",
            "visualStyle": "screenshot",
            "githubUrl": "https://github.com/jamesmichl/Trimly",
            "demoUrl": "https://trimly-bay.vercel.app/",
            "technologies": [
                "TypeScript",
                "Next.js",
                "React",
                "Tailwind CSS",
                "Prisma",
                "PostgreSQL",
                "Better Auth"
            ],
            "slug": "trimly"
        },
        {
            "title": "BlurIn",
            "type": "Group",
            "area": "Computer Vision",
            "shortDescription": "Selective Face Blurring for Video",
            "description": "A computer vision application that allows users to provide a reference face and a video, then identifies and blurs the matching person's face throughout the video.",
            "image": "assets/projects/blurin-screenshot.png",
            "imageAlt": "The real BlurIn interface with reference-face and video upload fields.",
            "visualStyle": "screenshot",
            "githubUrl": "https://github.com/jamesmichl/BlurIn",
            "demoUrl": "https://blurin.streamlit.app/",
            "technologies": [
                "Python",
                "Streamlit",
                "OpenCV",
                "NumPy",
                "FFmpeg"
            ],
            "slug": "blurin"
        },
        {
            "title": "MoodWatch",
            "type": "Group",
            "area": "Machine Learning / Recommendation System",
            "shortDescription": "Natural-Language Movie Recommendation System",
            "description": "A movie recommendation system that interprets a user's natural-language description of what they want to watch and returns relevant movie recommendations.",
            "image": "assets/projects/moodwatch-results.png",
            "imageAlt": "MoodWatch results showing a natural-language request, detected keywords, and movie recommendations in Packs X and Y.",
            "visualStyle": "screenshot",
            "githubUrl": "https://github.com/jamesmichl/MoodWatch----Movie-Recommendation-System",
            "demoUrl": "https://movie-recommendation-system---blind-a-b-testing.streamlit.app/",
            "technologies": [
                "Python",
                "Streamlit",
                "pandas",
                "scikit-learn",
                "Google Gemini",
                "Optuna"
            ],
            "slug": "moodwatch"
        },
        {
            "title": "Early Diabetes Detection",
            "fullTitle": "Comparative Analysis of Ensemble Learning for Early Diabetes Detection",
            "type": "Group",
            "area": "Machine Learning",
            "shortDescription": "Ensemble Learning for Early Detection",
            "description": "A machine learning project investigating ensemble-learning approaches for early diabetes mellitus detection.",
            "image": "assets/projects/diabetes-cover.png",
            "imageAlt": "Early Diabetes Detection concept illustration with example charts.",
            "visualStyle": "illustration",
            "githubUrl": "https://github.com/jamesmichl/Comparative-Analysis-of-Ensemble-Learning-for-Early-Diabetes-Detection",
            "demoUrl": "",
            "technologies": [
                "Python",
                "scikit-learn",
                "XGBoost",
                "LightGBM",
                "CatBoost",
                "Optuna",
                "SHAP"
            ],
            "imageNote": "Concept illustration. Interface values and charts are illustrative, not verified project results.",
            "slug": "early-diabetes-detection"
        },
        {
            "title": "LastBite",
            "type": "Group",
            "area": "Software / Product Development",
            "shortDescription": "Surplus Food Marketplace",
            "description": "A mobile application concept designed to connect consumers with surplus or end-of-day food that is still suitable for consumption, helping reduce food waste while offering discounted food options.",
            "image": "assets/projects/lastbite-mobile.png",
            "imageAlt": "The supplied LastBite mobile concept UI showing search, food categories, and Best Deals Today.",
            "visualStyle": "mobile",
            "githubUrl": "https://github.com/jamesmichl/LastBite",
            "demoUrl": "",
            "technologies": [
                "TypeScript",
                "React Native",
                "Expo",
                "Node.js",
                "Express",
                "MySQL"
            ],
            "slug": "lastbite"
        }
    ],
    // Metadata transcribed from the supplied original PDFs; unknown dates are omitted.
    certificates: [
    {
        "title": "Databases for Developers: Foundations",
        "issuer": "Oracle Corporation · Dev Gym",
        "category": "Database development",
        "distinction": "Grade: 99%",
        "details": "Certificate of Excellence · Taught by Chris Saxon",
        "image": "assets/certificates/databases-foundations.webp",
        "thumbnail": "assets/certificates/databases-foundations-thumb.webp",
        "pdfUrl": "assets/certificates/databases-foundations.pdf",
        "imageAlt": "Databases for Developers: Foundations certificate awarded to James Michael Lionel."
    },
    {
        "title": "Mobile Development",
        "issuer": "BNCC · BINUS University",
        "category": "Development",
        "distinction": "Low Distinction",
        "details": "Certificate of Completion · Class of 2024/2025",
        "credentialId": "001/LNT/III/MEMBER/BNCC/BDG/XXXVI/08.2025",
        "credentialLabel": "Certificate number",
        "image": "assets/certificates/mobile-development.webp",
        "thumbnail": "assets/certificates/mobile-development-thumb.webp",
        "pdfUrl": "assets/certificates/mobile-development.pdf",
        "imageAlt": "Mobile Development certificate awarded to James Michael Lionel."
    },
    {
        "title": "UI/UX",
        "issuer": "BNCC · BINUS University",
        "category": "Design",
        "distinction": "Low Distinction",
        "details": "Certificate of Completion · Class of 2024/2025",
        "credentialId": "001/LNT/III/MEMBER/BNCC/BDG/XXXVI/08.2025",
        "credentialLabel": "Certificate number",
        "image": "assets/certificates/ui-ux.webp",
        "thumbnail": "assets/certificates/ui-ux-thumb.webp",
        "pdfUrl": "assets/certificates/ui-ux.pdf",
        "imageAlt": "UI/UX certificate awarded to James Michael Lionel."
    },
    {
        "title": "BNCC HRD Activist 2024/2025",
        "issuer": "Bina Nusantara Computer Club Bandung",
        "category": "Organization",
        "details": "Certificate of Completion for contribution and participation as Activist of Human Resource Development during the 2024/2025 academic year.",
        "credentialId": "001/ALL/III/AKTIVIS/BNCC/BDG/XXXVI/04.2026",
        "credentialLabel": "Certificate number",
        "image": "assets/certificates/bncc-hrd.webp",
        "thumbnail": "assets/certificates/bncc-hrd-thumb.webp",
        "pdfUrl": "assets/certificates/bncc-hrd.pdf",
        "imageAlt": "BNCC HRD Activist 2024/2025 certificate awarded to James Michael Lionel."
    },
    {
        "title": "Beyond the Earth: Computer Science in the Space Age",
        "issuer": "BINUS University · School of Computer Science",
        "category": "Participation",
        "date": "22 November 2024",
        "details": "Participant",
        "image": "assets/certificates/beyond-the-earth.webp",
        "thumbnail": "assets/certificates/beyond-the-earth-thumb.webp",
        "pdfUrl": "assets/certificates/beyond-the-earth.pdf",
        "imageAlt": "Beyond the Earth: Computer Science in the Space Age certificate awarded to James Michael Lionel."
    },
    {
        "title": "Professional Office — C1.2",
        "fullTitle": "Professional Office (V2) (CEFR C1.2)",
        "issuer": "BINUS University · Beelingua",
        "category": "English course",
        "date": "September 2025",
        "details": "Completed English C1.2-level courses with a passing grade.",
        "credentialId": "2025-C-YNKFGsGtPsmGa",
        "image": "assets/certificates/professional-office.webp",
        "thumbnail": "assets/certificates/professional-office-thumb.webp",
        "pdfUrl": "assets/certificates/professional-office.pdf",
        "imageAlt": "Professional Office — C1.2 certificate awarded to James Michael Lionel."
    },
    {
        "title": "Market Research & Business Communication — C2.2",
        "fullTitle": "Market Research & Business Communication (V2) (CEFR C2.2)",
        "issuer": "BINUS University · Beelingua",
        "category": "English course",
        "date": "October 2025",
        "details": "Completed English C2.2-level courses with a passing grade.",
        "credentialId": "2025-C-iLstZv2JVrLFw",
        "image": "assets/certificates/market-research.webp",
        "thumbnail": "assets/certificates/market-research-thumb.webp",
        "pdfUrl": "assets/certificates/market-research.pdf",
        "imageAlt": "Market Research & Business Communication — C2.2 certificate awarded to James Michael Lionel."
    }
]
};

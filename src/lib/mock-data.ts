// Mock data used as fallback when the Express backend is not yet deployed.
// Lets the UI preview look real before the backend is wired.

export const MOCK_INTERNSHIPS = [
  { id: "i1", title: "Full-Stack Web Development Intern", company: "TechVerse Solutions", category: "Web Development", duration: "3 Months", mode: "Hybrid", stipend: "₹15,000/mo", location: "Bengaluru", tags: ["AICTE", "UGC"], approved: true },
  { id: "i2", title: "Data Science & Analytics Intern", company: "InsightWorks", category: "Data Science", duration: "6 Months", mode: "Remote", stipend: "₹20,000/mo", location: "Remote", tags: ["AICTE", "ISO"], approved: true },
  { id: "i3", title: "Digital Marketing Intern", company: "BrandCircle", category: "Marketing", duration: "2 Months", mode: "Onsite", stipend: "₹10,000/mo", location: "Mumbai", tags: ["BSDM"], approved: true },
  { id: "i4", title: "UI/UX Design Intern", company: "PixelForge Studio", category: "Design", duration: "3 Months", mode: "Remote", stipend: "₹12,000/mo", location: "Remote", tags: ["UGC", "ISO"], approved: true },
  { id: "i5", title: "Cybersecurity Research Intern", company: "SecureNet Labs", category: "Cybersecurity", duration: "6 Months", mode: "Hybrid", stipend: "₹25,000/mo", location: "Hyderabad", tags: ["AICTE"], approved: true },
  { id: "i6", title: "Mobile App Development Intern", company: "Appora", category: "Mobile Development", duration: "4 Months", mode: "Remote", stipend: "₹18,000/mo", location: "Remote", tags: ["AICTE", "UGC"], approved: true },
  { id: "i7", title: "AI/ML Research Intern", company: "NeuralEdge", category: "AI/ML", duration: "6 Months", mode: "Hybrid", stipend: "₹30,000/mo", location: "Pune", tags: ["AICTE", "ISO"], approved: true },
  { id: "i8", title: "Content Writing & SEO Intern", company: "WriteRight Media", category: "Content", duration: "2 Months", mode: "Remote", stipend: "₹8,000/mo", location: "Remote", tags: ["BSDM"], approved: true },
];

export const CATEGORIES = ["All", "Web Development", "Data Science", "AI/ML", "Mobile Development", "Cybersecurity", "Design", "Marketing", "Content"] as const;

export const TESTIMONIALS = [
  { name: "Aditya Patel", role: "Software Engineer at Google", quote: "TechLaunchpad's advanced training curriculum and mentorship gave me the exact skills needed to clear the Google technical interview. The hands-on project was the highlight of my resume.", rating: 5 },
  { name: "Ananya Iyer", role: "Cloud Analyst at Amazon", quote: "The structured internship projects simulated a real corporate environment. It prepared me perfectly for my role at Amazon.", rating: 5 },
  { name: "Neha Reddy", role: "Software Engineer at Microsoft", quote: "The ISO certification and verified credentials made a huge difference. Recruiters at Microsoft recognized the structured learning path.", rating: 5 },
  { name: "Rahul Sen", role: "SDE-1 at Rapido", quote: "From learning web development to building production-ready apps, TechLaunchpad was a game changer. Super proud to join Rapido!", rating: 5 },
  { name: "Divyansh Saxena", role: "Frontend Developer at Quantronsoft", quote: "Quantronsoft hired me directly through the campus-connect reference from TechLaunchpad. The support team was with me at every step.", rating: 5 },
  { name: "Vikram Malhotra", role: "Systems Engineer at Virtusa", quote: "The full-stack web development program is incredibly comprehensive. It helped me land my placement at Virtusa right out of college.", rating: 5 },
  { name: "Pooja Choudhury", role: "Programmer Analyst at Cognizant", quote: "TechLaunchpad provides high-quality industry assignments. The skills I learned here are directly helping me in my role at Cognizant.", rating: 5 },
  { name: "Karan Verma", role: "Graduate Engineer Trainee at HCL Tech", quote: "The training program is aligned with the latest industry standards. Joining HCL Tech was smooth because of my strong foundation.", rating: 5 },
];

export const PARTNERS = [
  "TechVerse", "InsightWorks", "PixelForge", "NeuralEdge", "SecureNet", "Appora", "BrandCircle", "WriteRight",
];

export const STATS = [
  { value: 50000, suffix: "+", label: "Students Trained" },
  { value: 1200, suffix: "+", label: "Partner Companies" },
  { value: 350, suffix: "+", label: "Internship Programs" },
  { value: 98, suffix: "%", label: "Completion Rate" },
];

export const FAQS = [
  { q: "What is TechLaunchpad?", a: "TechLaunchpad is an industry-focused internship and training platform offering AICTE aligned, UGC guided, BSDM supported and ISO certified opportunities for students across India." },
  { q: "How do I apply for an internship?", a: "Create a free student account, complete your profile, browse approved internships, and apply with one click. You can track your application status in your dashboard." },
  { q: "Are the certificates verifiable?", a: "Yes. Every certificate carries a unique verification ID that anyone can check on our public verification page." },
  { q: "Is there any application fee?", a: "Browsing and applying for internships on TechLaunchpad is completely free for students." },
  { q: "Can companies post internships?", a: "Yes. Companies can register, get verified, and post internships. All listings are reviewed by our admin team for quality and authenticity." },
  { q: "What approvals does TechLaunchpad hold?", a: "Our programs are aligned with AICTE guidelines, guided by UGC frameworks, supported by BSDM and follow ISO certification standards. Refer to each program page for specifics." },
];

export const BLOG_POSTS = [
  { slug: "career-paths-2026", title: "Top 10 Career Paths for Indian Students in 2026", excerpt: "From AI engineering to green energy — the careers shaping India's next decade.", date: "May 12, 2026", tag: "Careers" },
  { slug: "resume-tips", title: "How to Write a Resume That Lands Interviews", excerpt: "Recruiters spend 7 seconds on your resume. Make every line count.", date: "May 8, 2026", tag: "Guides" },
  { slug: "ai-skills-students", title: "5 AI Skills Every Student Should Learn This Year", excerpt: "Practical skills you can build during a 3-month internship.", date: "May 1, 2026", tag: "Skills" },
  { slug: "remote-internship-success", title: "Succeeding in a Remote Internship", excerpt: "Communication, ownership, and the rituals that separate great interns from the rest.", date: "Apr 22, 2026", tag: "Guides" },
];

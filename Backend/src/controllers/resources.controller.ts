import { Elysia, t } from "elysia";
import prisma from "../db";

const INITIAL_RESOURCES = [
  // Paid Courses
  {
    title: "Deep Learning Specialization",
    creator: "DeepLearning.AI & Andrew Ng (Coursera)",
    type: "paid-courses",
    price: "Paid",
    description: "Learn the foundations of Deep Learning, build and train neural networks (CNNs, RNNs, Transformers), and implement them using PyTorch/TensorFlow.",
    link: "https://www.coursera.org/specializations/deep-learning",
    tags: ["Deep Learning", "Andrew Ng", "Neural Networks", "PyTorch"],
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Google Advanced Data Analytics Professional Certificate",
    creator: "Google (Coursera)",
    type: "paid-courses",
    price: "Paid",
    description: "Develop the in-demand skills needed for associate-level careers in data analytics, learning Python, regression models, and machine learning concepts.",
    link: "https://www.coursera.org/professional-certificates/google-advanced-data-analytics",
    tags: ["Machine Learning", "Python", "Data Science", "Google"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "IBM AI Engineering Professional Certificate",
    creator: "IBM (Coursera)",
    type: "paid-courses",
    price: "Paid",
    description: "Master Machine Learning, Deep Learning, Generative AI, and computer vision. Build, test, and deploy deep learning models using Keras, PyTorch, and TensorFlow.",
    link: "https://www.coursera.org/professional-certificates/ibm-ai-engineering",
    tags: ["AI Engineering", "PyTorch", "Computer Vision", "IBM"],
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "AWS Certified Machine Learning - Specialty Course",
    creator: "Amazon Web Services",
    type: "paid-courses",
    price: "Paid",
    description: "Official AWS training course designed to build cloud-based machine learning pipelines, evaluate models, and prepare for the Specialty certification exam.",
    link: "https://aws.amazon.com/training/learning-paths/machine-learning/",
    tags: ["AWS", "Cloud AI", "Model Deployment", "Certification"],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Microsoft Certified: Azure AI Engineer Associate",
    creator: "Microsoft",
    type: "paid-courses",
    price: "Paid",
    description: "Official learning path to design and implement Microsoft Azure AI solutions, including cognitive services, machine learning, and natural language processing.",
    link: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer-associate/",
    tags: ["Azure", "Cognitive Services", "Microsoft", "Azure AI"],
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Generative AI with Large Language Models",
    creator: "DeepLearning.AI & AWS (Coursera)",
    type: "paid-courses",
    price: "Paid",
    description: "A comprehensive course covering generative AI lifecycle, fine-tuning techniques (PEFT/LoRA), reinforcement learning with human feedback (RLHF), and LLM deployment architectures.",
    link: "https://www.coursera.org/learn/generative-ai-with-llms",
    tags: ["Generative AI", "LLM", "AWS", "Fine-Tuning", "RLHF"],
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Machine Learning Zoomcamp",
    creator: "DataTalks.Club (Alexey Grigorev)",
    type: "paid-courses",
    price: "Free",
    description: "An incredibly practical engineering-focused machine learning bootcamp. Teaches regression, classification, model deployment (Docker, Kubernetes), Keras, and MLOps.",
    link: "https://github.com/DataTalksClub/machine-learning-zoomcamp",
    tags: ["Machine Learning", "ML Engineering", "Docker", "Kubernetes", "Bootcamp"],
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Practical Deep Learning for Coders",
    creator: "Fast.ai (Jeremy Howard)",
    type: "paid-courses",
    price: "Free",
    description: "A top-rated top-down deep learning course. Teaches how to train state-of-the-art models for computer vision, NLP, tabular data, and collaborative filtering using PyTorch and fastai.",
    link: "https://course.fast.ai/",
    tags: ["Deep Learning", "Fast.ai", "PyTorch", "Practical Coding"],
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=60"
  },

  // YouTube Playlists
  {
    title: "Neural Networks: Zero to Hero",
    creator: "Andrej Karpathy",
    type: "youtube",
    price: "Free",
    description: "An exceptional, highly practical video series building neural networks from scratch, starting with micrograd (autograd engine) and advancing to GPT models.",
    link: "https://youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUbFy1A",
    tags: ["From Scratch", "Transformers", "GPT", "Karpathy", "PyTorch"],
    image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Neural Networks Series",
    creator: "3Blue1Brown",
    type: "youtube",
    price: "Free",
    description: "The absolute best mathematical and visual introduction to neural networks, backpropagation, and gradient descent. A must-watch for conceptual clarity.",
    link: "https://youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi",
    tags: ["Math Foundation", "Backpropagation", "Visual Explanations"],
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Deep Learning with PyTorch for Beginners",
    creator: "freeCodeCamp.org",
    type: "youtube",
    price: "Free",
    description: "A comprehensive course covering PyTorch fundamentals, linear regression, logistic regression, feedforward neural networks, CNNs, and GPU acceleration.",
    link: "https://youtu.be/GIsg-ZUyG5c",
    tags: ["PyTorch", "Deep Learning", "Beginner Friendly"],
    image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Neural Networks from Scratch in Python (NNFS)",
    creator: "Sentdex (Harrison Kinsley)",
    type: "youtube",
    price: "Free",
    description: "Walkthrough of coding neural network components (neurons, activation functions, loss, backpropagation) in pure Python without high-level libraries.",
    link: "https://youtube.com/playlist?list=PLQVvvaa0QuDcjD5BAw2DxE6OFyiJiT5yD",
    tags: ["Pure Python", "Math implementation", "NNFS", "From Scratch"],
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "CS224N: NLP with Deep Learning (Stanford)",
    creator: "Stanford University",
    type: "youtube",
    price: "Free",
    description: "Stanford's premier course covering cutting-edge research in Natural Language Processing, including Word Vectors, RNNs, Transformers, and LLMs.",
    link: "https://youtube.com/playlist?list=PLoROMvodv4rOSH4v6143sYg66B5GIgKG3",
    tags: ["Stanford", "NLP", "Transformers", "Academic Lectures"],
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "StatQuest with Josh Starmer: Machine Learning",
    creator: "Josh Starmer",
    type: "youtube",
    price: "Free",
    description: "Breaking down complex statistical and machine learning concepts (such as SVMs, Random Forests, Gradient Boost, PCA) into easy-to-understand visual guides.",
    link: "https://youtube.com/@statquest",
    tags: ["Statistics", "Algorithms", "Visual Guide", "Basics"],
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Machine Learning Paper Explanations",
    creator: "Yannic Kilcher",
    type: "youtube",
    price: "Free",
    description: "Deep dive explanations of the latest machine learning and deep learning research papers, explaining abstract architectures in developer-friendly terms.",
    link: "https://youtube.com/@YannicKilcher",
    tags: ["Research Papers", "Paper Walkthroughs", "Deep Learning"],
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60"
  },

  // Docs & Guides
  {
    title: "PyTorch Tutorials & Official Documentation",
    creator: "PyTorch Foundation",
    type: "docs",
    price: "Free",
    description: "The primary reference for PyTorch. Features beginner recipes, comprehensive API guides, and deep-dives into tensor operations, autograd, and torch.nn.",
    link: "https://pytorch.org/tutorials/",
    tags: ["PyTorch", "Official Docs", "Model Building", "Tensors"],
    image: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Hugging Face Transformers Course & Docs",
    creator: "Hugging Face",
    type: "docs",
    price: "Free",
    description: "An incredible hands-on interactive guide to using Transformers, Datasets, Tokenizers, and Accelerate libraries for modern NLP, CV, and Audio models.",
    link: "https://huggingface.co/learn/nlp-course/chapter1/1",
    tags: ["Transformers", "Hugging Face", "NLP", "Fine-tuning"],
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "OpenAI Developer Platform Guides",
    creator: "OpenAI",
    type: "docs",
    price: "Free",
    description: "Official guides for integrating GPT models, embeddings, text-to-speech, and vision models. Excellent instructions on API utilization and prompt engineering.",
    link: "https://platform.openai.com/docs/guides/quickstart",
    tags: ["OpenAI API", "GPT Integration", "Prompt Engineering", "Developer Guides"],
    image: "https://images.unsplash.com/photo-1684369175833-3d026938a16c?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Scikit-Learn User Guide & Reference",
    creator: "Scikit-Learn Community",
    type: "docs",
    price: "Free",
    description: "Highly structured reference guide for classic machine learning algorithms, covering classification, regression, clustering, and dimensional reduction.",
    link: "https://scikit-learn.org/stable/user_guide.html",
    tags: ["Scikit-Learn", "Classical ML", "Data Preprocessing", "Evaluation"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Anthropic Prompt Engineering Interactive Tutorial",
    creator: "Anthropic",
    type: "docs",
    price: "Free",
    description: "An interactive Jupyter Notebook tutorial teaching prompt engineering principles, Claude-specific XML tag organization, and few-shot formatting.",
    link: "https://github.com/anthropics/prompt-eng-interactive-tutorial",
    tags: ["Prompt Engineering", "Claude", "Anthropic", "Jupyter"],
    image: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "LangChain Documentation & Guides",
    creator: "LangChain Community",
    type: "docs",
    price: "Free",
    description: "Official guides and references for the leading framework to build context-aware, reasoning applications with Large Language Models.",
    link: "https://python.langchain.com/docs/get_started/introduction",
    tags: ["LangChain", "Agents", "Chains", "LLM Orchestration"],
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "LlamaIndex Documentation & RAG Guides",
    creator: "LlamaIndex Community",
    type: "docs",
    price: "Free",
    description: "Comprehensive guides for building high-performance RAG pipelines, structuring private data, creating custom vector indices, and configuring agentic search workflows.",
    link: "https://docs.llamaindex.ai/",
    tags: ["LlamaIndex", "RAG", "Data Connectors", "Vector Indices"],
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=60"
  },

  // Books
  {
    title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow",
    creator: "Aurélien Géron (O'Reilly)",
    type: "books",
    price: "Paid",
    description: "Widely regarded as the best book for bridge-to-code ML. Focuses on practical engineering with scikit-learn, TensorFlow, and Keras implementation.",
    link: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125837/",
    tags: ["Machine Learning", "Scikit-Learn", "Keras", "TensorFlow"],
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Deep Learning (MIT Press Book)",
    creator: "Ian Goodfellow, Yoshua Bengio, and Aaron Courville",
    type: "books",
    price: "Free Web Version / Paid",
    description: "The mathematical 'bible' of deep learning. Covers applied math concepts, deep networks, optimization algorithms, and advanced theoretical research.",
    link: "https://www.deeplearningbook.org/",
    tags: ["Deep Learning Theory", "Mathematics", "Optimization", "Academia"],
    image: "https://images.unsplash.com/photo-1383569?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Designing Machine Learning Systems",
    creator: "Chip Huyen (O'Reilly)",
    type: "books",
    price: "Paid",
    description: "An essential book for building production-ready ML infrastructure, covering data pipelines, feature stores, monitoring, and continuous deployment systems.",
    link: "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/",
    tags: ["MLOps", "System Design", "Production", "Data Engineering"],
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Artificial Intelligence: A Modern Approach (4th Edition)",
    creator: "Stuart Russell & Peter Norvig",
    type: "books",
    price: "Paid",
    description: "The standard textbook used in universities worldwide. Offers a comprehensive introduction to state search, logic, neural nets, and AI ethics.",
    link: "http://aima.cs.berkeley.edu/",
    tags: ["AI Foundation", "Logic & Search", "Agents", "Ethics"],
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Life 3.0: Being Human in the Age of Artificial Intelligence",
    creator: "Max Tegmark (Knopf)",
    type: "books",
    price: "Paid",
    description: "An engaging, deep philosophical exploration of the future of intelligence, superintelligence alignment, societal impact, and technological singularity.",
    link: "https://www.penguinrandomhouse.com/books/533633/life-30-by-max-tegmark/",
    tags: ["Philosophy", "Alignment", "Superintelligence", "Future of Work"],
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop&q=60"
  },
  {
    title: "Deep Learning with Python (2nd Edition)",
    creator: "François Chollet (Manning)",
    type: "books",
    price: "Paid",
    description: "Written by the creator of Keras, this book offers a gentle yet comprehensive practical guide to deep learning implementation, computer vision, and generative models.",
    link: "https://www.manning.com/books/deep-learning-with-python-second-edition",
    tags: ["Keras", "Deep Learning", "Computer Vision", "Manning"],
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60"
  }
];

async function seedIfEmpty() {
  const count = await prisma.resource.count();
  // Reseed if database is empty or has outdated fields
  if (count < INITIAL_RESOURCES.length) {
    console.log("Database has outdated data. Re-seeding initial AI learning resources...");
    await prisma.resource.deleteMany({});
    await prisma.resource.createMany({
      data: INITIAL_RESOURCES
    });
    console.log(`Seeded ${INITIAL_RESOURCES.length} resources successfully.`);
  }
}

export const resourcesController = new Elysia({ prefix: "/resources" })
  .get("/", async ({ query }) => {
    // Seed database if empty or outdated
    await seedIfEmpty();

    const category = query.category;
    const search = query.search;

    // Fetch all resources sorted newest first
    let dbResources = await prisma.resource.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    // Apply filtering in memory to ensure case-insensitive array matches on tags and desc
    if (category && category !== "all") {
      dbResources = dbResources.filter(item => item.type === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      dbResources = dbResources.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(searchLower);
        const creatorMatch = item.creator.toLowerCase().includes(searchLower);
        const descMatch = item.description.toLowerCase().includes(searchLower);
        const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(searchLower));
        return titleMatch || creatorMatch || descMatch || tagMatch;
      });
    }

    return dbResources;
  })
  .post("/", async ({ body, error }) => {
    const { title, creator, type, price, description, link, tags, image } = body;

    // Basic Validation
    if (!title || !creator || !type || !price || !description || !link) {
      return error(400, { message: "All fields are required" });
    }

    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      return error(400, { message: "Invalid URL link format. Must start with http:// or https://" });
    }

    if (image && !image.startsWith("http://") && !image.startsWith("https://")) {
      return error(400, { message: "Invalid Image URL format. Must start with http:// or https://" });
    }

    // Process Tags
    let processedTags: string[] = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map(t => t.trim().replace(/^#/, "")).filter(Boolean);
    } else if (typeof tags === "string") {
      processedTags = tags.split(",")
        .map(t => t.trim().replace(/^#/, ""))
        .filter(Boolean);
    }

    try {
      const newResource = await prisma.resource.create({
        data: {
          title: title.trim(),
          creator: creator.trim(),
          type: type.trim(),
          price: price.trim(),
          description: description.trim(),
          link: link.trim(),
          tags: processedTags,
          image: image ? image.trim() : null
        }
      });
      return newResource;
    } catch (err: any) {
      console.error("Error creating resource in DB:", err);
      return error(500, { message: err.message || "Failed to create resource" });
    }
  }, {
    body: t.Object({
      title: t.String(),
      creator: t.String(),
      type: t.String(),
      price: t.String(),
      description: t.String(),
      link: t.String(),
      tags: t.Union([t.Array(t.String()), t.String(), t.Undefined()]),
      image: t.Union([t.String(), t.Undefined(), t.Null()])
    })
  });

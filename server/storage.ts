import { 
  users, type User, type InsertUser,
  businessInfos, type BusinessInfo, type InsertBusinessInfo,
  conversations, type Conversation, type InsertConversation, type Message,
  services, type Service, type InsertService,
  caseStudies, type CaseStudy, type InsertCaseStudy,
  type ROIProjection
} from "@shared/schema";

// Storage interface with all required CRUD operations
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Business info
  getBusinessInfo(id: number): Promise<BusinessInfo | undefined>;
  getBusinessInfoByUserId(userId: number): Promise<BusinessInfo | undefined>;
  createBusinessInfo(info: InsertBusinessInfo): Promise<BusinessInfo>;
  
  // Conversations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, messages: Message[]): Promise<Conversation>;
  
  // Services
  getAllServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  getServicesByCategory(category: string): Promise<Service[]>;
  
  // Case studies
  getAllCaseStudies(): Promise<CaseStudy[]>;
  getCaseStudy(id: number): Promise<CaseStudy | undefined>;
  createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>;
  getCaseStudiesByIndustry(industry: string): Promise<CaseStudy[]>;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private businessInfos: Map<number, BusinessInfo>;
  private conversations: Map<number, Conversation>;
  private services: Map<number, Service>;
  private caseStudies: Map<number, CaseStudy>;
  
  private currentUserId: number;
  private currentBusinessInfoId: number;
  private currentConversationId: number;
  private currentServiceId: number;
  private currentCaseStudyId: number;

  constructor() {
    this.users = new Map();
    this.businessInfos = new Map();
    this.conversations = new Map();
    this.services = new Map();
    this.caseStudies = new Map();
    
    this.currentUserId = 1;
    this.currentBusinessInfoId = 1;
    this.currentConversationId = 1;
    this.currentServiceId = 1;
    this.currentCaseStudyId = 1;
    
    // Initialize with some default services
    this.initDefaultServices();
    this.initDefaultCaseStudies();
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Business info
  async getBusinessInfo(id: number): Promise<BusinessInfo | undefined> {
    return this.businessInfos.get(id);
  }
  
  async getBusinessInfoByUserId(userId: number): Promise<BusinessInfo | undefined> {
    return Array.from(this.businessInfos.values()).find(
      (info) => info.userId === userId,
    );
  }
  
  async createBusinessInfo(info: InsertBusinessInfo): Promise<BusinessInfo> {
    const id = this.currentBusinessInfoId++;
    const businessInfo: BusinessInfo = { 
      ...info, 
      id, 
      createdAt: new Date() 
    };
    this.businessInfos.set(id, businessInfo);
    return businessInfo;
  }
  
  // Conversations
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }
  
  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.userId === userId,
    );
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const now = new Date();
    const conversation: Conversation = { 
      ...insertConversation, 
      id,
      createdAt: now,
      updatedAt: now 
    };
    this.conversations.set(id, conversation);
    return conversation;
  }
  
  async updateConversation(id: number, messages: Message[]): Promise<Conversation> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error(`Conversation with id ${id} not found`);
    }
    
    conversation.messages = messages;
    conversation.updatedAt = new Date();
    this.conversations.set(id, conversation);
    return conversation;
  }
  
  // Services
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async createService(service: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const newService: Service = { ...service, id };
    this.services.set(id, newService);
    return newService;
  }
  
  async getServicesByCategory(category: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.category === category,
    );
  }
  
  // Case studies
  async getAllCaseStudies(): Promise<CaseStudy[]> {
    return Array.from(this.caseStudies.values());
  }
  
  async getCaseStudy(id: number): Promise<CaseStudy | undefined> {
    return this.caseStudies.get(id);
  }
  
  async createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy> {
    const id = this.currentCaseStudyId++;
    const newCaseStudy: CaseStudy = { ...caseStudy, id };
    this.caseStudies.set(id, newCaseStudy);
    return newCaseStudy;
  }
  
  async getCaseStudiesByIndustry(industry: string): Promise<CaseStudy[]> {
    return Array.from(this.caseStudies.values()).filter(
      (caseStudy) => caseStudy.industry === industry,
    );
  }
  
  // Initialize with default services
  private initDefaultServices() {
    const defaultServices: InsertService[] = [
      {
        name: "Workflow Automation",
        description: "Eliminate repetitive tasks and streamline processes with custom AI-powered automation solutions.",
        features: ["Custom workflow design", "API integrations", "24/7 automated execution"],
        averageROI: "300%",
        category: "Automation",
        iconKey: "lightning-bolt"
      },
      {
        name: "Predictive Analytics",
        description: "Leverage AI to forecast trends, customer behavior, and business outcomes with precision.",
        features: ["Custom ML models", "Interactive dashboards", "Trend forecasting"],
        averageROI: "250%",
        category: "Analytics",
        iconKey: "chart-pie"
      },
      {
        name: "AI Chatbots & Assistants",
        description: "Enhance customer interactions with intelligent AI assistants that understand context and intent.",
        features: ["Natural language processing", "Multilingual support", "Sentiment analysis"],
        averageROI: "210%",
        category: "Customer Experience",
        iconKey: "users"
      }
    ];
    
    defaultServices.forEach(service => {
      const id = this.currentServiceId++;
      this.services.set(id, { ...service, id });
    });
  }
  
  // Initialize with default case studies
  private initDefaultCaseStudies() {
    const defaultCaseStudies: InsertCaseStudy[] = [
      {
        title: "How We Increased Customer Retention by 47%",
        industry: "SaaS",
        challenge: "Facing a concerning 23% annual churn rate, significantly impacting growth and increasing customer acquisition costs.",
        solution: "We implemented a three-pronged AI approach: 1) Predictive churn analysis using ML to identify at-risk accounts 45 days before likely cancellation, 2) Personalized onboarding flows based on user behavior patterns, 3) Automated feature discovery prompts based on usage analytics.",
        results: "Within 6 months, customer retention improved by 47%, representing $1.2M in saved revenue annually.",
        metrics: {
          "retentionIncrease": "47%",
          "annualSavings": "$1.2M",
          "implementationTime": "6 mo"
        },
        isGenerated: false
      }
    ];
    
    defaultCaseStudies.forEach(caseStudy => {
      const id = this.currentCaseStudyId++;
      this.caseStudies.set(id, { ...caseStudy, id });
    });
  }
}

// Export an instance of the storage
export const storage = new MemStorage();

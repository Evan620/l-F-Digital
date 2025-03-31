import { pgTable, text, serial, integer, json, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Business info schema
export const businessInfos = pgTable("business_infos", {
  id: serial("id").primaryKey(),
  industry: text("industry").notNull(),
  companySize: text("company_size").notNull(),
  annualRevenue: text("annual_revenue").notNull(),
  businessGoal: text("business_goal").notNull(),
  automationLevel: text("automation_level").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBusinessInfoSchema = createInsertSchema(businessInfos).omit({
  id: true,
  createdAt: true,
});

// Chat conversation schema
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  messages: json("messages").$type<Message[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Services schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  features: json("features").$type<string[]>().notNull().default([]),
  averageROI: text("average_roi"),
  category: text("category").notNull(),
  iconKey: text("icon_key"),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

// Case study schema
export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  industry: text("industry").notNull(),
  challenge: text("challenge").notNull(),
  solution: text("solution").notNull(),
  results: text("results").notNull(),
  metrics: json("metrics").$type<Record<string, string>>().notNull().default({}),
  isGenerated: boolean("is_generated").default(false),
});

export const insertCaseStudySchema = createInsertSchema(caseStudies).omit({
  id: true,
});

// Define custom types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BusinessInfo = typeof businessInfos.$inferSelect;
export type InsertBusinessInfo = z.infer<typeof insertBusinessInfoSchema>;

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type CaseStudy = typeof caseStudies.$inferSelect;
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;

// OpenAI request and response types
export type OpenAIServiceRequest = {
  businessChallenge: string;
};

export type OpenAIServiceResponse = {
  serviceSuggestions: Service[];
};

export type OpenAICaseStudyRequest = {
  query: string;
};

export type OpenAICaseStudyResponse = {
  caseStudy: CaseStudy;
};

export type ROIProjection = {
  estimatedROI: string;
  costReduction: string;
  timelineMonths: number;
  potentialSavings: string;
};

export type ROICalculationRequest = {
  industry: string;
  annualRevenue: string;
  businessGoal: string;
  teamSize: number;
  automationLevel: string;
  implementationTimeline: string;
};

export type BusinessSuggestion = {
  title: string;
  description: string;
  roi: string;
};

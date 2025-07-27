import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from "./models.test";
import { isTestEnvironment } from "../constants";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { GoogleGenAI } from "@google/genai";

export const googleAISDKProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GEMINI_AI_KEY,
});

export const googleGenAIProvider = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_AI_KEY,
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        "chat-model": chatModel,
        "chat-model-reasoning": reasoningModel,
        "title-model": titleModel,
        "artifact-model": artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        "chat-model": googleAISDKProvider("gemini-2.5-flash"),
        "chat-model-reasoning": wrapLanguageModel({
          model: googleAISDKProvider("gemini-2.5-pro"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": googleAISDKProvider("gemini-2.5-flash"),
        "artifact-model": googleAISDKProvider("gemini-2.5-flash"),
      },
    });

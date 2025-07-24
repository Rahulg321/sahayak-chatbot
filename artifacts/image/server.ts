import { googleGenAIProvider, myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';
import { GoogleGenAI, Modality } from "@google/genai";
import { google } from "@ai-sdk/google";

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    console.log("inside generate image") 

    try {
      const response = await googleGenAIProvider.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: title,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });     

      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          // Based on the part type, either show the text or save the image
          if (part.text) {
            console.log(part.text);
          } else if (part.inlineData && part.inlineData.data) {
            const imageData = part.inlineData.data;
            
            // Set the draft content to the base64 image data
            draftContent = imageData;
            
            // Write to dataStream
            dataStream.write({
              type: 'data-imageDelta',
              data: imageData,
              transient: true,
            });
          }
        }
      }

      return draftContent;

    } catch (error) {
      console.log("error", error)      
      return draftContent;
    }
  },

  onUpdateDocument: async ({ description, dataStream }) => {
    let draftContent = '';

    console.log("inside update generate image") 

    try {
      const response = await googleGenAIProvider.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: description,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });     

      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.text) {
            console.log(part.text);
          } else if (part.inlineData && part.inlineData.data) {
            const imageData = part.inlineData.data;
            
            draftContent = imageData;

            dataStream.write({
              type: 'data-imageDelta',
              data: imageData,
              transient: true,
            });
          }
        }
      }

      return draftContent;

    } catch (error) {
      console.log("error", error)      
      return draftContent;
    }
  },
});

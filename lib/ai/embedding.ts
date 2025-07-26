import { embed, embedMany } from "ai";
import { embeddings, resources } from "../db/schema";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db/queries";
import { embeddings as embeddingsTable } from "@/lib/db/schema";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { encoding_for_model } from "tiktoken";
import { google } from "@ai-sdk/google";
import { googleGenAIProvider } from "./providers";
import cosineSimilarity from "compute-cosine-similarity";

/**
 * This function is used to split the sheets into chunks of text based on the maxRowsPerChunk
 * It will return an array of objects with the sheet name and the text of the chunk
 *
 * @param sheets - The sheets to split into chunks
 * @param maxRowsPerChunk - The maximum number of rows per chunk
 * @returns An array of objects with the sheet name and the text of the chunk
 */
export function rowsToTextChunks(
  sheets: Record<string, any[][]>,
  maxRowsPerChunk = 20
) {
  const chunks: { sheet: string; text: string }[] = [];

  for (const [sheetName, rows] of Object.entries(sheets)) {
    for (let i = 0; i < rows.length; i += maxRowsPerChunk) {
      const slice = rows.slice(i, i + maxRowsPerChunk);
      const text = slice
        .map((row, idx) => `Row ${i + idx + 1}: ${row.map(String).join(" | ")}`)
        .join("\n");
      chunks.push({ sheet: sheetName, text });
    }
  }

  return chunks;
}

export async function generateChunksFromText(text: string) {
  const encoder = encoding_for_model("text-embedding-3-small");

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000, // Maximum tokens per chunk
    chunkOverlap: 200, // 20% overlap to preserve context
    separators: ["\n\n", "\n", " ", ""], // Logical split points
    lengthFunction: (text: string) => {
      const tokens = encoder.encode(text);
      return tokens.length;
    },
  });

  // Split the text into chunks
  const chunks = await textSplitter.createDocuments([text]);

  encoder.free();

  console.log("Chunks generated:", chunks);

  return { chunks };
}

export function chunkTokens(tokens: number[], chunkSize = 800, overlap = 100) {
  const chunks: number[][] = [];
  for (let start = 0; start < tokens.length; start += chunkSize - overlap) {
    const slice = tokens.slice(start, start + chunkSize);
    chunks.push(slice);
  }
  return chunks;
}

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
};

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  console.log("Generating embeddings for value:", value);
  const chunks = generateChunks(value);
  console.log("Chunks generated:", chunks);

  const response = await googleGenAIProvider.models.embedContent({
    model: "gemini-embedding-001",
    contents: chunks,
    config: {
      outputDimensionality: 1536,
    },
  });

  const embeddings = response.embeddings?.map((e) => e.values);

  return (
    embeddings?.map((e, i) => ({
      content: chunks[i],
      embedding: e ?? [],
    })) ?? []
  );
};

export const generateEmbeddingsFromChunks = async (
  chunks: string[]
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const encoder = encoding_for_model("text-embedding-3-small");
  const maxTokens = 300000;
  const batches: string[][] = [];
  let currentBatch: string[] = [];
  let currentTokenCount = 0;

  for (const chunk of chunks) {
    const tokens = encoder.encode(chunk);
    if (
      currentTokenCount + tokens.length > maxTokens &&
      currentBatch.length > 0
    ) {
      batches.push(currentBatch);
      currentBatch = [];
      currentTokenCount = 0;
    }
    currentBatch.push(chunk);
    currentTokenCount += tokens.length;
  }
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  let allEmbeddings: Array<{ embedding: number[]; content: string }> = [];
  for (const batch of batches) {
    const response = await googleGenAIProvider.models.embedContent({
      model: "gemini-embedding-001",
      contents: batch,
      config: {
        outputDimensionality: 1536,
      },
    });

    allEmbeddings = allEmbeddings.concat(
      response?.embeddings?.map((e, i) => ({
        embedding: e.values ?? [],
        content: batch[i],
      })) ?? []
    );
  }
  encoder.free();
  return allEmbeddings;
};

/**
 * Generate an embedding for a given value
 * @param value - The value to generate an embedding for
 * @returns The embedding for the given value
 */
export const generateEmbedding = async (value: string): Promise<number[]> => {
  console.log("Generating embedding for value:", value);
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: google.textEmbeddingModel("text-embedding-004"),
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  console.log("Finding relevant content for user query:", userQuery);

  // Generate embedding for the user query
  const userQueryEmbedded = await generateEmbedding(userQuery);

  // Calculate similarity using cosine distance
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded
  )})`;

  // Query for similar content with improved filtering and ranking
  const similarGuides = await db
    .select({
      content: embeddingsTable.content,
      similarity,
      // Add metadata if available in your schema
      resourceId: embeddingsTable.resourceId,
    })
    .from(embeddingsTable)
    // Lower threshold for more matches, but still maintain quality
    .where(gt(similarity, 0.4))
    // Order by similarity for best matches first
    .orderBy((t) => desc(t.similarity))
    // Increase limit for more context
    .limit(6);

  // Filter out very low similarity matches
  const filteredGuides = similarGuides.filter(
    (guide) => guide.similarity > 0.5
  );

  console.log("Similar guides found:", filteredGuides);

  // Return the most relevant content
  return filteredGuides;
};

// export const findRelevantContent = async (userQuery: string) => {
//   // 1. Generate user embedding
//   const userEmbedding = await generateEmbedding(userQuery);

//   // 2. Query using pgvector operator and index
//   const similarGuides = await db
//     .select({
//       content: embeddingsTable.content,
//       similarity: sql<number>`
//         1 - ( ${embeddingsTable.embedding} <=> ${userEmbedding} )
//       `,
//     })
//     .from(embeddingsTable)
//     .orderBy(sql`${embeddingsTable.embedding} <=> ${userEmbedding}`)
//     .limit(4);

//   console.log("Similar guides found:", similarGuides);

//   return similarGuides;
// };

// Helper function to chunk sentences by word count
export function chunkSentencesByWords(
  sentences: string[],
  maxWords: number,
  overlap: number
): string[] {
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentWordCount = 0;
  let i = 0;

  while (i < sentences.length) {
    const sentence = sentences[i];
    const wordCount = sentence.split(/\s+/).length;
    if (currentWordCount + wordCount > maxWords && currentChunk.length > 0) {
      chunks.push(currentChunk.join(" "));
      // Overlap: go back by enough sentences to cover the overlap
      let overlapWords = 0;
      let j = currentChunk.length - 1;
      while (j >= 0 && overlapWords < overlap) {
        overlapWords += currentChunk[j].split(/\s+/).length;
        j--;
      }
      currentChunk = currentChunk.slice(j + 1);
      currentWordCount = currentChunk.reduce(
        (sum, s) => sum + s.split(/\s+/).length,
        0
      );
    }
    currentChunk.push(sentence);
    currentWordCount += wordCount;
    i++;
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }
  return chunks;
}

export const findRelevantForASpecificCompany = async (
  userQuery: string,
  companyId: string
) => {
  console.log("Finding relevant content for user query:", userQuery);
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded
  )})`;

  const similarGuides = await db
    .select({
      embeddingId: embeddingsTable.id,
      embeddingContent: embeddingsTable.content,
      similarity,
    })
    .from(embeddingsTable)
    .innerJoin(resources, sql`${embeddingsTable.resourceId} = ${resources.id}`)
    .where(sql`${similarity} > 0.5`)
    .orderBy((t) => desc(t.similarity))
    .limit(2);

  console.log("Similar guides found:", similarGuides);

  return similarGuides;
};

import { Artifact } from '@/components/create-artifact';
import { DocumentSkeleton } from '@/components/document-skeleton';
import {
  ClockRewind,
  CopyIcon,
  MessageIcon,
  PenIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons';
import type { Suggestion } from '@/lib/db/schema';
import { toast } from 'sonner';
import { getSuggestions } from '../actions';

interface MindmapArtifactMetadata {
  suggestions: Array<Suggestion>;
}

// Simple mindmap visualization component
const MindmapVisualizer = ({ content }: { content: string }) => {
  let mindmapData;
  


  try {
    if (content?.trim()) mindmapData = JSON.parse(content);
    else throw new Error('Empty mindmap content');
  } catch (e) {
    console.error(e);
    // render fallback…
  } 

 console.log("mindmapData", mindmapData) 


const renderNode = (node: any, level: number = 0) => (
      <div key={node.id} className="ml-4">
        <div className={`p-2 rounded border ${level === 0 ? 'bg-blue-100' : 'bg-gray-50'}`}>
          {node.text}
        </div>
        {node.children && node.children.length > 0 && (
          <div className="ml-4 mt-2">
            {node.children.map((child: any) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );

    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Mindmap Visualization</h3>
        {mindmapData ? renderNode(mindmapData) : <p>Invalid mindmap data</p>}
      </div>
    );
  
};

export const mindmapArtifact = new Artifact<'mindmap', MindmapArtifactMetadata>({
  kind: 'mindmap',
  description: 'Create and visualize mindmaps for brainstorming and organization.',
  initialize: async ({ documentId, setMetadata }) => {
    const suggestions = await getSuggestions({ documentId });

    setMetadata({
      suggestions,
    });
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === 'data-suggestion') {
      setMetadata((metadata) => {
        return {
          suggestions: [...metadata.suggestions, streamPart.data],
        };
      });
    }

    if (streamPart.type === 'data-mindmapDelta') {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: streamPart.data, // Replace content instead of appending
          isVisible: true, // Show immediately since we have complete JSON
          status: 'streaming',
        };
      });
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="mindmap" />;
    }

    if (mode === 'diff') {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Version Comparison</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Previous Version</h4>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">{oldContent}</pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">Current Version</h4>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">{newContent}</pre>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-row py-8 md:p-20 px-4">
        <div className="flex-1">
          <MindmapVisualizer content={content} />
        </div>

        {metadata?.suggestions && metadata.suggestions.length > 0 ? (
          <div className="md:hidden h-dvh w-12 shrink-0" />
        ) : null}
      </div>
    );
  },
  actions: [
    {
      icon: <ClockRewind size={18} />,
      description: 'View changes',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('toggle');
      },
      isDisabled: ({ currentVersionIndex }) => {
        return currentVersionIndex === 0;
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        return currentVersionIndex === 0;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        return isCurrentVersion;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy to clipboard',
      onClick: ({ content }) => {
        console.log("content", content)
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [
    {
      icon: <PenIcon />,
      description: 'Expand mindmap',
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: 'user',
          parts: [
            {
              type: 'text',
              text: 'Please expand this mindmap with more detailed branches and sub-topics.',
            },
          ],
        });
      },
    },
    {
      icon: <MessageIcon />,
      description: 'Request suggestions',
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: 'user',
          parts: [
            {
              type: 'text',
              text: 'Please suggest additional topics or connections that could be added to this mindmap.',
            },
          ],
        });
      },
    },
  ],
}); 
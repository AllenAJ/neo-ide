// src/components/CodeEditor.tsx
import React from 'react';
import Editor from "@monaco-editor/react";
import { Loader } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange,
  readOnly = false
}) => {
  return (
    <div className="relative w-full h-full">
      <Editor
        className="min-h-[50vh] border border-gray-700 rounded-lg overflow-hidden"
        defaultLanguage="sol"
        theme="vs-dark"
        value={code}
        loading={
          <div className="flex items-center justify-center h-full gap-2 text-white bg-[#1e1e1e]">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Loading Editor...</span>
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 1.5,
          tabSize: 2,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10
          }
        }}
        onChange={onChange}
      />
    </div>
  );
};

export default CodeEditor;
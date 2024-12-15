import React, { useEffect, useState } from 'react';
import Editor, { Monaco } from "@monaco-editor/react";
import { Loader } from 'lucide-react';
import { editor, Position, CancellationToken, languages, KeyMod, KeyCode } from 'monaco-editor';
import { toast } from 'sonner';

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
  const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.register({ id: 'solidity' });

    monaco.languages.setMonarchTokensProvider('solidity', {
      keywords: [
        'pragma', 'contract', 'library', 'interface', 'function', 'modifier',
        'event', 'struct', 'enum', 'mapping', 'public', 'private', 'internal',
        'external', 'pure', 'view', 'payable', 'memory', 'storage', 'calldata',
        'returns', 'return', 'if', 'else', 'for', 'while', 'do', 'break',
        'continue', 'throw', 'emit', 'try', 'catch', 'revert', 'require',
        'assert', 'override', 'virtual', 'immutable', 'constructor', 'fallback',
        'receive', 'assembly', 'using', 'is', 'new', 'delete', 'abstract',
        'constant', 'default', 'from', 'import', 'implements', 'indexed'
      ],
      typeKeywords: [
        'address', 'bool', 'string', 'uint', 'int', 'fixed', 'ufixed', 'byte',
        'bytes', 'bytes1', 'bytes2', 'bytes3', 'bytes4', 'bytes5', 'bytes6',
        'bytes7', 'bytes8', 'bytes9', 'bytes10', 'bytes11', 'bytes12', 
        'bytes13', 'bytes14', 'bytes15', 'bytes16', 'bytes17', 'bytes18',
        'bytes19', 'bytes20', 'bytes21', 'bytes22', 'bytes23', 'bytes24',
        'bytes25', 'bytes26', 'bytes27', 'bytes28', 'bytes29', 'bytes30',
        'bytes31', 'bytes32', 'uint8', 'uint16', 'uint24', 'uint32', 'uint40',
        'uint48', 'uint56', 'uint64', 'uint72', 'uint80', 'uint88', 'uint96',
        'uint104', 'uint112', 'uint120', 'uint128', 'uint136', 'uint144',
        'uint152', 'uint160', 'uint168', 'uint176', 'uint184', 'uint192',
        'uint200', 'uint208', 'uint216', 'uint224', 'uint232', 'uint240',
        'uint248', 'uint256', 'int8', 'int16', 'int24', 'int32', 'int40',
        'int48', 'int56', 'int64', 'int72', 'int80', 'int88', 'int96',
        'int104', 'int112', 'int120', 'int128', 'int136', 'int144',
        'int152', 'int160', 'int168', 'int176', 'int184', 'int192',
        'int200', 'int208', 'int216', 'int224', 'int232', 'int240',
        'int248', 'int256'
      ],
      constants: [
        'true', 'false', 'wei', 'gwei', 'ether', 'seconds', 'minutes',
        'hours', 'days', 'weeks', 'years'
      ],
      operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
        '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
        '%=', '<<=', '>>=', '>>>='
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, { 
            cases: {
              '@keywords': 'keyword',
              '@typeKeywords': 'type',
              '@constants': 'constant',
              '@default': 'identifier'
            }
          }],
          [/[{}()\[\]]/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/\d+/, 'number'],
          [/[;,.]/, 'delimiter'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/\\[btnfr"'\\]/, 'string.escape'],
          [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ]
      }
    });

    monaco.languages.registerCompletionItemProvider('solidity', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const snippets = [
          {
            label: 'contract',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'contract ${1:ContractName} {',
              '\tconstructor() {',
              '\t\t$0',
              '\t}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Contract template',
            range: range
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'function ${1:functionName}(${2:params}) ${3:public} {',
              '\t$0',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Function template',
            range: range
          },
          {
            label: 'event',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'event ${1:EventName}(',
              '\t${2:paramType} indexed ${3:paramName}',
              ');'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Event template',
            range: range
          },
          {
            label: 'modifier',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'modifier ${1:modifierName}(${2:params}) {',
              '\t_;',
              '\t$0',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Modifier template',
            range: range
          },
          {
            label: 'struct',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'struct ${1:StructName} {',
              '\t${2:type} ${3:variable};',
              '\t$0',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Struct template',
            range: range
          },
          {
            label: 'enum',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'enum ${1:EnumName} {',
              '\t${2:Member1},',
              '\t${3:Member2}',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Enum template',
            range: range
          },
          {
            label: 'mapping',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'mapping(${1:keyType} => ${2:valueType}) ${3:public} ${4:variableName};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Mapping declaration',
            range: range
          },
          {
            label: 'require',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'require(${1:condition}, "${2:error message}");',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Require statement',
            range: range
          },
          {
            label: 'constructor',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'constructor(${1:params}) {',
              '\t$0',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Constructor template',
            range: range
          }
        ];

        return { suggestions: snippets };
      }
    });

    setMonacoInstance(monaco);
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
      console.log('Save command triggered');
      toast.success('Changes saved');
    });

    editor.addCommand(KeyMod.Alt | KeyMod.Shift | KeyCode.KeyF, () => {
      const formatAction = editor.getAction('editor.action.formatDocument');
      if (formatAction) {
        formatAction.run().then(() => {
          toast.success('Code formatted');
        }).catch((error) => {
          console.error('Format error:', error);
          toast.error('Failed to format code');
        });
      } else {
        toast.error('Format action not available');
      }
    });

    // Add custom actions
    editor.addAction({
      id: 'solidity-format',
      label: 'Format Solidity Code',
      keybindings: [KeyMod.Alt | KeyMod.Shift | KeyCode.KeyF],
      run: (ed) => {
        const formatAction = ed.getAction('editor.action.formatDocument');
        if (formatAction) {
          return formatAction.run();
        }
      }
    });
  };

  return (
    <div className="relative w-full h-full">
      <Editor
        className="min-h-[50vh] border border-gray-700 rounded-lg overflow-hidden"
        defaultLanguage="solidity"
        theme="vs-dark"
        value={code}
        loading={
          <div className="flex items-center justify-center h-full gap-2 text-white bg-[#1e1e1e]">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Loading Editor...</span>
          </div>
        }
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
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
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true
          },
          formatOnPaste: true,
          formatOnType: true,
        }}
        onChange={onChange}
      />
    </div>
  );
};

export default CodeEditor;
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  BLUR_COMMAND,
  COMMAND_PRIORITY_LOW
} from "lexical"

import { $generateNodesFromDOM } from "@lexical/html"

import {LexicalComposer} from '@lexical/react/LexicalComposer'
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin'
import {ContentEditable} from '@lexical/react/LexicalContentEditable'
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin'
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'

import useEditableBlockProps from '../hooks/useEditableBlockProps'

const DEFAULT_PROPS = {
  ...useEditableBlockProps.defaultProps,
  style: { whiteSpace: 'pre-wrap', padding: '1em' },
  components: {
    block: ({ content, verbose, options, ...props }) => (<div className='block' {...props} />),
  },
}

export default function EditableBlock({
  content,
  onContent,
  decorators,
  style,
  onClick,
  onInput,
  components: _components,
  options,
  index,
  verbose = false,
  ...props
}) {
  const components = { ...DEFAULT_PROPS.components, ..._components };
  const [textCache, setTextCache] = useState(content);
  const [initialText, setInitialText] = useState();

  useEffect(() => {
    if (verbose) console.log("EditableBlock First Render");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { editIndex, save, ...editableBlockProps } = useEditableBlockProps({
    content,
    onContent,
    decorators,
    options,
  });

  const blockProps = {
    content,
    style,
    onClick,
    index,
    verbose,
    options,
    ...editableBlockProps,
    ...props,
  };

  // eslint-disable-next-line react/prop-types
  const OnChangePlugin = ({ onChange }) => {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
      return editor.registerUpdateListener((listener) => {
        let retObj = {};
        listener.prevEditorState.read(
          () => (retObj.prevText = $getRoot()?.__cachedText)
        );
        listener.editorState.read(
          () => (retObj.curText = $getRoot()?.__cachedText)
        );
        setTextCache(retObj.curText);
        onChange && onChange(retObj);
      });
    }, [editor, onChange]);

    return null;
  };

  const lexicalConfig = {
    namespace: "Lexical Editor (replacing Xelah)",
    onError: (e) => {
      console.log("ERROR:", e);
    },
  };

  // eslint-disable-next-line react/prop-types
  const LoadInitialContent = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
      if (initialText || !textCache) {
        return;
      }
      editor.update(() => {
        const htmlMode = options?.returnHtml;
        const root = $getRoot();
        root.clear();
        if (htmlMode) {
          const parser = new DOMParser();
          const dom = parser.parseFromString(textCache, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);
          root.append(...nodes);
        } else {
          const p = $createParagraphNode();
          p.append($createTextNode(textCache));
          root.append(p);
        }
        setInitialText(textCache);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
  };

  // eslint-disable-next-line react/prop-types
  const OnEditorBlurPlugin = ({ onBlur }) => {
    const [editor] = useLexicalComposerContext();

    useEffect(
      () =>
        editor.registerCommand(
          BLUR_COMMAND,
          () => {
            onBlur && onBlur(textCache);
            return false;
          },
          COMMAND_PRIORITY_LOW
        ),
      [editor, onBlur]
    );

    return null;
  };

  return (
    <LexicalComposer initialConfig={lexicalConfig}>
      <PlainTextPlugin
        contentEditable={
          <ContentEditable
            style={{
              position: "relative",
              border: "none",
              maxWidth: "100%",
              padding: "1px",
            }}
          />
        }
        placeholder={<div></div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <LoadInitialContent initialContent={initialText} />
      <OnChangePlugin onChange={onInput} />
      <OnEditorBlurPlugin onBlur={onContent} />
    </LexicalComposer>
  );
}

EditableBlock.propTypes = {
  /** Text to be edited whether file, section or block */
  content: PropTypes.string.isRequired,
  /** Function triggered on edit */
  onContent: PropTypes.func,
  /** Options for the editor */
  options: PropTypes.shape({
    /** Editable? */
    editable: PropTypes.bool,
    /** Return html instead of text */
    returnHtml: PropTypes.bool,
  }),
  /** Components to wrap all sections of the document */
  components: PropTypes.shape({
    /** Component to be the block editor */
    block: PropTypes.func,
  }),
  /** Object of replacers for html/css decoration of text */
  decorators: PropTypes.object,
  /** Callback triggered on Block click, provides block text and index. */
  onClick: PropTypes.func,
  /** Callback triggered on Block input - i.e. Editor has changed content */
  onInput: PropTypes.func,
  /** css styles for the editable component */
  style: PropTypes.object,
  /** Index to use and reference for rendering */
  index: PropTypes.number,
  /** Flag to enable logging  */
  verbose: PropTypes.bool,
}

EditableBlock.defaultProps = DEFAULT_PROPS
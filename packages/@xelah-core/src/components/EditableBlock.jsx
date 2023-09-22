/* eslint-disable no-unused-vars */
/* eslint-disable react/display-name */
import React, { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'

import { 
  $getRoot, 
  $createParagraphNode,
  $createTextNode,
  $getSelection 
} from "lexical"

import {LexicalComposer} from '@lexical/react/LexicalComposer'
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin'
import {ContentEditable} from '@lexical/react/LexicalContentEditable'
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin'
// import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin'
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
  const components = { ...DEFAULT_PROPS.components, ..._components }
  const { block: Block } = components || {}

  useEffect(() => {
    if (verbose) console.log("EditableBlock First Render");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { 
    editIndex, 
    save, 
    ...editableBlockProps 
  } = useEditableBlockProps({ 
    content, 
    onContent, 
    decorators, 
    options 
  })

  const blockProps = {
    content,
    style,
    onClick,
    index,
    verbose,
    options,
    ...editableBlockProps,
    ...props
  }

  const OnChangePlugin = () => {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
      return editor.registerUpdateListener((listener) => {
        console.log("DATA", listener.editorState.toJSON());
        console.log(listener);
      });
    }, [editor]);

    return null;
  };

  function prepopulatedText() {
    const root = $getRoot();
    root.clear();
    const p = $createParagraphNode();
    p.append(
      $createTextNode(content)
    );
    root.append(p);
  }

  const lexicalConfig = {
    editorState: () => prepopulatedText(),
    namespace: "Lexical Editor (replacing Xelah)",
    onError: (e) => {
      console.log("ERROR:", e);
    },
  };

  return (
    // <Block key={editIndex + content} {...blockProps} />
    <LexicalComposer initialConfig={lexicalConfig}>
      <PlainTextPlugin
        contentEditable={<ContentEditable
          style={{
            position: "relative",
            borderColor: "rgba(255,211,2,0.68)",
            border: "2px solid red",
            borderRadius: "5px",
            maxWidth: "100%",
            padding: "10px",
          }}
        />}
        placeholder={<div></div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <OnChangePlugin onChange={onInput} />
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
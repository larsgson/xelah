/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import { useCallback, useState } from 'react';
import { useDeepCompareMemo, useDeepCompareCallback } from 'use-deep-compare';
import PropTypes from 'prop-types';

const DEFAULT_PROPS = {
  content: '',
  onContent: (content) => { console.warn('EditableBlock.onContent() not provided:\n\n', content); },
  options: {
    editable: true,
  },
  decorators: {},
};

export default function useEditableBlockProps({
  content,
  onContent,
  onInput,
  decorators: _decorators,
  options: _options,
}) {
  const { returnHtml, editable, preview } = { ...DEFAULT_PROPS.options, ..._options };

  const [editIndex, setEditIndex] = useState(0);

  // console.log(_options);
  // console.log(_decorators);

  const __html = useDeepCompareMemo(() => {
    let ___html = content;
    const decorators = !returnHtml ?
      { embededHtml: [/</g, "&lt;"], ..._decorators } :
      { spanPadding: [/<\/span>/g, "</span>\u200B"], ..._decorators };

    if (Object.keys(decorators).length > 0) {
      Object.keys(decorators).forEach((name) => {
        const [regex, replacer] = decorators[name];
        ___html = ___html.replace(regex, replacer);
      });
    };
    return ___html;
  }, [content, returnHtml, _decorators, preview]);

  const props = useDeepCompareMemo(() => ({
    editIndex,
    contentEditable: editable,
    // dangerouslySetInnerHTML: { __html },
    suppressContentEditableWarning: true,
    onInput,
  }), [editable, __html, onInput, editIndex]);
  return props;
};

useEditableBlockProps.propTypes = {
  /** Text to be edited whether file, section or block */
  content: PropTypes.string.isRequired,
  /** Function triggered on edit */
  onContent: PropTypes.func,
  /** Function triggered on input */
  onInput: PropTypes.func,
  /** Options for the editor */
  options: PropTypes.shape({
    /** Editable? */
    editable: PropTypes.bool,
    /** Return html instead of text */
    returnHtml: PropTypes.bool,
  }),
  /** Object of replacers for html/css decoration of text */
  decorators: PropTypes.object,
  /** Callback triggered on Block click, provides block text and index. */
  onClick: PropTypes.func,
};

useEditableBlockProps.defaultProps = DEFAULT_PROPS;